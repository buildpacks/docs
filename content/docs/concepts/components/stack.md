+++
title="Stack"
weight=4
aliases=[
    "/docs/using-pack/stacks/"
]
+++

## What is a stack and Why is it deprecated?

### Deprecation
A stack restricts buildpacks to run on top of a set of related **build images** (where your app is built)
and **run images** (where your app runs).  Practical experience of the buildpacks community has not found that the stack concept adds any value therefore [the community decided](https://github.com/buildpacks/rfcs/blob/main/text/0096-remove-stacks-mixins.md)
to use buildpacks with build and run images without the additional concept formerly known as _stack_. 

Stacks will continue to be supported with full backwards compatibility.

### What's Next?
[Targets](https://github.com/buildpacks/rfcs/blob/main/text/0096-remove-stacks-mixins.md#example-buildpacktoml-targets-table) replace stacks.
Targets allow buildpack authors to directly specify details such as OS and architecture directly without the intermediate object known as a "stack." 
Targets are available starting with the 0.12 Platform API but should be safely ignored by older platforms.


#### How long can I keep using stacks?
We do not yet have a defined end-date. Historically this project allows deprecated features to remain for 6-24+ months.


#### What is the current recommended best practice?
We currently recommend that buildpack authors use both a stack and a target.
We anticipate it will take some time before all platforms catch up with this change, but by using both your buildpacks will work with all platforms past, present, and future.

In order to ease this process for those using the io.buildpacks.stacks.bionic, lifecycle will translate any section that sets this as on of the stacks:

```
[[stacks]]
id = "io.buildpacks.stacks.bionic
```

to
```
[[targets]]
os = "linux"
arch = "amd64"
[[targets.distributions]]
name = "ubuntu"
versions = ["18.04"]
```

## (Deprecated) stack documentation

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
