[![Build Status](https://travis-ci.org/buildpack/docs.svg?branch=master)](https://travis-ci.org/buildpack/docs)

# docs
Website for [Cloud Native Buildpacks](https://buildpacks.io)

## Prerequisites

* [Hugo](https://gohugo.io/)

## Local development

The pack documentation is build using hugo, install it using the guide [here](https://gohugo.io/getting-started/installing/)

```bash
git clone https://github.com/buildpack/docs.git
cd docs/src
hugo server
# documentation is available at localhost:1313
```

## Build

```bash
hugo
```

## Update referenced  `pack` release

Before building (or running the local dev server) run:

```bash
./update_latest_version.sh
```
