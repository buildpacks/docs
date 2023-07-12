+++
title="Dockerfiles"
summary="Dockerfiles can be used to extend base images for buildpacks builds."
+++

## Why Dockerfiles?

Buildpacks can do a lot, but there are some things buildpacks can't do. They can't install operating system packages,
for example. Why not?

Buildpacks do not run as the `root` user and cannot make arbitrary changes to the filesystem. This enhances security,
enables buildpack interoperability, and preserves the ability to rebase - but it comes at a cost. Base image authors
must anticipate the OS-level dependencies that will be needed at build and run-time ahead of time, and this isn't always
possible.

This has been a longstanding source of [discussion](https://github.com/buildpacks/rfcs/pull/173) within the CNB project:
how can we preserve the benefits of buildpacks while enabling more powerful capabilities?

## Buildpacks and Dockerfiles can work together

Buildpacks are often presented as an alternative to Dockerfiles, but we think buildpacks and Dockerfiles can work
together.

Buildpacks are optimized for creating layers that are efficient and logically mapped to the dependencies that they
provide. By contrast, Dockerfiles are the most-used and best-understood mechanism for constructing base images and
installing OS-level dependencies for containers.

The CNB Dockerfiles feature allows Dockerfiles to "provide" dependencies that buildpacks "require" through a
shared [build plan](/docs/reference/spec/buildpack-api/#build-plan), by introducing the concept of image extensions.

## What are image extensions?

Image extensions are buildpack-like components that use a restricted `Dockerfile` syntax to expand base images. Their
purpose is to generate Dockerfiles that can be used to extend the builder or run images prior to buildpacks builds.

Like buildpacks, extensions participate in the `detect` phase - analyzing application source code to determine if they
are needed. During `detect`, extensions can contribute to
the [build plan](/docs/reference/spec/buildpack-api/#build-plan) - recording dependencies that they are able to "
provide" (though unlike buildpacks, they can't "require" anything).

If the provided order contains extensions, the output of `detect` will be a group of image extensions and a group of
buildpacks that together produce a valid build plan. Image extensions only generate Dockerfiles - they don't create
layers or participate in the `build` phase.

An image extension could be defined with the following directory:

```
.
├── extension.toml <- similar to a buildpack buildpack.toml
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
```

* The `extension.toml` describes the extension, containing information such as its name, ID, and version.
* `./bin/detect` is invoked during the `detect` phase. It analyzes application source code to determine if the extension
  is needed and contributes build plan entries.
* `./bin/generate` is invoked during the `generate` phase (a new lifecycle phase that happens after `detect`). It
  outputs either or both of `build.Dockerfile` or `run.Dockerfile` for extending the builder or run image,
  respectively (in the [initial implementation](#phased-approach), only limited `run.Dockerfile`s are allowed).

For more information and to see a build in action,
see [authoring an image extension](/docs/extension-guide/create-extension).

## A platform's perspective

Platforms may wish to use image extensions if they wish to provide the flexibility of modifying base images dynamically
at build time.

### Risks

Image extensions are considered experimental and susceptible to change in future API versions. However, image extension
should be **used with great care**. Platform operators should be mindful that:

* Dockerfiles are very powerful - in fact, you can do anything with a Dockerfile! Introducing image extensions into your
  CNB builds can eliminate the security and compatibility guarantees that buildpacks provide.
* When Dockerfiles are used to switch the run image from that defined on the provided builder, the resulting run image
  may not have all the mixins required by buildpacks that detected. Platforms may wish to optionally re-validate mixins
  prior to `build` when using extensions.

### Phased approach

Some limitations of the initial implementation of the Dockerfiles feature have already been mentioned, and we'll expand
on them here. As this is a large and complicated feature, the implementation has been split into phases in order to
deliver incremental value and gather feedback.

#### Phase 1 (supported in lifecycle `0.15.0` or greater)

One or more `run.Dockerfile`s each containing a single `FROM` instruction can be used to switch the original run image
to a new image (as no image modifications are permitted, there is no need to run `extend` on the run image)

#### Phase 2 (supported in lifecycle `0.15.0` or greater)

One or more `build.Dockerfile`s can be used to extend the builder image

* A new `extend` lifecycle phase is introduced to apply `build.Dockerfile`s from `generate` to the builder image

#### Phase 3 (future)

One or more `run.Dockerfile`s can be used to extend the run image

* The `extend` lifecycle phase can be run in parallel for the builder and run images

The final ordering of lifecycle phases will look something like the following:

* `analyze`
* `detect` - after standard detection, `detect` will also run extensions' `./bin/generate`; output Dockerfiles are
  written to a volume
* `restore`
* `extend` - applies one or more `build.Dockerfile`s to the builder image
* `extend` - applies one or more `run.Dockerfile`s to the run image (could run in parallel with builder image extension)
* `build`
* `export`

For more information, consult the [migration guide](/docs/reference/spec/migration/platform-api-0.9-0.10).

#### Platform support for Dockerfiles

Supported (phases 1 and 2):

* [pack cli](https://github.com/buildpacks/pack) (version `0.28.0` and above)

Needs support:

* [Tekton task](https://github.com/tektoncd/catalog/tree/main/task/buildpacks-phases/0.2) ([GitHub issue](https://github.com/tektoncd/catalog/issues/1096))
* [kpack](https://github.com/pivotal/kpack) ([GitHub issue](https://github.com/pivotal/kpack/issues/1047))

Your feedback is appreciated! As the feature evolves, we want to hear from you - what's going well, what's challenging,
and anything else you'd like to see. Please reach out in [Slack](https://cncf.slack.io) (#buildpacks channel)
or [GitHub](https://github.com/buildpacks).
