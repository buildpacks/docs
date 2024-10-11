+++
title="Specify the build time environment variables"
weight=4
+++

Environment variables are any values used to allow `Buildpacks` configurability. Some environment variables can't be modified while others are expected to get changed to allow a level of customization.

<!--more-->

At `build` time, platform operators usually control what is included in the `build` environment because `platform-defined` environment variables override any previous values such as `user-provided` and `buildpack-provided` variables.

### Example

PLACEHOLDER

For more details on environment variables, see the [Specify the environment][env] page.

[env]: https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/specify-env/
