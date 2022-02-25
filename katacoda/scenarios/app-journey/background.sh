#!/bin/bash
(curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.23.0/pack-v0.23.0-linux.tgz" | sudo tar -C /usr/local/bin/ --no-same-owner -xzv pack)
docker pull cnbs/sample-builder:bionic
docker pull buildpacksio/lifecycle
pack config trusted-builders add cnbs/sample-builder:bionic