PACK_VERSION?=$$(curl -s https://api.github.com/repos/buildpack/pack/releases | jq -r '.[0].tag_name' | sed -e 's/^v//')
UNAME_S=$(shell uname -s)

clean:
	rm -rf ./public ./resources

serve:
ifeq ($(UNAME_S),Darwin)
	@echo "> Opening browser in 3 seconds..."
	nohup bash -c 'sleep 3; open http://localhost:1313' > /dev/null 2>&1 &
endif
	@echo "> Serving..."
	PACK_VERSION=$(PACK_VERSION) hugo server --disableFastRender

build:
	@echo "> Building..."
	PACK_VERSION=$(PACK_VERSION) hugo
	
.PHONY: serve build