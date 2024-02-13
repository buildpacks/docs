+++
title="Builder"
weight=1
summary="A builder is an image that contains all the components necessary to execute a build. A builder image is created by taking a build image and adding a lifecycle, buildpacks, and files that configure aspects of the build including the buildpack detection order and the location(s) of the run image"
aliases=[
    "/docs/using-pack/working-with-builders/"
]
+++

## What is a builder?

{{< param "summary" >}}

![create-builder diagram](/docs/for-platform-operators/concepts/create-builder.svg)

## Anatomy of a builder

A builder consists of the following components:

* [Buildpacks][buildpack]
* A [lifecycle][lifecycle]
* A [build image](/docs/for-platform-operators/concepts/base-images/build/)
* A reference to a [run image](/docs/for-platform-operators/concepts/base-images/run/)

### Resources

To learn how to create your own builder, see our [Operator's Guide][operator-guide].

[builder-config]: /docs/reference/builder-config/
[operator-guide]: /docs/for-platform-operators/
[buildpack]: /docs/for-platform-operators/concepts/buildpack/
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
