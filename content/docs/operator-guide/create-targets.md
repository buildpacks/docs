+++
title="Create Target Images"
weight=2
+++

Creating a custom Build and Run images allows you to configure the base images for the build-time environment for your [builder][builder] and the run-time for your application.

<!--more-->

## Prerequisites

Before we get started, make sure you've got the following installed: 

{{< download-button href="https://store.docker.com/search?type=edition&offering=community" color="blue" >}} Install Docker {{</>}}

## Creating custom images

In this tutorial we will create sample build and run images based on `Ubuntu Jammy.`

### Create a common base image

Let's start by creating a base image containing layers that will be required both the `build` and `run` images.
In order to do this, switch to a clean workspace and create a `Dockerfile` as specified below:

#### Defining the base
We start with `ubuntu:jammy` as our `base` image, and we hope you like jammy too!
Since we will be reusing these layers in both our build and run images we will be defining a common base image and leveraging [Docker's multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/) to ensure this acts as the common base image for both our build-time and run-time environment.

```Dockerfile
# 1. Set a common base
FROM ubuntu:jammy as base
```


#### Set required CNB information

Next, we will be setting up the base image as required by the [Cloud-Native Buildpack specification](https://github.com/buildpacks/spec/blob/main/platform.md).

##### Specification

The image's config's `os` and `architecture` should be set ot valid values according to the
[OCI Image Specification](https://github.com/opencontainers/image-spec/blob/main/config.md) with the addition of wildcards: 
Buildpack images may have their architecture set to `*` to indicate "any" - e.g. a shell script that is expected to succeed in any architecture could specify `*`. 
Similarly 

**Labels (optional)**

##### TODO / question:   I think the spec says that "the platform"  (as opposed to the build image author) should set the labels?
https://github.com/buildpacks/spec/pull/335/files#diff-e603760990971da3f77be4bb8d77c3405098f006814fd8c054d2d15f395b8330R199
should we mention them in this tutorial? 
##### end TODO /question



| Name                     | Description              | Format |
| ------------------------ | ------------------------ | ------ |
| `io.buildpacks.distribution.name` | OS Distribution Name | String |
| `io.buildpacks.distribution.version` | OS Distribution Version | String |

**Environment Variables**

| Name           | Description                            |
| -------------- | -------------------------------------- |
| `CNB_USER_ID`  | UID of the user specified in the image |
| `CNB_GROUP_ID` | GID of the user specified in the image |
<p class="spacer"></p>



The `CNB_USER_ID` is the `UID`  of the user as which the `detect` and `build` steps are run. The given user **MUST NOT** be a root user
and have it's home directly writable. `CNB_GROUP_ID` is the primary `GID` of the above user.

Let's update the `Dockerfile` to reflect the above specification.


```Dockerfile
# 1. Set a common base
FROM ubuntu:jammy as base

# ========== ADDED ===========
# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000

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
docker build . -t cnbs/sample-stack-base:jammy --target base
```

### Creating the run image

Next up, we will create the run image. The run image is the base image for your runtime application environment.

In order to create our run image all we need to do is to set the run image's `USER` to the user with `CNB_USER_ID`. Our final `Dockerfile` for the build image should look like - 


```Dockerfile
# 1. Set a common base
FROM ubuntu:jammy as base

# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000

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
docker build . -t cnbs/sample-run:jammy --target run
```

### Creating the build image

Next up, we will create the build image. The build image is the base image for you builder and should contain any common build-time
environment required by your buildpacks.


#### Install build packages

Let's modify the `Dockerfile` to look like - 

```Dockerfile
# 1. Set a common base
FROM ubuntu:jammy as base

# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000

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
FROM ubuntu:jammy as base

# 2. Set required CNB information
ENV CNB_USER_ID=1000
ENV CNB_GROUP_ID=1000

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
docker build . -t cnbs/sample-build:jammy --target build
```



**Congratulations!** You've got custom build and run images!



## Resources and Additional Information

**Image Extensions** provide a way to add functionality that could be shared by multiple base images. see:

[Image Extension Spec](https://github.com/buildpacks/spec/blob/main/image_extension.md) and [Extension Author Guide](https://buildpacks.io/docs/extension-author-guide/)


[builder]: /docs/concepts/components/builder/
[samples]: https://github.com/buildpacks/samples
