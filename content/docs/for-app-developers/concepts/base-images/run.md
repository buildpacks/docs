
+++
title="Run image"
aliases=[
  "/docs/concepts/components/base-images/run"
]
weight=2
+++

The **run image** provides the base image for application images.

<!--more-->

The lifecycle requires a reference to a run image and (where necessary) possible run image mirrors in order to construct the application image.

### Run image mirrors

Run image mirrors provide alternate locations for run images, for use during `build` or `rebase`.
When running `build` with a builder containing run image mirrors, `pack` will select a run image
whose registry location matches that of the specified app image (if no registry host is specified in the image name,
DockerHub is assumed). This is useful when publishing the resulting app image (via the `--publish` flag or via
`docker push`), as the app's base image (i.e. run image) will be located on the same registry as the app image itself,
reducing the amount of data transfer required to push the app image.

In the following example, assuming a builder configured with the example TOML above, the selected run image will be
`registry.example.com/example/run`.

```bash
$ pack build registry.example.com/example/app
```

while naming the app without a registry specified, `example/app`, will cause `example/run` to be selected as the app's
run image.

```bash
$ pack build example/app
```

> For local development, it's often helpful to override the run image mirrors in a builder. For this, the
> `pack config run-image-mirrors` command can be used. This command does not modify the builder, and instead configures the
> local environment.
>
> To see what run images are configured for a builder, the
> `builder inspect` command can be used. `builder inspect` will output built-in and locally-configured run images for
> a given builder, along with other useful information. The order of the run images in the output denotes the order in
> which they will be matched during `build`.
