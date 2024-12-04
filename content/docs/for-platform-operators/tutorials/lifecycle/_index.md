+++
title="Orchestrate a build with the CNB lifecycle"
weight=1
expand=true
include_summaries=true
+++

A `platform` orchestrates builds by invoking the [lifecycle][lifecycle] binary together with buildpacks and application source code to produce a runnable `OCI image`.

<!--more-->

<!-- test:suite=orchastrate-lifecycle;weight=1 -->

<!-- test:setup:exec;exit-code=-1 -->
<!--
```bash
mkdir /tmp/tutorial
git clone https://github.com/buildpacks/lifecycle /tmp/tutorial/lifecycle
git clone https://github.com/buildpacks/samples /tmp/tutorial/samples
```
-->

<!-- test:teardown:exec -->
<!--
```bash
rm -rf /tmp/tutorial
```
-->

The majority of Buildpack users use community-maintained platforms, such as [pack][pack] and [kpack][kpack], to run Buildpacks and create `OCI images`. However this might not be desireable especially for users maintaining their own platforms and seeking more control over how the underlying Buildpack `lifecycle phases` are executed.

> This tutorial is derived from a [blog post][blog post] contributed by one of our community members.

In this step-by-step tutorial, you will build a `Bash` application without using any `platform` tooling like `pack` or `kpack`. You will also leverage the individual `lifecycle phases` to produce a runnable application image.

## Prerequisites

This tutorial has been tested on linux amd64 and darwin arm64 platforms. You'll need to clone a local copy of the following to get started:

* The CNB `lifecycle`
  
  ```text
  git clone https://github.com/buildpacks/lifecycle
  ```

* The official `Buildpack.io` samples repo
  
  ```text
  git clone https://github.com/buildpacks/samples
  ```

As previously mentioned, the `lifecycle` orchestrates `Buildpacks` then assembles the resulting artifacts into an `OCI image`.  The `lifecycle` is composed of a series of distinct `phases` that need to be executed to have the final image built and exported.

## Overview

Now that you’re set up, let’s build our `Bash` application and dive deeper into the `lifecycle` and its phases.

### Build the lifecycle

As a starting step, you need to build the `lifecycle` in order to use its phases. This could be done by navigating to the `lifecycle` directory and executing one of the following commands, depending on your system architecture.

* `make build-linux-amd64` for `AMD64` architectures (for Linux users)
* `make build-darwin-arm64 && make build-linux-arm64-launcher` for `ARM64` architectures (for Mac users)

<!-- test:exec -->
<!--
```bash
cd /tmp/tutorial/lifecycle
make build-linux-amd64 # hardcode CI tests to linux-amd64
```
-->

It's recommended to check the [lifecycle releases][releases] page to download binaries based on your system.
> Please note that the entire process is most easily followed on Linux systems

### Set environment variables

In order to execute the various `lifecycle phases` correctly, you first need to set the values of few important environment variables by running the following commands in the terminal:

```command
export CNB_USER_ID=$(id -u) CNB_GROUP_ID=$(id -g) CNB_PLATFORM_API=0.14
export CNB_SAMPLES_PATH="/<your-path>/samples"
export CNB_LIFECYCLE_PATH="/<your-path/lifecycle/out/<your-os-arch>/lifecycle"
```

Where

* `CNB_USER_ID` and `CNB_GROUP_ID` are arbitrary values that need to be consistent. This example re-uses our user id and group id for the `CNB` user.  In a production system, these are commonly set to `1000`.
* `CNB_PLATFORM_API` or the `Platform API` version, varies depending on the use case. This tutorial uses `v0.14`, which is the latest [Platform API][Platform API] version.
* `CNB_SAMPLES_PATH` represents the path of our local copy of the `samples` directory.
* `CNB_LIFECYCLE_PATH` represents the path of our local compiled `lifecycle` directory.

> Please note that  we only run the commands above on a host machine for the purpose of this tutorial, which is not a common practice for buildpacks.

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

Prior to executing `/cnb/lifecycle/analyzer`, you need to create a parent directory for this tutorial and two other directories inside it as follows:

<!-- test:exec -->
```command
mkdir -p /tmp/tutorial # or your preferred directory
cd /tmp/tutorial
mkdir -p apps/bash-script
mkdir -p layers
```

* `apps` directory that contains a `bash-script` directory
* `layers` directory that contains subdirectories representing each layer created by the Buildpack in the final image or build cache.

