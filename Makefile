# Retrieve latest pack version
PACK_VERSION?=
GITHUB_TOKEN?=
SERVE_PORT=1313
BASE_URL?=

ifndef BASE_URL
ifdef GITPOD_WORKSPACE_URL
BASE_URL=$(shell echo "$(GITPOD_WORKSPACE_URL)" | sed -r 's;^([^/]*)//(.*);\1//$(SERVE_PORT)-\2;')
endif
endif

GITHUB_API_OPTS:=
ifdef GITHUB_TOKEN
GITHUB_API_OPTS+=-H "Authorization: token $(GITHUB_TOKEN)"
endif

ifndef PACK_VERSION
PACK_VERSION:=$(shell curl -sSL $(GITHUB_API_OPTS) https://api.github.com/repos/buildpacks/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
endif

.PHONY: default
default: serve

.PHONY: clean
clean:
	rm -rf ./public ./resources $(TOOLS_BIN)

TOOLS_BIN:=tools/bin
$(TOOLS_BIN):
	mkdir $(TOOLS_BIN)

# adapted from https://stackoverflow.com/a/12099167/552902
HUGO_OS:=Linux
HUGO_ARCH:=32bit
HUGO_EXT:=tar.gz
ifeq ($(OS),Windows_NT)
	HUGO_OS:=Windows
	HUGO_EXT:=zip
ifeq ($(PROCESSOR_ARCHITECTURE),AMD64)
	HUGO_ARCH:=64bit
endif
else
ifeq ($(shell uname -s),Darwin)
	HUGO_OS:=macOS
endif
UNAME_M:=$(shell uname -m)
ifneq ($(filter %64,$(UNAME_M)),)
	HUGO_ARCH:=64bit
endif
ifneq ($(filter arm%,$(UNAME_M)),)
	HUGO_ARCH:=ARM64
endif
endif

HUGO_RELEASES_CACHE:=tools/bin/hugo-releases
$(HUGO_RELEASES_CACHE): | $(TOOLS_BIN)
	curl -sSL $(GITHUB_API_OPTS) https://api.github.com/repos/gohugoio/hugo/releases/latest > $(HUGO_RELEASES_CACHE)

HUGO_BIN:=tools/bin/hugo
$(HUGO_BIN): $(HUGO_RELEASES_CACHE)
$(HUGO_BIN):
	@echo "> Installing hugo for $(HUGO_OS) ($(HUGO_ARCH))..."
	curl -sSL -o $(HUGO_BIN).$(HUGO_EXT) $(shell cat $(HUGO_RELEASES_CACHE) | jq -r '[.assets[] | select (.name | test("extended.*$(HUGO_OS)-$(HUGO_ARCH).*$(HUGO_EXT)"))][0] | .browser_download_url')
ifeq ($(HUGO_EXT), zip)
	unzip $(HUGO_BIN).$(HUGO_EXT) -d $(TOOLS_BIN)
else
	tar mxfz $(HUGO_BIN).$(HUGO_EXT) -C $(TOOLS_BIN) hugo
endif

.PHONY: upgrade-pack
upgrade-pack: pack-version
	@echo "> Upgrading pack library version $(PACK_VERSION)"
	cd tools; go get github.com/buildpacks/pack@v$(PACK_VERSION)

.PHONY: install-pack-cli
install-pack-cli: export PACK_BIN:=$(shell which pack)
install-pack-cli: upgrade-pack
	@echo "> Installing pack bin..."
	@if [ -z "$(PACK_BIN)" ]; then \
		cd tools; go install github.com/buildpacks/pack/cmd/pack; \
	else \
		echo "pack already installed at $(PACK_BIN)"; \
	fi
	@echo "pack version: " `pack --version`

.PHONY: check-pack-cli-version
check-pack-cli-version:
	@echo "> Installed pack version: " `pack --version | cut -d '+' -f 1`
	@if [ `pack --version | cut -d '+' -f 1` != "$(PACK_VERSION)" ]; then \
		echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"; \
		echo "WARNING: Expected pack version: $(PACK_VERSION)"; \
		echo "You may need to upgrade your version of pack!  "; \
		echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"; \
	fi

.PHONY: install-ugo
install-ugo:
	@echo "> Installing ugo..."
	cd tools; go install github.com/jromero/ugo/cmd/ugo@0.0.4

.PHONY: pack-docs-update
pack-docs-update: upgrade-pack
	@echo "> Updating Pack CLI Documentation"
	@echo "> SHA of contents (before update):" `find ./content/docs/tools/pack -type f -print0 | xargs -0 sha1sum | sha1sum | cut -d' ' -f1`
	cd tools; go run -mod=mod get_pack_commands.go
	@echo "> SHA of contents (after update):" `find ./content/docs/tools/pack -type f -print0 | xargs -0 sha1sum | sha1sum | cut -d' ' -f1`

.PHONY: pack-version
pack-version: export PACK_VERSION:=$(PACK_VERSION)
pack-version:
	@echo "> Ensuring pack version is set..."
	@test ! -z '${PACK_VERSION}'
	@test '${PACK_VERSION}' != 'null'
	@echo "PACK_VERSION="${PACK_VERSION}""

.PHONY: serve
serve: export PACK_VERSION:=$(PACK_VERSION)
serve: $(HUGO_BIN) pack-version pack-docs-update
	@echo "> Serving..."
ifeq ($(BASE_URL),)
	$(HUGO_BIN) server --disableFastRender --port=$(SERVE_PORT)
else
	$(HUGO_BIN) server --disableFastRender --port=$(SERVE_PORT) --baseURL=$(BASE_URL) --appendPort=false
endif

.PHONY: build
build: export PACK_VERSION:=$(PACK_VERSION)
build: $(HUGO_BIN) pack-version pack-docs-update
	@echo "> Building..."
	$(HUGO_BIN)

.PHONY: test
test: install-pack-cli check-pack-cli-version install-ugo
	@echo "> Testing..."
	ugo run -r -p ./content/docs/

.PHONY: htmltest-install
htmltest-install:
	@if ! test -f ./bin/htmltest; then \
	  echo "> Installing htmltest..."; \
	  curl https://htmltest.wjdp.uk | bash; \
	fi;

.PHONY: htmltest-run
htmltest-run: htmltest-install build
	@echo "> Checking links..."
	./bin/htmltest ./public -l 3 -s 2>&1 > /dev/null || true

.PHONY: check-links
check-links: htmltest-run
check-links: ERRORS=$(shell cat ./tmp/.htmltest/htmltest.log | grep -i "does not exist")
check-links:
	@if [ ! -z "$(ERRORS)" ]; then \
	  echo "ERROR: found broken links:"; \
	  cat ./tmp/.htmltest/htmltest.log | grep -i "does not exist"; \
	  exit 1; \
	else \
	  echo "No broken links found."; \
	fi;

.PHONY: tools-tidy
tools-tidy:
	cd tools; go mod tidy

.PHONY: prepare-for-pr
prepare-for-pr: check-links test tools-tidy katacoda
	@echo "========"
	@echo "It looks good! :)"
	@echo "Make sure to commit all changes!"
	@echo "========"

.PHONY: katacoda
katacoda:
	@echo "========"
	@echo "Generating Katacoda docs..."
	@go run katacoda/main.go
	@echo "All done!"
	@echo "========"

.PHONY: check-katacoda
check-katacoda: katacoda
	@echo "Checking if Katacoda docs are up-to-date..."
	@git diff --quiet HEAD -- katacoda/scenarios || ( echo "Katacoda docs are not up-to-date! Please run 'make katacoda' and commit the katacoda/scenarios folder" && exit 1)
	@echo "All katacoda docs are up-to-date"