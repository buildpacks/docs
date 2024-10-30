
+++
title="Putting it all together"
aliases=[
  "/docs/operator-guide/create-a-builder"
]
weight=3
+++

After you have created a build-time base image and a runtime base image, you are ready to create your builder!

<!--more-->

As part of this guide we'll create a basic builder that uses mostly no-op buildpacks to show you around a bit.

### 0. Grab the sample repo

Before we start, let's pull down a few buildpacks from our [samples][samples] repo.

```bash
# clone the repo
git clone https://github.com/buildpacks/samples
```

### 1. Builder configuration

First, let's create a [builder configuration file][builder-config] (`builder.toml`) with the following contents:

```toml
# Buildpacks to include in builder
[[buildpacks]]
uri = "samples/buildpacks/hello-processes"

[[buildpacks]]
# Packaged buildpacks to include in builder;
# the "hello-universe" package contains the "hello-world" and "hello-moon" buildpacks
uri = "docker://cnbs/sample-package:hello-universe"

# Order used for detection
[[order]]
    # This buildpack will display build-time information (as a dependency)
    [[order.group]]
    id = "samples/hello-world"
    version = "0.0.1"

    # This buildpack will display build-time information (as a dependant)
    [[order.group]]
    id = "samples/hello-moon"
    version = "0.0.1"

    # This buildpack will create a process type "sys-info" to display runtime information
    [[order.group]]
    id = "samples/hello-processes"
    version = "0.0.1"

# Base images used to create the builder
[build]
image = "cnbs/sample-base-build:noble"
[run]
[[run.images]]
image = "cnbs/sample-base-run:noble"
mirrors = ["other-registry.example.com/cnbs/sample-base-run:noble"]

# Stack (deprecated) used to create the builder
[stack]
id = "io.buildpacks.samples.stacks.noble"
# This image is used at runtime
run-image = "cnbs/sample-base-run:noble"
run-image-mirrors = ["other-registry.example.com/cnbs/sample-base-run:noble"]
# This image is used at build-time
build-image = "cnbs/sample-base-build:noble"
```

### 2. Create builder

Creating a builder is now as simple as running the following command:

```bash
# create builder
pack builder create my-builder:noble --config ./builder.toml
```

> **TIP:** `builder create` has a `--publish` flag that can be used to publish the generated builder image to a registry.

**Congratulations!** You've got a custom builder.

### 3. Use your builder

Let's go a little further and use our builder to [`build`][build] an app by running:

```bash
pack build my-app --builder my-builder:noble --path samples/apps/java-maven/
```

### 4. Running the app

Remember that we mentioned that the buildpacks we used as part of this builder don't really do much. To be honest, they
didn't even use the app source code. What they did do was show the environment in which they run on and now by running
the app image with `--entrypoint sys-info` we can see the runtime information as well.

```bash
docker run --rm --entrypoint sys-info -it my-app
```

We're sure you'll be able to create more useful builders.

### References

For additional sample builders and buildpacks, check out our [samples][samples] repo.

You can also check out our reference of the builder config [here][builder-config].

[build]: /docs/for-app-developers/concepts/build/
[builder]: /docs/for-platform-operators/concepts/builder/
[builder-config]: /docs/reference/builder-config/
[samples]: https://github.com/buildpacks/samples
