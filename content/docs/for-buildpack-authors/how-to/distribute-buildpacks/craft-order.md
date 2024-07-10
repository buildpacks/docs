+++
title="Craft a buildpack order"
weight=99
+++

Buildpack order is

<!--more-->

## Composite Buildpacks

A **composite buildpack** is a buildpack that doesn't contain any `/bin/detect` or `/bin/build` executables; instead it references other buildpacks in its `buildpack.toml` via the [[order]] array. Composite buildpacks MUST be [resolvable](https://github.com/buildpacks/spec/blob/main/buildpack.md#order-resolution) into a collection of component buildpacks.

## Why to use composite buildpacks

Most advanced buildpacks aren’t actually a single buildpack, but instead a composite or an ordered list of component buildpacks with each buildpack performing specific jobs. This is useful for composing more complex detection strategies

## How the lifecycle approaches composite buildpacks
