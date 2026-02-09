+++
title="Basics of BuildPacks"
weight=2
getting-started=true
+++

## Basic Concepts

### What is a Buildpack?

A `buildpack` is software that transforms application source code into
executable files by analyzing the code and determining the best way to
build it.

![buildpacks](/images/what.svg)

Buildpacks have many shapes and forms. For example, a 'Distribution BuildPack'
is a pre-built and tested buildpack that is ready for distribution to
application developers. A Distribution Buildpack includes a set of buildpacks
that are packaged together and can be used to build applications in different
environments. 

'Paketo Buildpacks' is a distribution buildpack for building applications in
Java, Go, Python, Ruby, etc. The buildpacks included in 'Paketo Buildpacks'
work together to create application container images that can run on any
platform that supports container images (e.g., Cloud Foundry, Docker,
Kubernetes, etc.).

### What is a Builder?

A builder is an image that contains all the components necessary to
execute a build (for example, an ordered combination of buildpacks, a build
image and other files and configurations).

![create-builder diagram](/images/create-builder.svg)

### What is a Lifecycle?

A lifecycle is a series of steps that are used to create and manage a
buildpack. The cumulative `create` step can be used to `analyze`, `detect`,
`restore`, `build`, and `export` buildpack execution. All of these steps are
part of a lifecycle. You can also re-enter a lifecycle using `rebase` to push
the latest changes to an existing buildpack.

![lifecycle](/images/lifecycle.png)

`launcher` is an independent step that can be used to launch the application
at any time. 

### How BuildPacks add Efficiency to Code Iterations

#### Building with Containers:

Here's a quick look at how much manual effort is needed when working with
containers, especially when major changes to the application need to be
re-built.

![Working with Containers](/images/rebase-containers.png)

#### Building with BuildPacks:

With BuildPacks, a lot of the steps mentioned above are automated. However,
the true power of BuildPack is evident when 'rebasing' a newer iteration of the
application code. With a layered approach, only incremental changes are
rebuilt, greatly improving the time and efficiency of the build process.

![Working with BuildPacks](/images/rebase-buildpacks.png)

### What is a Platform

A platform coordinates builds by invoking the lifecycle binary together with
the buildpacks and the application source code in order to produce an
executable OCI image.

A platform can be a:

- A local CLI tool
- A plugin for a continuous integration service
- A cloud application platform

## Who uses Buildpacks (Personas)

### App Developers

Regular Application developers that utilize Buildpacks in their app packaging
workflows.

### Platform Operators

Platform Operators are organizations or service providers (e.g., kpack,
Tekton, Fly.io, Digital Ocean, Google Cloud, Heroku, SalesForce, etc.) that
incorporates Buildpacks within their products to make buildpack functionality
available to their end-users (typically, application developers). 

### Buildpack Authors

Buildpacks' internal developers working on Buildpack features.