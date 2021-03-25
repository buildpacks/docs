+++
title="Platform API 0.5 -> 0.6"
+++

<!--more-->

This guide is most relevant to platform operators.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.6) for platform API 0.6 for the full list of changes and further details.

## Platform Operator

### Web is assumed to be default process type for older buildpacks

As of Buildpack API 0.6, buildpacks may contribute the default process type by writing `default = true` in the process type definition in `<layers>/launch.toml`. To enable buildpacks implementing older Buildpack APIs to work with newer buildpacks, the lifecycle will assume that buildpacks on Buildpack API < 0.6 intended for `web` processes to be the default.

### Image working directory is set to app directory

The working directory on the exported image config will match the value of `CNB_APP_DIR`. This means that when running the image, processes started without the launcher will still use the app directory as the working directory.

### Image manifest size in report.toml

The report.toml output by the exporter will now include the image manifest size in bytes. Note that this only applies to published images, as images exported to a docker daemon will not have a manifest.
