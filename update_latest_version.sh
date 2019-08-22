#!/usr/bin/env bash

echo "$(curl https://api.github.com/repos/buildpack/pack/releases | jq '.[0]')" > latest.json
