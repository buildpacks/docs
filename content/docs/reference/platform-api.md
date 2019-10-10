+++
title="Platform API"
weight=2
creatordisplayname = "Joe Kutner"
creatoremail = "jpkutner@gmail.com"
lastmodifierdisplayname = "Joe Kutner"
lastmodifieremail = "jpkutner@gmail.com"
+++

This specification defines the interface between the buildpack execution environment,
referred to as the *lifecycle*, and a platform that supports it.
This API is used by platform implementors.

## Stacks

A stack defines two OCI images: a *build* image and a *run* image. The build image
is used to run the buildpack lifecycle, and the run image is the base image the
final exported image will be built upon.

For more information see [Working with stacks](/docs/concepts/components/stack).

## Buildpacks

Buildpacks are stored on the filesystem as unarchived files such that:

* Each top-level directory is a buildpack ID.
* Each second-level directory is a buildpack version.

## Further Reading

You can read the complete [Platform API specification on Github](https://github.com/buildpack/spec/blob/master/platform.md).
