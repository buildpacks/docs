+++
title="Build"
weight=1
summary="Build is the process of executing one or more buildpacks against the app’s source code to produce a runnable OCI image."
+++

## Building explained

![build diagram](/docs/concepts/operations/build.svg)

{{< param "summary" >}} Each buildpack inspects the 
source code and provides relevant dependencies. An image is then generated from the app's source code and these 
dependencies.

Buildpacks are compatible with one or more [stacks](/docs/concepts/components/stack). A stack designates a **build image**
and a **run image**. During the build process, a stack's build image becomes the environment in which buildpacks are
executed, and its run image becomes the base for the final app image. For more information on working with stacks, see
the [Working with stacks](/docs/concepts/components/stack) section.

Buildpacks can be bundled together with a specific stack's build image, resulting in a
[builder](/docs/concepts/components/builder) image (note the "er" ending). Builders provide the most
convenient way to distribute buildpacks for a given stack. For more information on working with builders, see the
[Working with builders using `builder create`](/docs/concepts/components/builder) section.
