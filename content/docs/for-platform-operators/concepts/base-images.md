+++
title="Base image types"
weight=99
+++

As you already know, `Cloud Native Buildpacks (CNBs)` transform your application source code into `OCI images`  that can run on any cloud.

<!--more-->

Each buildpack checks the source code and provides any relevant dependencies in the form of layers. Then, buildpack-provided layers are placed atop a runtime `base image` to form the final application image.

## Base image types

A `base image` is an `OCI image` containing the base, or initial set of layers, for other images. It is helpful to distinguish between two distinct types of images, `Build` and `Runtime` images.

### Build image

A `build image` is an `OCI image` that serves as the base image for the `build` environment in which the CNB `lifecycle` and buildpacks are executed.

A typical `build image` might determine:

* The OS distro in the build environment
* OS packages installed in the build environment
* Trusted CA certificates in the build environment
* The default user in the build environment

#### Anatomy of a build image

Typically, a `build` image may include:

* Shell
* C-compiler
* Minimal operating system distribution, such as Linux utilities that build systems might call out to
* Build time libraries

### Runtime image

A `runtime image` is an `OCI image` that serves as the base image for the final application image.

A typical runtime image might determine:

* The OS distro or distroless OS in the launch environment
* OS packages installed in the launch environment
* Trusted CA certificates in the launch environment
* The default user in the run environment

#### Anatomy of a runtime base image

A `runtime` image may contain:

* No-shell, unless it's needed by the application
* Runtime libraries, such as Libfreetype
* Runtime platforms, such as python interpreter, which are generally added by buildpacks

For more details on `build` and `runtime` images, you can check out the [specification][spec]

[spec]: https://github.com/buildpacks/spec/blob/main/platform.md#build-image
