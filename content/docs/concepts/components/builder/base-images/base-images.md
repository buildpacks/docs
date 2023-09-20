+++
title="Stack"
weight=4
aliases=[
    "/docs/using-pack/stacks/"
]
+++

## What is a stack?

A stack is composed of two images that are intended to work together:

1. The **build image** of a stack provides the base image from which the build environment is constructed. The build environment is the containerized environment in which the [lifecycle][lifecycle] (and thereby [buildpacks][buildpack]) are executed.
2. The **run image** of a stack provides the base image from which application images are built.

<!--more-->

> If you're using the `pack` CLI, running `pack stack suggest` will display a list of recommended
stacks that can be used when running `pack builder create`, along with each stack's associated build and run images.

## Using stacks

Stacks are used by [builders][builder] and are configured through a builder's
[configuration file](/docs/reference/config/builder-config/):

```toml
[[buildpacks]]
  # ...

[[order]]
  # ...

[stack]
  id = "com.example.stack"
  build-image = "example/build"
  run-image = "example/run"
  run-image-mirrors = ["gcr.io/example/run", "registry.example.com/example/run"]
```

By providing the required `[stack]` section, a builder author can configure a stack's ID, build image, and run image
(including any mirrors).

### Run image mirrors

Run image mirrors provide alternate locations for run images, for use during `build` (or `rebase`).
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
> user's local machine.
>
> To see what run images are configured for a builder, the
> `inspect-builder` command can be used. `inspect-builder` will output built-in and locally-configured run images for
> a given builder, among other useful information. The order of the run images in the output denotes the order in
> which they will be matched during `build`.

## Resources

To learn how to create your own stack, see our [Operator's Guide][operator-guide].

[operator-guide]: /docs/operator-guide/
[builder]: /docs/concepts/components/builder/
[buildpack]: /docs/concepts/components/buildpack/
[lifecycle]: /docs/concepts/components/lifecycle/
