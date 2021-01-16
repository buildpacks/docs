+++
title="Platform API 0.4 -> 0.5"
+++

<!--more-->

This guide is most relevant to platform operators and stack authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.5) for platform API 0.5 for the full list of changes and further details.

## Platform Operator

### `PATH` must be set on stack images

`config.Env.PATH` must be set for stack (build and run) images. Any Linux or Windows stack image missing a `config.Env.PATH` should cause the platform to fail with an error message.

### Homepage in build metadata

The exporter now adds buildpack homepage to the `io.buildpacks.build.metadata` label on the application image. Platforms may inspect this label to display buildpack information to the user.

### Build-time `BOM`

The exporter now writes a build-time Bill-of-Materials (BOM) to `report.toml`. When building, platforms can optionally specify the location of the report, or save it off somewhere.

### Default paths for TOML files

All default file paths that were previously relative to the working directory are relative to the layers directory: `analyzed.toml`, `group.toml`, `plan.toml`, `project-metadata.toml`, and `report.toml`. When building, if the layers directory is set to something other than the default `/layers`, these files will be written to the specified layers directory and not `/layers`.

## Stack Author

### `PATH` must be set on stack images

`config.Env.PATH` must be set for stack (build and run) images. This is the current de-facto Linux behavior. When creating stack images, Windows stack authors must take action to set this variable in the image config - e.g., if using a Dockerfile: `ENV PATH C:\\Windows\\System32` or `ENV PATH C:\\Windows\\System32;C:\\stack-specific-dir`. 

### Stack image metadata

When creating stack images, the following labels may be added to additionally describe the image:
* `io.buildpacks.stack.maintainer`
* `io.buildpacks.stack.homepage`
* `io.buildpacks.stack.distro.name`
* `io.buildpacks.stack.distro.version`
* `io.buildpacks.stack.released`
* `io.buildpacks.stack.description`
* `io.buildpacks.stack.metadata`
