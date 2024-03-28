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
* A [build image](/docs/for-app-developers/concepts/base-images/build/)
* A reference to a [run image](/docs/for-app-developers/concepts/base-images/run/)

### Resources

To learn how to create your own builder, see our [Operator's Guide][operator-guide].

[builder-config]: /docs/reference/builder-config/
[buildpack]: /docs/for-platform-operators/concepts/buildpack/
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
[operator-guide]: /docs/for-platform-operators/
