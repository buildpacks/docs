+++
title="Builder"
weight=1
summary="A builder is an image that bundles all the bits and information on how to build your apps, such as buildpacks and build-time image, as well as executes the buildpacks against your app source code."
aliases=[
    "/docs/using-pack/working-with-builders/"
]
+++

## What is a builder?

{{< param "summary" >}}

![create-builder diagram](/docs/concepts/components/create-builder.svg)

## Anatomy of a builder

A builder consists of the following components:

* [Buildpacks][buildpack]
* [Lifecycle][lifecycle]   
* [Stack's][stack] build image   

### Resources

To learn how to create your own builder, see our [Operator's Guide][operator-guide].

[builder-config]: /docs/reference/builder-config/
[operator-guide]: /docs/operator-guide/
[buildpack]: /docs/concepts/components/buildpack/
[lifecycle]: /docs/concepts/components/lifecycle/
[stack]: /docs/concepts/components/stack/
