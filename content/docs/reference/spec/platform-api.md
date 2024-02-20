+++
title="Platform API"
aliases=[
  "/docs/reference/platform-api/"
]
+++

The Platform specification defines the interface between the CNB [lifecycle](/docs/for-platform-operators/concepts/lifecycle/) and a [platform](/docs/for-app-developers/concepts/platform/) that runs it.

<!--more-->

## Buildpacks

Buildpacks are stored on the filesystem as unarchived files such that:

* Each top-level directory is a buildpack ID.
* Each second-level directory is a buildpack version.

## Users

For security reasons, images built with platforms, such as `pack`, build and run as non-root users.

## Stacks (deprecated)

A stack (deprecated) is the grouping together of the build and run base images, represented by a unique ID.

The build image is used to run the buildpack lifecycle, and the run image is the base image for the application image.

## Further Reading

You can read the complete [Platform API specification on Github](https://github.com/buildpacks/spec/blob/main/platform.md).
