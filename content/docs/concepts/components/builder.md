+++
title="Builder"
weight=1
summary="A builder is an image that bundles all the bits and information on how to build your app. It contains buildpacks, an implementation of the lifecycle program, and a build-time environment that platforms may use when executing the lifecycle."
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
