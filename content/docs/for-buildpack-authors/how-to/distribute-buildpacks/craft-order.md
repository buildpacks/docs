+++
title="Craft a buildpack order"
weight=99
+++

An `order` is a list of one or more `groups` to be tested against application source code, so that the appropriate `group` for a build can be determined.

<!--more-->

Whereas a `buildpack group`, or `group`, is a list of one or more buildpacks that are designed to work together. For example, a buildpack that provides `node` and a buildpack that provides `npm`.

During the `detect` phase, an order definition for buildpacks and an order definition for image extensions—if present—MUST be resolved into a group of component buildpacks and a group of image extensions.

## Composite Buildpacks

A **composite buildpack** is a buildpack that doesn't contain any `/bin/detect` or `/bin/build` executables; instead it references other buildpacks in its `buildpack.toml` via the `[[order]]` array. Composite buildpacks MUST be [resolvable](https://github.com/buildpacks/spec/blob/main/buildpack.md#order-resolution) into a collection of component buildpacks. That is, after the [detect phase](https://buildpacks.io/docs/for-buildpack-authors/concepts/lifecycle-phases/#phase-2-detect) of the lifecycle has completed, a single group of component buildpacks from the `[[order]]` array will have opted in to the build.

## Why use Composite Buildpacks

Most advanced buildpacks aren’t actually a single buildpack, but instead a composite or an ordered list of component buildpacks with each buildpack performing specific jobs. This is useful for composing more complex detection strategies.

>For more details on composite buildpacks, buildpack groups, and order resolution, see the [concept page](https://buildpacks.io/docs/for-buildpack-authors/concepts/buildpack-group/) for buildpack groups.
