
+++
title="What is an image extension?"
aliases=[
  "/docs/features/dockerfiles"
]
weight=99
+++

An `image extension` is software that generates Dockerfiles that can be used to extend base images for buildpacks builds.

<!--more-->

## Why image extensions?

Buildpacks can do a lot, but there are some things buildpacks can't do. They can't install operating system packages,
for example. Why not?

Buildpacks do not run as the `root` user and cannot make arbitrary changes to the filesystem. This enhances security,
enables buildpack interoperability, and preserves the ability to rebase - but it comes at a cost. Base image authors
must anticipate the OS-level dependencies that will be needed at build and run-time ahead of time, and this isn't always
possible.

This has been a longstanding source of [discussion](https://github.com/buildpacks/rfcs/pull/173) within the CNB project:
how can we preserve the benefits of buildpacks while enabling more powerful capabilities?

### Buildpacks and Dockerfiles can work together

Buildpacks are often presented as an alternative to Dockerfiles, but we think buildpacks and Dockerfiles can work
together.

Buildpacks are optimized for creating layers that are efficient and logically mapped to the dependencies that they
provide. By contrast, Dockerfiles are the most-used and best-understood mechanism for constructing base images and
installing OS-level dependencies for containers.

The CNB Dockerfiles feature allows Dockerfiles to "provide" dependencies that buildpacks "require" through a
shared [build plan](/docs/reference/spec/buildpack-api/#build-plan), by introducing the concept of image extensions.

## What do they look like?

Image extensions are buildpack-like components that use a restricted `Dockerfile` syntax to expand base images. Their
purpose is to generate Dockerfiles that can be used to extend the builder or run images prior to buildpacks builds.

An image extension could be defined with the following directory:

```
.
├── extension.toml <- similar to a buildpack buildpack.toml
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
```

* The `extension.toml` provides metadata about the extension, containing information such as its name, ID, and version.
* `./bin/detect` performs [detect](#detect). It analyzes application source code to determine if the extension
  is needed and contributes build plan entries.
* `./bin/generate` performs [generate](#generate) (a new lifecycle phase that happens after `detect`). It
  outputs either or both of `build.Dockerfile` or `run.Dockerfile` for extending the builder or run image.

## How do they work?

**Each image extension has two jobs to do**

### Detect

The extension determines if it is needed or not.

Like buildpacks, extensions participate in the `detect` phase - analyzing application source code to determine if they
are needed. During `detect`, extensions can contribute to
the [build plan](/docs/reference/spec/buildpack-api/#build-plan) - recording dependencies that they are able to "
provide" (though unlike buildpacks, they can't "require" anything).

If the provided order contains extensions, the output of `detect` will be a group of image extensions and a group of
buildpacks that together produce a valid build plan. Image extensions only generate Dockerfiles - they don't create
layers or participate in the `build` phase.

### Generate

The extension outputs Dockerfiles that can be used to extend either or both of the build-time base image and the runtime base image.

For more information and to see a build in action,
see [authoring an image extension](/docs/for-buildpack-authors/tutorials/basic-extension).
