+++
title="What is a component buildpack?"
weight=99
+++

A **component buildpack** is a buildpack containing `/bin/detect` and `/bin/build` executables and that implements the [Buildpack Interface](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpack-interface).

<!--more-->

## Key Points

During the `build` phase, typical component buildpacks might perform one, or more, of the following actions:

* Read the [Buildpack Plan](https://buildpacks.io/docs/for-buildpack-authors/concepts/build-plan/) in `<plan>` to determine what dependencies to provide
* Supply the application with [dependencies](https://buildpacks.io/docs/for-buildpack-authors/concepts/layer/) for launch in `<layers>/<layer>`
* Reuse application [dependencies](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/re-use-layers/) from a previous image by appending `[types]` and `launch = true` to `<layers>/<layer>.toml`
* Contribute [dependencies](https://buildpacks.io/docs/for-buildpack-authors/concepts/layer/) added in `<layers>/<layer>` to subsequent buildpacks  
* Reuse [cached build dependencies](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/create-layer/) from a previous build by appending `[types]`, `build = true` and `cache = true` to `<layers>/<layer>.toml`
* Compile the application source code into object code
* Remove application source code that is not necessary for launch
* Supply start command in `<layers>/launch.toml`
* Write a partial [Software Bill of Materials](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/add-sbom/) to `<layers>/<layer>.sbom.<ext>` describing any dependencies provided in the layer
* Write a partial [Software Bill of Materials](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/add-sbom/) to `<layers>/launch.sbom.<ext>` describing any provided application dependencies not associated with a layer
* Write a partial [Software Bill of Materials](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/add-sbom/) to `<layers>/build.sbom.<ext>` describing any provided build dependencies not associated with a layer
