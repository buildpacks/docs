+++
title="Orchestrate a build with the CNB lifecycle"
weight=1
expand=true
include_summaries=true
+++

A `platform` orchestrates builds by invoking the [lifecycle][lifecycle] binary together with buildpacks and application source code to produce a runnable `OCI image`.

<!--more-->

The majority of Buildpack users use platforms, such as [pack][pack] and [kpack][kpack], to run Buildpacks and create `OCI images`. However this might not be desireable especially for users maintaining their own platforms and seeking more control over how the underlying Buildpack `lifecycle phases` are executed.

In this step-by-step tutorial, you will build a `Bash` application without using any `platform` tooling like `pack` or `kpack`. You will also leverage the individual `lifecycle phases` to produce a runnable application image.

## Prerequisites

You'll need to clone a local copy of the following to get started:

* The `lifecycle`: `git clone https://github.com/buildpacks/lifecycle`
* The official `Buildpack.io` samples repo: `git clone https://github.com/buildpacks/samples`

As previously mentioned, the `lifecycle` orchestrates `Buildpacks` then assembles the resulting artifacts into an `OCI image`.  The `lifecycle` is composed of a series of distinct `phases` that need to be executed to have the final image built and exported.

## Overview

Now that you’re set up, let’s build our `Bash` application and dive deeper into the `lifecycle` and its phases.

### Build the lifecycle

As a starting step, you need to build the `lifecycle` in order to use its phases. This could be done by navigating to the `lifecycle` directory and executing one of the following commands, depending on your system architecture.

* `make build` for `AMD64` architectures
* `make build-darwin-arm64` for `ARM64` architectures

### Set environment variables

In order to execute the various `lifecycle phases` correctly, you first need to set the values of few important environment variables by running the following commands in the terminal:

```text

export CNB_USER_ID=1000 CNB_GROUP_ID=1000 CNB_PLATFORM_API=0.14
export CNB_SAMPLES_PATH="/<your-path>/samples"
export CNB_LIFECYCLE_PATH="/<your-path/lifecycle/out/<your-arch>/lifecycle"`

```

Where

* `CNB_USER_ID` and `CNB_GROUP_ID` are arbitrary values that need to be consistent, which both have a default value of `1000`.
* `CNB_PLATFORM_API` or the `Platform API` version, varies depending on the use case. This tutorial uses `v0.14`, which is the latest [Platform API][Platform API] version.
* `CNB_SAMPLES_PATH` represents the path of our local copy of the `samples` directory.
* `CNB_LIFECYCLE_PATH` represents the path of our local compiled `lifecycle` directory.

### Examine lifecycle phases

A single app image build consists of the following phases:

1. [Analysis](#analyze)
2. [Detection](#detect)
3. [Cache Restoration](#restore)
4. [Build](#build)
5. [Export](#export)

> Note that a `platform` executes the phases above either by invoking phase-specific lifecycle binaries in order or by executing `/cnb/lifecycle/creator`.

Let's expand each `lifecycle` phase to explain how the `lifecycle` orchestrates buildpacks:

#### Analyze

The `analyze` phase runs before the `detect` phase in order to validate registry access for all images used during the `build` as early as possible. In this way it provides faster failures for end users.

Prior to executing `/cnb/lifecycle/analyzer`, you need to create two directories in the `root` directory as follows:

```text

mkdir -p apps/bash-script
mkdir -p layers

```

* `apps` directory that contains a `bash-script` directory
* `layers` directory that contains subdirectories representing each layer created by the Buildpack in the final image or build cache.

Next,  you need to copy the `bash-script` samples into our `apps/bash-script` directory, which will host our app's source code.

```text

cp -r "$CNB_SAMPLES_PATH/apps/bash-script/" ./apps/bash-script

```

Now, you can invoke the `analyzer` for `AMD64` and `ARM64` architectures respectively

```text

$CNB_LIFECYCLE_PATH/analyzer -log-level debug -daemon -layers="./layers" -run-image cnbs/sample-stack-run:bionic apps/bash-script

```

```text

$CNB_LIFECYCLE_PATH/analyzer -log-level debug -daemon -layers="./layers" -run-image arm64v8/ubuntu:latest apps/bash-script

```

The commands above run the `analyzer` with:

* A `debug` logging level
* Pointing to the local `Docker daemon`
* Pointing to the `layers` directory, which is the main `lifecycle` working directory
* Running the specified image
* The path to the app that you are analyzing

Now the `analyzer`:

* Checks a registry for previous images called `apps/bash-script`.
* Resolves the image metadata making it available to the subsequent `restore` phase.
* Verifies that you have write access to the registry to create or update the image called `apps/bash-script`.

In this tutorial, there is no previous `apps/bash-script` image, and the output produced should be similar to the following:

```text

PLACEHOLDER

```

Now checking the `layers` directory you should have a `analyzer.toml` file with a bunch of null entries.

#### Detect

#### Restore

The `restorer` retrieves cache contents, if it contains any, into the build container. During this phase, the `restorer` looks for layers that could be reused or should be replaced while building the application image.

First, you need to create the `cache` directory, and then run the `restorer` binary as follows:

```text

mkdir cache

```

```text

$CNB_LIFECYCLE_PATH/restorer -log-level debug -layers="./layers" -group="./layers/group.toml" -cache-dir="./cache" -analyzed="./layers/analyzed.toml"

```

The `cache` directory should now be populated by two sub-directories, `committed` and `staging` as shown in the output below:

```text

Starting restorer...
Parsing inputs...
Ensuring privileges...
Executing command...
Timer: Restorer started at 2023-08-30T17:10:54+02:00
Restoring Layer Metadata
Reading buildpack directory: <REDACTED>/github.com/dlion/unpackingCNB/layers/samples_hello-world
Reading buildpack directory: <REDACTED>/github.com/dlion/unpackingCNB/layers/samples_hello-moon
Reading Buildpack Layers directory <REDACTED>/github.com/dlion/unpackingCNB/layers
Reading buildpack directory: <REDACTED>/github.com/dlion/unpackingCNB/layers/samples_hello-world
Reading Buildpack Layers directory <REDACTED>/github.com/dlion/unpackingCNB/layers
Reading buildpack directory: <REDACTED>/github.com/dlion/unpackingCNB/layers/samples_hello-moon
Timer: Restorer ran for 832.458µs and ended at 2023-08-30T17:10:54+02:00

```

#### Build

#### Export

> This tutorial is based on a [blog post][blog post] contributed by one of our community.

[pack]: https://buildpacks.io/docs/for-platform-operators/how-to/integrate-ci/pack/
[kpack]: https://buildpacks.io/docs/for-platform-operators/how-to/integrate-ci/kpack/
[lifecycle]: https://buildpacks.io/docs/for-platform-operators/concepts/lifecycle/
[Platform API]: https://github.com/buildpacks/spec/releases?q=platform
[blog post]: https://medium.com/buildpacks/unpacking-cloud-native-buildpacks-ff51b5a767bf
