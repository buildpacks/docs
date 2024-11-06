
+++
title="Create a build base image"
aliases=[
  "/docs/operator-guide/create-build-base"
]
weight=1
+++

The build-time base image provides the OS-level dependencies for buildpacks at build-time.

<!--more-->

## Define a build base image for your CNB build

We need a Dockerfile similar to the following:

```Dockerfile
# Define the base image
FROM ubuntu:noble

# Install packages that we want to make available at build time
RUN apt-get update && \
  apt-get install -y xz-utils ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# Set required CNB user information
ARG cnb_uid=1000
ARG cnb_gid=1000
ENV CNB_USER_ID=${cnb_uid}
ENV CNB_GROUP_ID=${cnb_gid}

# Create user and group
RUN groupadd cnb --gid ${CNB_GROUP_ID} && \
  useradd --uid ${CNB_USER_ID} --gid ${CNB_GROUP_ID} -m -s /bin/bash cnb

# Set user and group
USER ${CNB_USER_ID}:${CNB_GROUP_ID}

# Set required CNB target information
LABEL io.buildpacks.base.distro.name="your distro name"
LABEL io.buildpacks.base.distro.version="your distro version"
```

### Define the base image

We start with `ubuntu:noble` as our base image.
You can use any operating system, operating system distribution, and operating system distribution version of your choosing,
as long as they are supported by the available buildpacks.

### Install packages that we want to make available at build time

Install any system packages that your buildpacks will need.

### Set required CNB user information

We need to define `CNB_USER_ID` and `CNB_GROUP_ID` in the environment so that the lifecycle can run as the correct user.

### Create user and group, set user and group

The `USER` in the image config must match the user indicated by `CNB_USER_ID` and `CNB_GROUP_ID`.

The given user **MUST NOT** be a root user, and must have a writeable home directory.

### Set required CNB target information

Finally, we need to label the image with operating system distribution information for platforms and the lifecycle to use.

To determine which values to provide, see [targets](/docs/for-buildpack-authors/concepts/targets/) concept information.

## Build the build base image

```bash
docker build . -t cnbs/sample-base-build:noble
```
