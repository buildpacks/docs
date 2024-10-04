+++
title="Base image types"
weight=99
+++

As you already know, `Cloud Native Buildpacks (CNBs)` transform your application source code into `OCI images`  that can run on any cloud.

<!--more-->

Each buildpack checks the source code and provides any relevant dependencies in the form of layers. Then, buildpack-provided layers are placed atop a runtime `base image` to form the final application image.

## Base image types

A `base image` is an `OCI image` containing the base, or initial set of layers, for other images. It is helpful to distinguish between two distinct types of images, `Build` and `Run` images.

### Build image

A `build image` is an `OCI image` that serves as the base image for the `build` environment in which the CNB `lifecycle` and buildpacks are executed.

A typical `build image` might determine:

* The OS distro in the build environment
* OS packages installed in the build environment
* Trusted CA certificates in the build environment
* The default user in the build environment

The platform must ensure that:

* The image config's `User` field is set to a non-root user with a writable home directory
* The image config's `Env` field has the environment variable `CNB_USER_ID` set to the user [UID/SID](https://github.com/buildpacks/spec/blob/main/README.md#operating-system-conventions) of the user specified in the `User` field
* The image config's `Env` field has the environment variable `CNB_GROUP_ID` set to the primary group [GID/SID](https://github.com/buildpacks/spec/blob/main/README.md#operating-system-conventions) of the user specified in the `User` field
* The image config's `Env` field has the environment variable `PATH` set to a valid set of paths or explicitly set to empty (`PATH=`)

The platform should ensure that:

* The image config's `Label` field has the label `io.buildpacks.base.maintainer` set to the name of the image maintainer.
* The image config's `Label` field has the label `io.buildpacks.base.homepage` set to the homepage of the image.
* The image config's `Label` field has the label `io.buildpacks.base.released` set to the release date of the image.
* The image config's `Label` field has the label `io.buildpacks.base.description` set to the description of the image.
* The image config's `Label` field has the label `io.buildpacks.base.metadata` set to additional metadata related to the image.

#### Anatomy of a build image

Typically, a `build` image may include:

* Shell
* C-compiler
* Minimal operating system distribution, such as Linux utilities that build systems might call out to
* Build time libraries

### Runtime image

A `run image` is an `OCI image` that serves as the base image for the final application image.

A typical run image might determine:

* The OS distro or distroless OS in the launch environment
* OS packages installed in the launch environment
* Trusted CA certificates in the launch environment
* The default user in the run environment

The platform must ensure that:

* The image config's `Env` field has the environment variable `PATH` set to a valid set of paths or explicitly set to empty (`PATH=`)

The platform should ensure that:

* The image config's `User` field is set to a user with a **DIFFERENT** user [UID/SID](https://github.com/buildpacks/spec/blob/main/README.md#operating-system-conventions) as the build image
* The image config's `Label` field has the label `io.buildpacks.base.maintainer` set to the name of the image maintainer
* The image config's `Label` field has the label `io.buildpacks.base.homepage` set to the homepage of the image
* The image config's `Label` field has the label `io.buildpacks.base.released` set to the release date of the image.
* The image config's `Label` field has the label `io.buildpacks.base.description` set to the description of the image
* The image config's `Label` field has the label `io.buildpacks.base.metadata` set to additional metadata related to the image
* The image config's `Label` field has the label `io.buildpacks.rebasable` set to `true` to indicate that new run image versions maintain [ABI-compatibility](https://en.wikipedia.org/wiki/Application_binary_interface) with previous versions (see [Compatibility Guarantees](https://github.com/buildpacks/spec/blob/main/platform.md#compatibility-guarantees)).

#### Anatomy of a runtime base image

A `runtime` image may contain:

* No-shell, unless it's needed by the application
* Runtime libraries, such as Libfreetype
* Runtime platforms, such as python interpreter, which are generally added by buildpacks

For both build images and run images, the platform must ensure that:

* The image config's `os` and `architecture` fields are set to valid identifiers as defined in the [OCI Image Specification](https://github.com/opencontainers/image-spec/blob/main/config.md)
* The build image config and the run image config both specify the same `os`, `architecture`, `variant` (if specified), `io.buildpacks.base.distro.name` (if specified), and `io.buildpacks.base.distro.version` (if specified)

The platform should ensure that:

* The image config's `variant` field is set to a valid identifier as defined in the [OCI Image Specification](https://github.com/opencontainers/image-spec/blob/main/config.md)
* The image config's `Label` field has the label `io.buildpacks.base.distro.name` set to the OS distribution and the label `io.buildpacks.base.distro.version` set to the OS distribution version
  * For Linux-based images, each label should contain the values specified in `/etc/os-release` (`$ID` and `$VERSION_ID`), as the `os.version` field in an image config may contain combined distribution and version information
  * For Windows-based images, `io.buildpacks.base.distro.name` should be empty; `io.buildpacks.base.distro.version` should contain the value of `os.version` in the image config (e.g., `10.0.14393.1066`)
