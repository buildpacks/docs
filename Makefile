# Retrieve latest pack version
PACK_VERSION?=
GITHUB_TOKEN?=
PACK_BIN?=$(shell which pack)

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
	cd tools; go install --tags extended github.com/gohugoio/hugo

install-pack-cli:
	@echo "> Installing pack bin..."
ifeq ($(PACK_BIN),)
	cd tools; go get github.com/buildpacks/pack/cmd/pack
else
	@echo "pack already installed at $(PACK_BIN)"
endif

install-ugo:
	@echo "> Installing ugo..."
	cd tools; go get github.com/jromero/ugo/cmd/ugo

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
	hugo server --disableFastRender

build: export PACK_VERSION:=$(PACK_VERSION)
build: install-hugo pack-version update-pack-docs
	@echo "> Building..."
	hugo

test: install-pack-cli install-ugo
	@echo "> Testing..."
	ugo run -r -p ./content/docs/

.PHONY: pack-version serve build update-pack-docs test
