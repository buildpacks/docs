
+++
title="Run image"
aliases=[
  "/docs/concepts/components/base-images/run"
]
weight=2
+++

The **run image** provides the base image for application images.

<!--more-->

CNB tooling requires a reference to a run image and (where necessary) run image mirrors in order to construct the application image.

### Run image mirrors

Run image mirrors provide alternate locations for `run images`, for use during `build` or `rebase`.

When run image mirrors are defined, CNB tooling will try to find a run image that resides on the same registry as the application image,
based on the image name provided.

This is to reduce the amount of data transfer required to push the application image to a registry.

#### Example - determining the registry

If the application image name is:

* `registry.example.com/example/app` - the registry is `registry.example.com`
* `example/app` (registry omitted) - Docker Hub is assumed; the registry is `index.docker.io`

#### Example - determining the run image mirror

If your builder has a run image with mirrors defined as follows (see [how to create a builder](/docs/for-platform-operators/how-to/build-inputs/create-builder/builder) for more information):

```toml
[[run.images]]
image = "example/run"
mirrors = ["registry.example.com/example/run"]
```

Then if you run `pack build` as follows:

```bash
$ pack build registry.example.com/example/app
```

the selected run image will be `registry.example.com/example/run`.

> For local development, it's often helpful to override the run image mirrors in a builder.
> For this, the `pack config run-image-mirrors` command can be used.
> This command does not modify the builder, and instead configures the local environment.
>
> To see what run images are configured for a builder, `pack builder inspect` can be used.
> `pack builder inspect` will output built-in and locally-configured run images for a given builder, along with other useful information.
> The order of the run images in the output denotes the order in which they will be matched during `build`.