Next,  you need to copy the `bash-script` samples into our `apps/bash-script` directory, which will host our app's source code.

```command
cp -r "${CNB_SAMPLES_PATH}/apps/bash-script" ./apps/
```

<!-- test:exec -->
<!--
```command
cp -r "/tmp/tutorial/samples/apps/bash-script" ./apps/
```
-->

Now, you can invoke the `analyzer` for `AMD64` architecture

```text
${CNB_LIFECYCLE_PATH}/analyzer -log-level debug -daemon -layers="./layers" -run-image cnbs/sample-stack-run:noble apps/bash-script
```

<!-- test:exec -->
<!--
```command
export CNB_USER_ID=$(id -u) CNB_GROUP_ID=$(id -g) CNB_PLATFORM_API=0.14
export CNB_LIFECYCLE_PATH=/tmp/tutorial/lifecycle/out/linux-amd64/lifecycle
${CNB_LIFECYCLE_PATH}/analyzer -log-level debug -daemon -layers="./layers" -run-image cnbs/sample-stack-run:jammy apps/bash-script
```
-->

Or if you are on an `ARM64` platform

```text
${CNB_LIFECYCLE_PATH}/analyzer -log-level debug -daemon -layers="./layers" -run-image arm64v8/ubuntu:latest apps/bash-script
```

The commands above run the `analyzer` with:

* A `debug` logging level
* Pointing to the local `Docker daemon` as the repository where the lifecycle should look for images
* Pointing to the `layers` directory, which is the `lifecycle`'s main working directory
* Pointing to a `run` image, the base image for the application
* Specifying a name for the final application image

Now the `analyzer`:

* Checks the image repository (`daemon` in this case) for a previous image called `apps/bash-script`
* Reads metadata from the previous image (if it exists) for later use
* Verifies that have permission to create or update the image called `apps/bash-script` in the image repository

In this tutorial, there is no previous `apps/bash-script` image, and the output produced should be similar to the following:

<!-- test:assert=contains;ignore-lines=... -->
```text

...
Starting analyzer...
Parsing inputs...
Ensuring privileges...
Executing command...
...
Image with name "apps/bash-script" not found
Image with name "cnbs/sample-stack-run:noble" not found
Timer: Analyzer ran for 41.92µs and ended at 2024-09-30T07:38:14Z
Run image info in analyzed metadata is: 
{"Reference":"","Image":"cnbs/sample-stack-run:noble","Extend":false,"target":{"os":"linux","arch":"amd64"}}
```

Now if you `cat ./layers/analyzed.toml`, you should see a few null entries, a `run-image` section that records the provided name provided, and the found `os/arch`.

#### Detect

In this phase, the `detector` looks for an ordered group of buildpacks that will be used during the `build` phase. The `detector` requires an `order.toml` file to be provided. We can derive an order from `builder.toml` in the `samples` directory while removing the deprecated `stack` section as follows:

```text
cat "${CNB_SAMPLES_PATH}/builders/noble/builder.toml" | grep -v -i "stack" | sed 's/\.\.\/\.\./\./' > order.toml

```

`order.toml` files contain a list of groups with each group containing a list of buildpacks. The `detector` reads `order.toml` and looks for the first group that passes the detection process.

##### Set buildpacks layout directory

Before running the `detector`, you need to:

1. Create a `buildpacks` directory in the `root` directory

    ```text
    mkdir -p buildpacks
    ```

