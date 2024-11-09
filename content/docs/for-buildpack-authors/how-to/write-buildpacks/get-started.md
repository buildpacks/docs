+++
title="Get started"
weight=1
+++

To write a buildpack, we follow the [Buildpack Specification](https://github.com/buildpacks/spec/blob/main/buildpack.md),
which defines the contract between buildpacks and the lifecycle.

<!--more-->

A buildpack must contain three files:

* `buildpack.toml`
* `bin/detect`
* `bin/build`

The two files in `bin/` must be executable.
They can be shell scripts written in a language like Bash,
or they can be executables compiled from a language like Go.

## `buildpack.toml`

A buildpack must contain a `buildpack.toml` file in its root directory.

### Example

```toml
api = "0.10"

[buildpack]
id = "example.com/python"
version = "1.0"

# Targets the buildpack will work with
[[targets]]
os = "linux"

# Stacks (deprecated) the buildpack will work with
[[stacks]]
id = "io.buildpacks.stacks.noble"
```

For more information, see [buildpack config](/docs/reference/config/buildpack-config).

## `bin/detect`

### Usage

```txt
bin/detect
```

### Summary

`bin/detect` is used to determine if a buildpack can work with a given codebase.
It will often check for the existence of a particular file,
or some configuration indicating what kind of application has been provided.

Two environment variables identify important file system paths:

* `CNB_PLATFORM_DIR` - a directory containing platform provided configuration, such as environment variables.
* `CNB_BUILD_PLAN_PATH` - a path to a file containing the [build plan].

In addition, the working directory for `bin/detect` is the application directory.

`bin/detect` must return an exit code of `0` if the codebase can be serviced by this buildpack,
and `100` if it cannot.
Other exit codes indicate an error during detection.

### Example

This is a simple example of a buildpack that detects a Python application
by checking for the presence of a `requirements.txt` file:

```bash
#!/bin/sh

if [ -f requirements.txt ]; then
  echo "Python Buildpack"
  exit 0
else
  exit 100
fi
```

## `bin/build`

### Usage

```txt
bin/build
```

`bin/build` does (all or part of) the work of transforming application source code into a runnable artifact.
It will often resolve dependencies, install binary packages, and compile code.
Three environment variables identify important file system paths:

* `CNB_LAYERS_DIR` - a directory that may contain subdirectories representing each layer created by the buildpack in the final image or build cache.
* `CNB_PLATFORM_DIR` - a directory containing platform provided configuration, such as environment variables.
* `CNB_BP_PLAN_PATH` - a path to a file containing the [build plan].

In addition, the working directory for `bin/build` is the application directory.

All changes to the codebase in the working directory will be persisted in the final image,
along with any launch layers created in the `CNB_LAYERS_DIR`.

It is important to note that multiple buildpacks may work together to create the final image,
each contributing a subset of the dependencies or configuration needed to run the application.
In this way, buildpacks are modular and composable.

[build plan]: /docs/for-buildpack-authors/how-to/write-buildpacks/use-build-plan
