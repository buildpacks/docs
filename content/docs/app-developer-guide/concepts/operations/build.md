+++
title="Build"
weight=1
summary="Build is the process of executing one or more buildpacks against the app’s source code to produce a runnable OCI image."
+++

## Building explained

![build diagram](/docs/concepts/operations/build.svg)

{{< param "summary" >}} Each buildpack inspects the source code and provides relevant dependencies.
An image is then generated from the app's source code and these dependencies.

During the build process, the [build image](/docs/concepts/components/base-images/build/) becomes the environment in which buildpacks are executed,
and the [run image](/docs/concepts/components/base-images/run/) becomes the base for the final app image.

Buildpacks can be bundled together with a specific build image, resulting in a [builder](/docs/concepts/components/builder) image.
Builders provide a convenient way to distribute buildpacks.
