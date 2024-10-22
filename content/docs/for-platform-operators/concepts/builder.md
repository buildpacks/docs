+++
title="What is a builder?"
weight=2
aliases=[
    "/docs/using-pack/working-with-builders/"
]
+++

A `builder` is an OCI image containing
an ordered combination of [buildpacks][buildpack] and
a build-time base image, a [lifecycle] binary, and a reference to a runtime base image.

<!--more-->

![create-builder diagram](/images/create-builder.svg)

## Anatomy of a builder

A builder consists of the following components:

* [Buildpacks][buildpack]
* A [lifecycle][lifecycle]
* A [build image][build-image]
* A reference to a [run image][run-image]

### Resources

To learn how to create your own builder, see our [Operator's Guide][operator-guide].

[buildpack]: /docs/for-platform-operators/concepts/buildpack/
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
[operator-guide]: /docs/for-platform-operators/
[build-image]: /docs/for-platform-operators/concepts/base-images
[run-image]: /docs/for-platform-operators/concepts/base-images
