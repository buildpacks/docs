
+++
title="Create a stack (deprecated)"
aliases=[
  "/docs/operator-guide/create-a-stack"
]
weight=99
+++

A stack is the grouping together of the build and run base images, represented by a unique ID.

<!--more-->

**Note**: As of Platform API 0.12 and Buildpack API 0.10, stacks are deprecated in favor of existing constructs in the container image ecosystem such as operating system name, operating system distribution, and architecture.

You can still configure the build and run base images for your CNB build.
To find out how, see [create a build base image](/docs/for-platform-operators/how-to/build-inputs/create-builder/build-base/) and [create a run base image](/docs/for-platform-operators/how-to/build-inputs/create-builder/run-base/).

A stack ID identifies the configuration for the build and run base images, and it used to determined compatibility with available buildpacks, and rebasability when updated run images are available.
If you're on an older Platform API version, you may still need to create a custom stack.
To find out how, read on...

<!--more-->

## Prerequisites

Before we get started, make sure you've got the following installed: 

{{< download-button href="https://store.docker.com/search?type=edition&offering=community" color="blue" >}} Install Docker {{</>}}

## Creating a custom stack

We will create a sample stack based on `Ubuntu Noble Jellyfish`. To create a custom stack, we need to create customized build and run images.
To find out how, see [create a build base image](/docs/for-platform-operators/how-to/build-inputs/create-builder/build-base/) and [create a run base image](/docs/for-platform-operators/how-to/build-inputs/create-builder/run-base/), then come back here.

## Choose your stack ID

Choose a stack ID to uniquely identify your stack. The stack ID:
  * must only contain numbers, letters, and the characters ., /, and -.
  * must not be identical to any other stack ID when using a case-insensitive comparison.
  * should use reverse domain notation to avoid name collisions - i.e. buildpacks.io will be io.buildpacks.

Example stack IDs:
  * `io.buildpacks.stacks.noble`
  * `io.buildpacks.stacks.noble`
  * `io.buildpacks.samples.stacks.noble`
  * `io.buildpacks.samples.stacks.noble`

## Label your images

Add the following to the Dockerfiles used to create your build and run base images:

```bash
LABEL io.buildpacks.stack.id="your stack ID"
```

During build, this label will be read by platforms such as `pack` to determine if the build base image is compatible with available buildpacks (if those buildpacks require a specific stack).
During rebase, this label will be read by the lifecycle to determine if the provided run image is compatible with the application.

## Set CNB_STACK_ID

Add the following to the Dockerfile used to create your build base images:

```bash
ENV CNB_STACK_ID="your stack ID"
```

During build, this environment variable will be exposed to buildpacks, so that buildpacks can tailor their behavior for the specific stack.

**Congratulations!** You've got a custom stack!

## Additional information

### Mixins

Mixins provide a way to document OS-level dependencies that a stack provides to buildpacks.
Mixins can be provided at build-time (name prefixed with `build:`), run-time (name prefixed with `run:`), or both (name unprefixed).

#### Declaring provided mixins

When declaring provided mixins, both the build and run image of a stack must contain the following label:

| Name                         | Description             | Format            |
|------------------------------|-------------------------|-------------------|
| `io.buildpacks.stack.mixins` | List of provided mixins | JSON string array |

\
The following rules apply for mixin declarations:

 - `build:`-prefixed mixins may not be declared on a run image
 - `run:`-prefixed mixins may not be declared on a build image
 - Unprefixed mixins must be declared on both build and run images

##### Example

_Build image:_
```json
io.buildpacks.stack.mixins: ["build:git", "wget"]
```

_Run image:_
```json
io.buildpacks.stack.mixins: ["run:imagemagick", "wget"]
```

#### Declaring required mixins

A buildpack must list any required mixins in the `stacks` section of its `buildpack.toml` file.

When validating whether the buildpack's mixins are satisfied by a stack, the following rules apply:

- `build:`-prefixed mixins must be provided by stack's build image
- `run:`-prefixed mixins must be provided by stack's run image
- Unprefixed mixins must be provided by both stack images

##### Example

```toml
[[stacks]]
id = "io.buildpacks.stacks.noble"
mixins = ["build:git", "run:imagemagick", "wget"]
```

## Resources

For technical details on stacks, see the stack sections in the [Platform](https://github.com/buildpacks/spec/blob/main/platform.md#iobuildpacksstack-labels)
and [Buildpack](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpacktoml-toml-stacks-array) specifications.

[stack]: /docs/for-app-developers/concepts/base-images/stack/
[builder]: /docs/for-platform-operators/concepts/builder/
[samples]: https://github.com/buildpacks/samples
