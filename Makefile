# Retrieve latest pack version
PACK_VERSION?=
GITHUB_TOKEN?=
PACK_BIN?=$(shell which pack)
SERVE_PORT=1313
BASE_URL?=
HUGO_BIN=./tools/bin/hugo

#retreive latest hugo version
_latestver:=$(shell curl --silent "https://api.github.com/repos/gohugoio/hugo/tags" | jq -r '.[0].name' | tr -d v)

ifndef BASE_URL
ifdef GITPOD_WORKSPACE_URL
BASE_URL=$(shell echo "$(GITPOD_WORKSPACE_URL)" | sed -r 's;^([^/]*)//(.*);\1//$(SERVE_PORT)-\2;')
endif
endif

ifndef PACK_VERSION
ifdef GITHUB_TOKEN
PACK_VERSION:=$(shell curl -s -H "Authorization: token $(GITHUB_TOKEN)" https://api.github.com/repos/buildpacks/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
else
PACK_VERSION:=$(shell curl -s https://api.github.com/repos/buildpacks/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
endif
endif

.PHONY: default
default: serve

.PHONY: clean
clean:
	rm -rf ./public ./resources

.PHONY: install-hugo
install-hugo:

	@echo "> Installing hugo..."
	@echo "This may take a while depending on your connection."

ifeq ($(OS),Windows_NT)
	@echo $(shell uname -s)	;
	cd tools; mkdir bin; cd bin; curl -s -L -O $(shell curl -s https://api.github.com/repos/gohugoio/hugo/releases/latest | jq -r '.assets[30].browser_download_url')
else
	ifeq ($(shell uname -s),Darwin)
		@echo $(shell uname -s)
		cd tools; mkdir bin; cd bin; curl -s -L -O $(shell curl -s https://api.github.com/repos/gohugoio/hugo/releases/latest | jq -r '.assets[28].browser_download_url'); tar xvfz hugo_extended_${_latestver}_macOS-64bit.tar.gz
	else
		@echo $(shell uname -s)
		cd tools; mkdir bin; cd bin; curl -s -L -O $(shell curl -s  https://api.github.com/repos/gohugoio/hugo/releases/latest | jq -r '.assets[27].browser_download_url'); tar xvfz hugo_extended_${_latestver}_Linux-64bit.tar.gz
	endif
endif


	

.PHONY: upgrade-pack
upgrade-pack: pack-version
	@echo "> Upgrading to pack version $(PACK_VERSION)"
	cd tools; go get github.com/buildpacks/pack@v$(PACK_VERSION)

.PHONY: install-pack-cli
install-pack-cli: upgrade-pack
	@echo "> Installing pack bin..."
ifeq ($(PACK_BIN),)
	cd tools; go get github.com/buildpacks/pack/cmd/pack
else
	@echo "pack already installed at $(PACK_BIN)"
endif

.PHONY: install-ugo
install-ugo:
	@echo "> Installing ugo..."
	cd tools; go get github.com/jromero/ugo/cmd/ugo@0.0.3

.PHONY: pack-docs-update
pack-docs-update: upgrade-pack
	@echo "> Updating Pack CLI Documentation"
	@echo "> SHA of contents (before update):" `find ./content/docs/tools/pack -type f -print0  | xargs -0 sha1sum | sha1sum | cut -d' ' -f1`
	cd tools; go run -mod=mod get_pack_commands.go
	@echo "> SHA of contents (after update):" `find ./content/docs/tools/pack -type f -print0  | xargs -0 sha1sum | sha1sum | cut -d' ' -f1`

.PHONY: pack-version
pack-version: export PACK_VERSION:=$(PACK_VERSION)
pack-version:
	@echo "> Ensuring pack version is set..."
	@test ! -z '${PACK_VERSION}'
	@test '${PACK_VERSION}' != 'null'
	@echo "PACK_VERSION="${PACK_VERSION}""

.PHONY: serve
serve: export PACK_VERSION:=$(PACK_VERSION)
serve: install-hugo pack-version pack-docs-update
	@echo "> Serving..."
ifeq ($(BASE_URL),)
	$(HUGO_BIN) server --disableFastRender --port=$(SERVE_PORT)
else
	$(HUGO_BIN) server --disableFastRender --port=$(SERVE_PORT) --baseURL=$(BASE_URL) --appendPort=false
endif

.PHONY: build
build: export PACK_VERSION:=$(PACK_VERSION)
build: install-hugo pack-version pack-docs-update
	@echo "> Building..."
	$(HUGO_BIN)

.PHONY: test
test: install-pack-cli install-ugo
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
prepare-for-pr: check-links test tools-tidy
	@echo "========"
	@echo "It looks good! :)"
	@echo "Make sure to commit all changes!"
	@echo "========"