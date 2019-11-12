UNAME_S=$(shell uname -s)

# Retrieve latest pack version
GITHUB_TOKEN?=
ifdef GITHUB_TOKEN
_PACK_VERSION?=$(shell curl -s -H "Authorization: token $(GITHUB_TOKEN)" https://api.github.com/repos/buildpack/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
else
_PACK_VERSION?=$(shell curl -s https://api.github.com/repos/buildpack/pack/releases/latest | jq -r '.tag_name' | sed -e 's/^v//')
endif
PACK_VERSION:=$(_PACK_VERSION)

clean:
	rm -rf ./public ./resources

pack-version: export PACK_VERSION:=$(PACK_VERSION)
pack-version: 
	@echo "> Ensuring pack version is set..."
	@test ! -z '${PACK_VERSION}'
	@echo "PACK_VERSION="${PACK_VERSION}""

serve: export PACK_VERSION:=$(PACK_VERSION)
serve: pack-version
	@echo "> Serving..."
	hugo server --disableFastRender

build: export PACK_VERSION:=$(PACK_VERSION)
build: pack-version
	@echo "> Building..."
	hugo
	
.PHONY: pack-version serve build