
+++
title="Create a run base image"
aliases=[
  "/docs/operator-guide/create-run-base"
]
weight=2
+++

The runtime base image provides the OS-level dependencies for applications at runtime.

<!--more-->

## Define a run base image for your CNB build

We need a Dockerfile similar to the following:

```Dockerfile
# Define the base image
FROM ubuntu:noble

# Install packages that we want to make available at run time
RUN apt-get update && \
  apt-get install -y xz-utils ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# Create user and group
ARG cnb_uid=1000
ARG cnb_gid=1000
RUN groupadd cnb --gid ${cnb_gid} && \
  useradd --uid ${cnb_uid} --gid ${cnb_gid} -m -s /bin/bash cnb

# Set user and group
USER ${cnb_uid}:${cnb_gid}

# Set required CNB target information
LABEL io.buildpacks.base.distro.name="your distro name"
LABEL io.buildpacks.base.distro.version="your distro version"
```

### Define the base image

We start with `ubuntu:noble` as our base image.
You can use any operating system, operating system distribution, and operating system distribution version of your choosing,
as long as your application will run there.

### Install packages that we want to make available at run time

Install any system packages that your application will need.

### Create user and group, set user and group

The `USER` in the image config may be different from the build-time user (though the group ID should probably be the same).
You should consult the documentation for your buildpacks to determine what is supported.

### Set required CNB target information

Finally, we need to label the image with operating system distribution information for platforms and the lifecycle to use.

To determine which values to provide, see [targets](/docs/for-buildpack-authors/concepts/targets/) concept information.

## Build the run base image

```bash
docker build . -t cnbs/sample-base-run:noble
```
