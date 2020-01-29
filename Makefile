UNAME_S=$(shell uname -s)

clean:
	rm -rf ./public ./resources

serve:
	@echo "> Serving..."
	hugo server --disableFastRender

build:
	@echo "> Building..."
	hugo
	
.PHONY: serve build