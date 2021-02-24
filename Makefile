# Retrieve latest pack version
PACK_VERSION?=
GITHUB_TOKEN?=
PACK_BIN?=$(shell which pack)
BASE_URL?=

ifndef PACK_VERSION
ifdef GITHUB_TOKEN
PACK_VERSION:=$(shell curl -s -H "Authorization: token $(GITHUB_TOKEN)" https://api.github.com/repos/buildpacks/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
else
PACK_VERSION:=$(shell curl -s https://api.github.com/repos/buildpacks/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
endif
endif

default: serve

clean:
	rm -rf ./public ./resources

install-hugo:
	@echo "> Installing hugo..."
	cd tools; go install -mod=mod --tags extended github.com/gohugoio/hugo

install-pack-cli:
	@echo "> Installing pack bin..."
ifeq ($(PACK_BIN),)
	cd tools; go get github.com/buildpacks/pack/cmd/pack
else
	@echo "pack already installed at $(PACK_BIN)"
endif

install-ugo:
	@echo "> Installing ugo..."
	cd tools; go get -u github.com/jromero/ugo/cmd/ugo@0.0.3

mk-pack-docs:
	@echo "> Updating Pack CLI Documentation"
	cd tools; go run get_pack_commands.go

update-pack-docs: mk-pack-docs

pack-version: export PACK_VERSION:=$(PACK_VERSION)
pack-version:
	@echo "> Ensuring pack version is set..."
	@test ! -z '${PACK_VERSION}'
	@test '${PACK_VERSION}' != 'null'
	@echo "PACK_VERSION="${PACK_VERSION}""

serve: export PACK_VERSION:=$(PACK_VERSION)
serve: install-hugo pack-version update-pack-docs
	@echo "> Serving..."
ifeq ($(BASE_URL),)
	hugo server --disableFastRender
else
	hugo server --disableFastRender --baseURL=$(BASE_URL) --appendPort=false
endif

build: export PACK_VERSION:=$(PACK_VERSION)
build: install-hugo pack-version update-pack-docs
	@echo "> Building..."
	hugo

test: install-pack-cli install-ugo
	@echo "> Testing..."
	ugo run -r -p ./content/docs/

install-htmltest:
	@if ! test -f ./bin/htmltest; then \
	  echo "> Installing htmltest..."; \
	  curl https://htmltest.wjdp.uk | bash; \
	fi;

run-htmltest: install-htmltest build
	@echo "> Checking links..."
	./bin/htmltest ./public -l 3 -s 2>&1 > /dev/null || true

check-links: run-htmltest
check-links: ERRORS=$(shell cat ./tmp/.htmltest/htmltest.log | grep -i "does not exist")
check-links:
	@if [ ! -z "$(ERRORS)" ]; then \
	  echo "ERROR: found broken links:"; \
	  cat ./tmp/.htmltest/htmltest.log | grep -i "does not exist"; \
	  exit 1; \
	else \
	  echo "No broken links found."; \
	fi;

.PHONY: pack-version serve build update-pack-docs test check-links
