UNAME_S=$(shell uname -s)

clean:
	rm -rf ./public ./resources

serve: pack-version
	@echo "> Serving..."
	hugo server --disableFastRender

build: pack-version
	@echo "> Building..."
	hugo
	
.PHONY: serve build