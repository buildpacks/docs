[![Build Status](https://travis-ci.org/buildpack/docs.svg?branch=master)](https://travis-ci.org/buildpack/docs)

# docs
Website for Cloud Native Buildpacks

## Prerequisites

* [Hugo](https://gohugo.io/)

## Local development

```bash
hugo server
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