2. Then you must populate the `buildpacks` directory with your buildpacks of interest.

    > You have to follow the [directory layout][directory layout] defined in the buildpack spec, where each top-level directory is a `buildpack ID` and each second-level directory is a `buildpack version`.

    We will use [`dasel`](http://github.com/tomwright/dasel/) to help us parse toml files.

    ```command
    $ go install github.com/tomwright/dasel/v2/cmd/dasel@master
    ```

    Let’s do that for every buildpack in the `samples/buildpacks` directory:

    ```text
    for f in $(ls --color=no ${CNB_SAMPLES_PATH}/buildpacks | grep -v README)
    do
    bp_version=$(cat ${CNB_SAMPLES_PATH}/buildpacks/$f/buildpack.toml | dasel -r toml buildpack.version | sed s/\'//g);
    mkdir -p ./buildpacks/samples_"${f}"/${bp_version}
    cp -r "$CNB_SAMPLES_PATH/buildpacks/${f}/" ./buildpacks/samples_"${f}"/${bp_version}/
    done
    ```

Now, you can run the `detector` binary:

```text
${CNB_LIFECYCLE_PATH}/detector -log-level debug -layers="./layers" -order="./order.toml" -buildpacks="./buildpacks" -app apps/bash-script
```

The output of the above command should have `layers/group.toml` and `layers/plan.toml` output files (i.e., the groups that have passed the detection have been written into the `group.toml` file writing its build plan into the `plan.toml` file)

```text
Starting detector...
Parsing inputs...
Ensuring privileges...
Executing command...
Timer: Detector started at 2024-10-01T07:00:50Z
Checking for match against descriptor: {linux   []}
target distro name/version labels not found, reading /etc/os-release file
Checking for match against descriptor: {linux   []}
target distro name/version labels not found, reading /etc/os-release file
Checking for match against descriptor: {linux   []}
target distro name/version labels not found, reading /etc/os-release file
Checking for match against descriptor: {linux   []}
target distro name/version labels not found, reading /etc/os-release file
Checking for match against descriptor: {linux   []}
======== Results ========
fail: samples/java-maven@0.0.2
======== Results ========
fail: samples/kotlin-gradle@0.0.2
======== Results ========
fail: samples/ruby-bundler@0.0.1
======== Results ========
pass: samples/hello-world@0.0.1
pass: samples/hello-moon@0.0.1
Resolving plan... (try #1)
samples/hello-world 0.0.1
samples/hello-moon  0.0.1
Timer: Detector ran for 26.011769ms and ended at 2024-10-01T07:00:50Z
```

You can view more details about the [order](https://buildpacks.io/docs/for-platform-operators/concepts/lifecycle/detect/#ordertoml), [group](https://buildpacks.io/docs/for-platform-operators/concepts/lifecycle/detect/#grouptoml) and [plan](https://buildpacks.io/docs/concepts/components/lifecycle/detect/#plantoml) toml files in the platform documentation.

#### Restore

The `restorer` copies cache contents, if there is a cache, into the build container. This avoids buildpacks having to re-download build-time dependencies that were downloaded during a previous build.

This tutorial doesn't have any previous builds, i.e., the `analyze` phase didn't return any `cached` image. Therefore the `restore` phase will not be copying any `cache` contents at this stage. Feel free to inspect the `cache` when the `build` is done, and re-run the tutorial using the cache created to see how this speeds things up.

Meanwhile you can start by creating a `cache` directory, and then run the `restorer` binary as added below:

```text
mkdir cache
```

```text
${CNB_LIFECYCLE_PATH}/restorer -log-level debug -daemon -layers="./layers" -group="./layers/group.toml" -cache-dir="./cache" -analyzed="./layers/analyzed.toml"
```

The `cache` directory should now be populated by two sub-directories, `committed` and `staging` as shown in the output below:

```text
Starting restorer...
Parsing inputs...
Ensuring privileges...
Executing command...
No run metadata found at path "/cnb/run.toml"
Run image info in analyzed metadata is: 
{"Reference":"","Image":"cnbs/sample-stack-run:noble","Extend":false,"target":{"os":"linux","arch":"amd64"}}
Timer: Restorer started at 2024-10-01T07:03:47Z
Restoring Layer Metadata
Reading buildpack directory: /tmp/example/layers/samples_hello-world
Reading buildpack directory: /tmp/example/layers/samples_hello-moon
Reading Buildpack Layers directory /tmp/example/layers
Reading buildpack directory: /tmp/example/layers/samples_hello-world
Reading Buildpack Layers directory /tmp/example/layers
Reading buildpack directory: /tmp/example/layers/samples_hello-moon
Timer: Restorer ran for 274.41µs and ended at 2024-10-01T07:03:47Z
```

#### Build

The `builder` run buildpacks, that do the actual work of transforming application source code into runnable artifacts.

Before running the `builder`, the following steps are required:

1. Create two directories:
   * `platform` directory to store platform configuration and environment variables
   * `workspace` directory to store the application source code
  
    ```text
    mkdir -p platform
    mkdir -p workspace
    ```

2. Copy the source code from the `app` directory to the `workspace` directory

    ```text
    cp -r apps/bash-script/* ./workspace
    ```

3. Create a `launcher` file with instructions to run your application. Note that in a real buildpacks build, the `platform` does not create this file! The `samples/hello-moon` buildpack would create it. In our case, the `samples/hello-moon` buildpack hasn't been updated with this functionality, so we are faking that behavior.

    ```text
    mkdir -p layers/samples_hello-moon
    cat << EOF > ./layers/samples_hello-moon/launch.toml
    [[processes]]
    type = "shell"
    command = ["./app.sh"]
    EOF
    ```

Now you're ready to run the `builder` as follows:

```text
${CNB_LIFECYCLE_PATH}/builder -log-level debug -layers="./layers" -group="./layers/group.toml" -analyzed="./layers/analyzed.toml" -plan="./layers/plan.toml" -buildpacks="./buildpacks" -app="./workspace" -platform="./platform"
```

Taking a look at the following output shows that you have invoked the two buildpacks that we need in order to run our `bash-script` application.

```text
Starting builder...
Parsing inputs...
Ensuring privileges...
Executing command...
Timer: Builder started at 2024-10-01T07:07:46Z
target distro name/version labels not found, reading /etc/os-release file
Running build for buildpack samples/hello-world@0.0.1
Looking up buildpack
Finding plan
Creating plan directory
Preparing paths
Running build command
---> Hello World buildpack
     platform_dir files:
       /tmp/example/platform:
       total 0
       drwxr-xr-x 2 gitpod gitpod  40 Oct  1 07:04 .
       drwxr-xr-x 8 gitpod gitpod 180 Oct  1 07:04 ..
     env_dir: /tmp/example/platform/env
     env vars:
       declare -x CNB_BP_PLAN_PATH="/tmp/samples_hello-world-576309032/samples_hello-world/plan.toml"
       declare -x CNB_BUILDPACK_DIR="/tmp/example/buildpacks/samples_hello-world/0.0.1"
       declare -x CNB_LAYERS_DIR="/tmp/example/layers/samples_hello-world"
       declare -x CNB_PLATFORM_DIR="/tmp/example/platform"
       declare -x CNB_TARGET_ARCH="amd64"
       declare -x CNB_TARGET_DISTRO_NAME="ubuntu"
       declare -x CNB_TARGET_DISTRO_VERSION="22.04"
       declare -x CNB_TARGET_OS="linux"
       declare -x HOME="/home/gitpod"
       declare -x HOSTNAME="buildpacks-docs-dusxugo5ehi"
       declare -x OLDPWD
       declare -x PATH="/bin:/usr/bin:/usr/local/bin"
       declare -x PWD="/tmp/example/workspace"
       declare -x SHLVL="1"
     layers_dir: /tmp/example/layers/samples_hello-world
     plan_path: /tmp/samples_hello-world-576309032/samples_hello-world/plan.toml
     plan contents:
       [[entries]]
         name = "some-world"
       
       [[entries]]
         name = "some-world"
         [entries.metadata]
           world = "Earth-616"
---> Done
Processing layers
Updating environment
Reading output files
Updating buildpack processes
Updating process list
Finished running build for buildpack samples/hello-world@0.0.1
Running build for buildpack samples/hello-moon@0.0.1
Looking up buildpack
Finding plan
Creating plan directory
Preparing paths
Running build command
---> Hello Moon buildpack
     env_dir: /tmp/example/platform/env
     env vars:
       declare -x CNB_BP_PLAN_PATH="/tmp/samples_hello-moon-3356528850/samples_hello-moon/plan.toml"
       declare -x CNB_BUILDPACK_DIR="/tmp/example/buildpacks/samples_hello-moon/0.0.1"
       declare -x CNB_LAYERS_DIR="/tmp/example/layers/samples_hello-moon"
       declare -x CNB_PLATFORM_DIR="/tmp/example/platform"
       declare -x CNB_TARGET_ARCH="amd64"
       declare -x CNB_TARGET_DISTRO_NAME="ubuntu"
       declare -x CNB_TARGET_DISTRO_VERSION="22.04"
       declare -x CNB_TARGET_OS="linux"
       declare -x HOME="/home/gitpod"
       declare -x HOSTNAME="buildpacks-docs-dusxugo5ehi"
       declare -x OLDPWD
       declare -x PATH="/bin:/usr/bin:/usr/local/bin"
       declare -x PWD="/tmp/example/workspace"
       declare -x SHLVL="1"
     layers_dir: /tmp/example/layers/samples_hello-moon
     plan_path: /tmp/samples_hello-moon-3356528850/samples_hello-moon/plan.toml
     plan contents:
---> Done
Processing layers
Updating environment
Reading output files
Updating buildpack processes
Updating process list
Finished running build for buildpack samples/hello-moon@0.0.1
Copying SBOM files
Creating SBOM files for legacy BOM
Listing processes
Timer: Builder ran for 20.200892ms and ended at 2024-10-01T07:07:46Z
```

#### Export

The purpose of the `export` phase is to take the output from buildpacks and package it into an `OCI` image using a combination of remote layers, local buildpack-contributed layers (under `<layers>`), and the processed `app` directory.

To export the artifacts built by the `builder`, you first need to specify where to find the `launcher` executable that will be bundled into your image as the entrypoint to run:

* For AMD64 architectures
  
  ```text
  export CNB_LINUX_LAUNCHER_PATH=/<your-path>/lifecycle/out/linux-amd64/lifecycle/launcher
  ```

* For ARM64 Architectures

  ```text
  export CNB_LINUX_LAUNCHER_PATH=/<your-path>/lifecycle/out/linux-arm64/lifecycle/launcher
  ```

Now you can run the `exporter`:

```text
${CNB_LIFECYCLE_PATH}/exporter --log-level debug -launch-cache "./cache" -daemon -cache-dir "./cache" -analyzed "./layers/analyzed.toml" -group "./layers/group.toml" -layers="./layers" -app "./workspace" -launcher="${CNB_LINUX_LAUNCHER_PATH}" apps/bash-script
```

You can verify that the image was successfully exported by running the `docker images` command.

### Run the app image

Finally, you can run the exported image as follows:

```text
docker run -it apps/bash-script ./app.sh
```

The output should look similar to the following:

```text

    |'-_ _-'|       ____          _  _      _                      _             _
    |   |   |      |  _ \        (_)| |    | |                    | |           (_)
     '-_|_-'       | |_) | _   _  _ | |  __| | _ __    __ _   ___ | | __ ___     _   ___
|'-_ _-'|'-_ _-'|  |  _ < | | | || || | / _` ||'_ \  / _\ | / __|| |/ // __|   | | / _ \
|   |   |   |   |  | |_) || |_| || || || (_| || |_) || (_| || (__ |   < \__ \ _ | || (_) |
 '-_|_-' '-_|_-'   |____/  \__,_||_||_| \__,_|| .__/  \__,_| \___||_|\_\|___/(_)|_| \___/
                                              | |
                                              |_|


Here are the contents of the current working directory:
.:
total 24
drwxr-xr-x 3 502 dialout 4096 Jan  1  1980 .
drwxr-xr-x 1 502 root    4096 Jan  1  1980 ..
-rw-r--r-- 1 502 dialout  692 Jan  1  1980 README.md
-rwxr-xr-x 1 502 dialout  736 Jan  1  1980 app.sh
drwxr-xr-x 3 502 dialout 4096 Jan  1  1980 bash-script-buildpack
-rw-r--r-- 1 502 dialout  202 Jan  1  1980 project.toml

./bash-script-buildpack:
total 16
drwxr-xr-x 3 502 dialout 4096 Jan  1  1980 .
drwxr-xr-x 3 502 dialout 4096 Jan  1  1980 ..
drwxr-xr-x 2 502 dialout 4096 Jan  1  1980 bin
-rw-r--r-- 1 502 dialout  226 Jan  1  1980 buildpack.toml

./bash-script-buildpack/bin:
total 16
drwxr-xr-x 2 502 dialout 4096 Jan  1  1980 .
drwxr-xr-x 3 502 dialout 4096 Jan  1  1980 ..
-rwxr-xr-x 1 502 dialout  345 Jan  1  1980 build
-rwxr-xr-x 1 502 dialout  242 Jan  1  1980 detect
```

## Wrapping up

At the end of this tutorial, we hope that you now have a better understanding of what happens during each `lifecycle phase`, and how you could use `Buildpacks` to create container images. You are now ready to explore this technology further and customize it to fit your application development and deployment needs.

[pack]: https://buildpacks.io/docs/for-platform-operators/how-to/integrate-ci/pack/
[kpack]: https://buildpacks.io/docs/for-platform-operators/how-to/integrate-ci/kpack/
[lifecycle]: https://buildpacks.io/docs/for-platform-operators/concepts/lifecycle/
[directory layout]: https://github.com/buildpacks/spec/blob/main/platform.md#buildpacks-directory-layout
[Platform API]: https://github.com/buildpacks/spec/releases?q=platform
[blog post]: https://medium.com/buildpacks/unpacking-cloud-native-buildpacks-ff51b5a767bf
[releases]: https://github.com/buildpacks/lifecycle/releases
