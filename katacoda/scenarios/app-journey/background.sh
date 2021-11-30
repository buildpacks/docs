#!/bin/bash
(curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.18.1/pack-v0.18.1-linux.tgz" | sudo tar -C /usr/local/bin/ --no-same-owner -xzv pack)
docker pull cnbs/sample-builder:bionic
docker pull buildpacksio/lifecycle