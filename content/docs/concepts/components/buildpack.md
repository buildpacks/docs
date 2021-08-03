+++
title="Buildpack"
weight=2
+++

## What is a buildpack?

A buildpack is a set of executables that inspects your app source code and create a plan to build and run your
application.

<!--more-->

Typical buildpacks consist of at least three files:

* `buildpack.toml` -- provides metadata about your buildpack
* `bin/detect` -- determines whether buildpack should be applied
* `bin/build` -- executes build logic

#### Meta-buildpack

There is a different type of buildpack commonly referred to as a **meta-buildpack**. It contains only a 
`buildpack.toml` file with an `order` configuration that references other buildpacks. This is useful for 
composing more complex detection strategies.

## Buildpack phases

There are two essential steps that allow buildpacks to create a runnable image.

#### Detect

To determine which buildpack should be used to build your app, a [`platform`](platform) sequentially tests a group of
buildpacks against your source. The first buildpack that claims that it can build your sources will become selected.
The `platform` does this by running `bin/detect` with a path to your source code, and expects the script to return 0
if its logic matches -- for instance, an **NPM buildpack** might look for a `package.json`, and a **Go buildpack**
might look for Go source files.

#### Build

During build the buildpacks contribute to the final application image. This contribution could be as simple as setting 
some environment variables within the image, creating a layer containing a binary (e.g: node, python, or ruby), or 
adding app dependencies (e.g: running `npm install`, `pip install -r requirements.txt`, or `bundle install`).

## Distribution

Buildpacks can be [packaged][package-a-buildpack] as OCI images on an image registry or Docker daemon. This includes meta-buildpacks.

## Reference

Learn more about buildpacks by referring to the [Buildpack API][buildpack-api]. 

[buildpack-api]: /docs/reference/buildpack-api
[package-a-buildpack]: /docs/buildpack-author-guide/package-a-buildpack/
