# Retrieve latest pack version
GITHUB_TOKEN?=
ifdef GITHUB_TOKEN
_PACK_VERSION?=$(shell curl -s -H "Authorization: token $(GITHUB_TOKEN)" https://api.github.com/repos/buildpacks/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
else
_PACK_VERSION?=$(shell curl -s https://api.github.com/repos/buildpacks/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
endif
PACK_VERSION:=$(_PACK_VERSION)

default: serve

clean:
	rm -rf ./public ./resources

install-hugo:
	@echo "> Installing hugo..."
	cd tools; go install --tags extended github.com/gohugoio/hugo

install-pack:
	@echo "> Installing pack..."
	cd tools; go get github.com/buildpacks/pack

mk-pack-docs:
	@echo "> Updating Pack CLI Documentation"
	cd tools; go run get_pack_commands.go

update-docs: install-pack mk-pack-docs

pack-version: export PACK_VERSION:=$(PACK_VERSION)
pack-version:
	@echo "> Ensuring pack version is set..."
	@test ! -z '${PACK_VERSION}'
	@test '${PACK_VERSION}' != 'null'
	@echo "PACK_VERSION="${PACK_VERSION}""

serve: export PACK_VERSION:=$(PACK_VERSION)
serve: install-hugo pack-version
	@echo "> Serving..."
	hugo server --disableFastRender

build: export PACK_VERSION:=$(PACK_VERSION)
build: install-hugo pack-version
	@echo "> Building..."
	hugo

.PHONY: pack-version serve build update-docs
