+++
title="What is a component buildpack?"
weight=99
+++

A **component buildpack** is a buildpack containing the `/bin/detect` and `/bin/build` executables and implements the [Buildpack Interface](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpack-interface).

<!--more-->

## Key Points

During the `build` phase, typical component buildpacks might:

* Read the Buildpack Plan in `<plan>` to determine what dependencies to provide
* Provide the application with dependencies for launch in `<layers>/<layer>`
* Reuse application dependencies from a previous image by appending `[types]` and `launch = true` to `<layers>/<layer>.toml`
* Provide subsequent buildpacks with dependencies in `<layers>/<layer>`
* Reuse cached build dependencies from a previous build by appending `[types]`, `build = true` and `cache = true` to `<layers>/<layer>.toml`
* Compile the application source code into object code
* Remove application source code that is not necessary for launch
* Provide start command in `<layers>/launch.toml`
* Write a partial Software Bill of Materials to `<layers>/<layer>.sbom.<ext>` describing any dependencies provided in the layer
* Write a partial Software Bill of Materials to `<layers>/launch.sbom.<ext>` describing any provided application dependencies not associated with a layer
* Write a partial Software Bill of Materials to `<layers>/build.sbom.<ext>` describing any provided build dependencies not associated with a layer
