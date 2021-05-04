+++
title="Create a stack"
weight=2
+++

Creating a custom [stack][stack] allows you to configure the base images for the build-time environment for your [builder][builder] and the run-time for your application.

<!--more-->

## Prerequisites

Before we get started, make sure you've got the following installed: 

{{< download-button href="https://store.docker.com/search?type=edition&offering=community" color="blue" >}} Install Docker {{</>}}


## Creating a custom stack

In this tutorial we will create a sample stack based on `Ubuntu Bionic`. To create a custom stack, we need to create customized build and run images. Let's see how we can do so!


### Create a common base image

Let's start by creating a base image containing layers that will be required by both the `build` and `run` images. In order to do this, switch to a clean workspace and create a `Dockerfile` as specified below:

#### Defining the base
We start with `ubuntu:bionic` as our `base` image. Since we will be reusing these layers in both our build and run images we will be defining a common base image and leveraging [Docker's multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/) to ensure this acts as the common base image for both our build-time and run-time environment.

```Dockerfile
# 1. Set a common base
FROM ubuntu:bionic as base
```

#### Set required CNB information

Next, we will be setting up the base image as required by the [Cloud-Native Buildpack specification][stack-spec] noted below.

##### Specification

**Labels**

| Name                     | Description              | Format |
| ------------------------ | ------------------------ | ------ |
| `io.buildpacks.stack.id` | Identifier for the stack | String |

**Environment Variables**

| Name           | Description                            |
| -------------- | -------------------------------------- |
| `CNB_STACK_ID` | Identifier for the stack               |
| `CNB_USER_ID`  | UID of the user specified in the image |
| `CNB_GROUP_ID` | GID of the user specified in the image |
<p class="spacer"></p>

> **NOTE:** The **stack identifier** implies compatibility with other stacks of that same identifier. For instance, a custom stack may use
> `io.buildpacks.stacks.bionic` as its identifier so long as it will work with buildpacks that declare compatibility with the
> `io.buildpacks.stacks.bionic` stack.


The `CNB_USER_ID` is the `UID`  of the user as which the `detect` and `build` steps are run. The given user **MUST NOT** be a root user
and have it's home directly writeable. `CNB_GROUP_ID` is the primary `GID` of the above user.

Let's update the `Dockerfile` to reflect the above specification.

```Dockerfile
# 1. Set a common base
FROM ubuntu:bionic as base

# ========== ADDED ===========
# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000
ENV CNB_STACK_ID="io.buildpacks.samples.stacks.bionic"
LABEL io.buildpacks.stack.id="io.buildpacks.samples.stacks.bionic"

# 3. Create the user
RUN groupadd cnb --gid ${CNB_GROUP_ID} && \
  useradd --uid ${CNB_USER_ID} --gid ${CNB_GROUP_ID} -m -s /bin/bash cnb
```

#### Install base system packages

Next up, we will be installing any system packages that we want to make available to both our build-time and run-time environment. Our `Dockerfile` should now look like -

```Dockerfile
# 1. Set a common base
FROM ubuntu:bionic as base

# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000
ENV CNB_STACK_ID="io.buildpacks.samples.stacks.bionic"
LABEL io.buildpacks.stack.id="io.buildpacks.samples.stacks.bionic"

# 3. Create the user
RUN groupadd cnb --gid ${CNB_GROUP_ID} && \
  useradd --uid ${CNB_USER_ID} --gid ${CNB_GROUP_ID} -m -s /bin/bash cnb

# ========== ADDED ===========
# 4. Install common packages
RUN apt-get update && \
  apt-get install -y xz-utils ca-certificates && \
  rm -rf /var/lib/apt/lists/*
```

That should be it for our base image! Let's verify that we can successfully build this image by running:

```bash
docker build . -t cnbs/sample-stack-base:bionic --target base
```

### Creating the run image

Next up, we will create the run image. The run image is the base image for your runtime application environemnt.

In order to create our run image all we need to do is to set the run image's `USER` to the user with `CNB_USER_ID`. Our final `Dockerfile` for the build image should look like - 


```Dockerfile
# 1. Set a common base
FROM ubuntu:bionic as base

# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000
ENV CNB_STACK_ID="io.buildpacks.samples.stacks.bionic"
LABEL io.buildpacks.stack.id="io.buildpacks.samples.stacks.bionic"

# 3. Create the user
RUN groupadd cnb --gid ${CNB_GROUP_ID} && \
  useradd --uid ${CNB_USER_ID} --gid ${CNB_GROUP_ID} -m -s /bin/bash cnb

# 4. Install common packages
RUN apt-get update && \
  apt-get install -y xz-utils ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# ========== ADDED ===========
# 5. Start a new run stage
FROM base as run

# 6. Set user and group (as declared in base image)
USER ${CNB_USER_ID}:${CNB_GROUP_ID}
```

That should be it for our run image! Let's verify that we can successfully build this image by running:

```bash
docker build . -t cnbs/sample-stack-run:bionic --target run
```

### Creating the build image

Next up, we will create the build image. The build image is the base image for you builder and should contain any common build-time
environment required by your buildpacks.


#### Install build packages

Let's modify the `Dockerfile` to look like - 

```Dockerfile
# 1. Set a common base
FROM ubuntu:bionic as base

# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000
ENV CNB_STACK_ID="io.buildpacks.samples.stacks.bionic"
LABEL io.buildpacks.stack.id="io.buildpacks.samples.stacks.bionic"

# 3. Create the user
RUN groupadd cnb --gid ${CNB_GROUP_ID} && \
  useradd --uid ${CNB_USER_ID} --gid ${CNB_GROUP_ID} -m -s /bin/bash cnb

# 4. Install common packages
RUN apt-get update && \
  apt-get install -y xz-utils ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# 5. Start a new run stage
FROM base as run

# 6. Set user and group (as declared in base image)
USER ${CNB_USER_ID}:${CNB_GROUP_ID}

# ========== ADDED ===========
# 7. Start a new build stage
FROM base as build

# 8. Install packages that we want to make available at build time
RUN apt-get update && \
  apt-get install -y git wget jq && \
  rm -rf /var/lib/apt/lists/* && \
  wget https://github.com/sclevine/yj/releases/download/v5.0.0/yj-linux -O /usr/local/bin/yj && \
  chmod +x /usr/local/bin/yj
```

#### Setting the `USER`

Lastly to finish off our build image, we need to set the image's `USER` to the user with `CNB_USER_ID`. Our final `Dockerfile` for the build image should look like - 

```Dockerfile
# 1. Set a common base
FROM ubuntu:bionic as base

# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000
ENV CNB_STACK_ID="io.buildpacks.samples.stacks.bionic"
LABEL io.buildpacks.stack.id="io.buildpacks.samples.stacks.bionic"

# 3. Create the user
RUN groupadd cnb --gid ${CNB_GROUP_ID} && \
  useradd --uid ${CNB_USER_ID} --gid ${CNB_GROUP_ID} -m -s /bin/bash cnb

# 4. Install common packages
RUN apt-get update && \
  apt-get install -y xz-utils ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# 5. Start a new run stage
FROM base as run

# 6. Set user and group (as declared in base image)
USER ${CNB_USER_ID}:${CNB_GROUP_ID}

# 7. Start a new build stage
FROM base as build

# 8. Install packages that we want to make available at build time
RUN apt-get update && \
  apt-get install -y git wget jq && \
  rm -rf /var/lib/apt/lists/* && \
  wget https://github.com/sclevine/yj/releases/download/v5.0.0/yj-linux -O /usr/local/bin/yj && \
  chmod +x /usr/local/bin/yj

# ========== ADDED ===========
# 9. Set user and group (as declared in base image)
USER ${CNB_USER_ID}:${CNB_GROUP_ID}
```

That should be it for our build image! Let's verify that we can successfully build this image by running:

```bash
docker build . -t cnbs/sample-stack-build:bionic --target build
```

**Congratulations!** You've got a custom stack!


## Additional information

### Mixins

Mixins provide a way to document OS-level dependencies that a stack provides to buildpacks. Mixins can be provided at build-time
(name prefixed with `build:`), run-time (name prefixed with `run:`), or both (name unprefixed).

#### Declaring provided mixins

When declaring provided mixins, both the build and run image of a stack must contain the following label:

| Name                         | Description             | Format            |
| ---------------------------- | ----------------------- | ----------------- |
| `io.buildpacks.stack.mixins` | List of provided mixins | JSON string array |

\
The following rules apply for mixin declarations:

 - `build:`-prefixed mixins may not be declared on a run image
 - `run:`-prefixed mixins may not be declared on a build image
 - Unprefixed mixins must be declared on both stack images

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
id = "io.buildpacks.stacks.bionic"
mixins = ["build:git", "run:imagemagick", "wget"]
```

## Resources

For sample stacks, see our [samples][samples] repo.
For technical details on stacks, see the [platform specification for stacks][stack-spec].

[stack]: /docs/concepts/components/stack/
[builder]: /docs/concepts/components/builder/
[samples]: https://github.com/buildpacks/samples
[stack-spec]: https://github.com/buildpacks/spec/blob/main/platform.md#stacks
