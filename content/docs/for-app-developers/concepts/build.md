+++
title="What happens during build?"
weight=3
+++

`Build` is the process of executing one or more [buildpacks][buildpack] against an application's source code to produce a runnable OCI image.

<!--more-->

## Building explained

![build diagram](/images/build.svg)

Each [buildpack] inspects the source code and provides relevant dependencies.
An image is then generated from the app's source code and these dependencies.

During the build process, the [build-time base image] becomes the environment in which buildpacks are executed,
and the [runtime base image] becomes the base for the final app image.

[Buildpacks][buildpack] can be bundled together with a specific [build-time base image], resulting in a [builder] image.
Builders provide a convenient way to distribute buildpacks.

[build-time base image]: /docs/for-app-developers/concepts/base-images/build/
[builder]: /docs/for-platform-operators/concepts/builder
[buildpack]: /docs/for-app-developers/concepts/buildpack/
[runtime base image]: /docs/for-app-developers/concepts/base-images/run/
