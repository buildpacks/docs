+++
title="Buildpack API"
weight=2
+++

This specification defines the interface between a buildpack and the environment that runs it.
This API will be used by buildpack authors.

A buildpack must contain three files:

* `buildpack.toml`
* `bin/detect`
* `bin/build`

The two files in `bin/` must be executable. They can be shell scripts written in a language like Bash or they
can be executables compiled from a language like Go.

## `bin/detect`

### Usage

```
bin/detect PLATFORM_DIR BUILD_PLAN
```

### Summary

This entrypoint is used to determine if a buildpack should
run against a given codebase. It will often check for the existence of a particular
file or some configuration indicating what kind of application has been provided.
It accepts two positional arguments:

* `PLATFORM_DIR` - a directory containing platform provided configuration, such as environment variables.
* `BUILD_PLAN` - a path to a file containing the [Build Plan](#build-plan).

In addition, the working directory is defined as the location of the codebase
the buildpack will execute against.

The executable must return an exit code of `0` if the codebase can be serviced by this buildpack. If the exit code is `0`, the script must print a human-readable name to `stdout`.

### Example

This is a simple example of a buildpack that detects a Python application by
checking for the presence of a `requirements.txt` file:

```
#!/bin/sh

if [ -f requirements.txt ]; then
  echo "Python Buildpack"
  exit 0
else
  exit 1
fi
```

## `bin/build`

### Usage

```
bin/build LAYERS_DIR PLATFORM_DIR BUILD_PLAN
```

This entrypoint transforms a codebase.
It will often resolve dependencies, install binary packages, and compile code.
It accepts three positional arguments:

* `LAYERS_DIR` - a directory that may contain subdirectories representing each layer created by the buildpack in the final image or build cache.
* `PLATFORM_DIR` - a directory containing platform provided configuration, such as environment variables.
* `BUILD_PLAN` - a path to a file containing the [Build Plan](#build-plan).

In addition, the working directory is defined as the location of the codebase
this buildpack will execute against.

All changes to the codebase in the working directory will be included in the final
image, along with any launch layers created in the `LAYERS_DIR`.

#### Layers

Each directory created by the buildpack under the `LAYERS_DIR` can be used for any
of the following purposes:

* Launch - the directory will be included in the run image as a single layer
* Cache - the directory will be included in the cache
* Build - the directory will be accessible by subsequent buildpacks

A buildpack defines how a layer will by used by creating a `<layer>.toml` with
a name matching the directory it describes in the `LAYERS_DIR`. For example, a
buildpack might create a `$LAYERS_DIR/python` directory and a `$LAYERS_DIR/python.toml`
with the following contents:

```
launch = true
cache = true
build = true
```

In this example, the `python` directory will be included in the run image,
cached for future builds, and will be accessible to subsequent buildpacks.

### Example

This is a simple example of a buildpack that runs Python's `pip` package manager
to resolve dependencies:

```
#!/bin/sh

LAYERS_DIR="$1"

PIP_LAYER="$LAYERS_DIR/pip"
mkdir -p "$PIP_LAYER/modules" "$PIP_LAYER/env"

pip install -r requirements.txt -t "$PIP_LAYER/modules" \
  --install-option="--install-scripts=$PIP_LAYER/bin" \
  --exists-action=w --disable-pip-version-check --no-cache-dir

echo "launch = true" > "$PIP_LAYER.toml"
```

## `buildpack.toml`

A buildpack must contain a `buildpack.toml` file in its root directory.


### Example

```
api = "0.2"

[buildpack]
id = "example.com/python"
version = "1.0"

[[stacks]]
id = "io.buildpacks.stacks.bionic"
```

### Schema

The schema is as follows:
- **`api`** _(string, required, current: `0.2`)_\
    The Buildpack API version the buildpack adheres to. Used to ensure [compatibility](#api-compatibility) against
    the [lifecycle][lifecycle].

    > Not to be confused with Cloud Foundry or Heroku buildpack versions. This version pertains to the interface
    > between the [buildpack][buildpack] and the [lifecycle][lifecycle] of Cloud Native Buildpacks.

- **`buildpack`** _(required)_\
    Information about the buildpack.

    - **`id`** _(string, required)_\
    A globally unique identifier.

    - **`version`** _(string, required)_\
    The version of the buildpack.

    - **`name`** _(string, required)_\
    Human readable name.

    - **`clear-env`** _(boolean, optional, default: `false`)_\
    Clears user-defined environment variables when `true` on executions of `bin/detect` and `bin/build`.

- **`stacks`** _(list, optional)_\
    A list of stacks supported by the buildpack.
    _If omitted, `order` list must be present. Cannot be used in conjunction with `order` list._

    - **`id`** _(string, required)_\
    The id of the supported stack.

    - **`mixins`** _(string list, required)_\
    A list of mixins required on the stack images.

- **`order`** _(list, optional)_\
  A list of buildpack groups for the purpose of creating a [meta-buildpack][meta-buildpack]. This list determines the
  order in which groups of buildpacks will be tested during detection. _If omitted, `stacks` list must be present.
  Cannot be used in conjunction with `stacks` list._

    - **`group`** _(list, required)_\
    A list of buildpack references.

        - **`id`** _(string, required)_\
          The identifier of a buildpack being referred to.
          Buildpacks with the same ID may appear in multiple groups at once but never in the same group.

        - **`version`** _(string, required)_\
          The version of the buildpack being referred to.

        - **`optional`** _(boolean, optional, default: `false`)_\
          Whether or not this buildpack is optional during detection.

- **`metadata`** _(any, optional)_\
    Arbitrary data for buildpack.

## Build Plan
The [Build Plan](https://github.com/buildpacks/spec/blob/master/buildpack.md#build-plan-toml) is a document the buildpacks can use to pass information between the [detect](#bindetect) and [build](#bindetect) phases. The build plan is passed (by the lifecycle) as a parameter to the `detect` and `build` binaries of the buildpack.
* During the `detect` phase, the buildpack(s) may write something it `requires` or `provides` (or both) into the Build Plan.
* During the `build` phase, the buildpack(s) may read the Buildpack Plan (a condensed version of the Build Plan, composed by the lifecycle) to determine what it should do, and refine the Buildpack Plan with more exact metadata (eg: what version dependency it requires).

A buildpack can `require` or `provide` multiple dependencies, and even multiple groupings of dependencies (using `or` lists). Additionally, multiple buildpacks may `require` or `provide` the same dependency.

The lifecycle uses the `Build Plan` as one element in deciding whether or not a particular list of buildpacks is appropriate, by seeing whether all dependencies required can be provided by that list. See the [spec](https://github.com/buildpacks/spec/blob/master/buildpack.md#phase-1-detection) for particulars on how ordering buildpacks can adjust detection results.

### Example
Let's walk through some possible cases a `node-engine` buildpack may consider:

1.  Nothing in the app explicitly calls out that it is needed
2.  It is explicitly referred to in some configuration file
3.  Two different configuration files request different versions of `node`

We will also consider what a `NPM` buildpack may do.

#### 1. No Explicit Request
A `node-engine` buildpack is always happy to `provide` the `node` dependency. The build plan it will write may look something like:
```
[[provides]]
name = "node"
```

#### 2. One Version Requested
The buildpack sees in one configuration file (e.g. `.nvmrc`) that it is explicitly requested by the application. Seeing that, it may write the below text to the build plan:
```
[[provides]]
name = "node"

[[requires]]
name = "node"
version = "10.x"

[requires.metadata]
version-source = ".nvmrc"
```

As always, the buildpack `provides` `node`. In this particular case, a version of `node` (`10.x`) is being `requested` in a configuration file (`.nvmrc`), and the buildpack chooses to add an additional piece of metadata (`version-source`), so that it can understand where that request came from.

#### 3. Two Versions Requested
The buildpack sees two configuration files (e.g. `.nvmrc` and `buildpack.yml`) that request two different versions of the `node` dependency. One way of dealing with that, would be writing both `requests` to the build plan, and reconciling which version(s) it will provide during the `build` phase. It can provide two different `requires`:

```
[[provides]]
name = "node"

[[requires]]
name = "node"
version = "10.x"

[requires.metadata]
version-source = ".nvmrc"

[[requires]]
name = "node"
version = "12.x"

[requires.metadata]
version-source = "buildpack.yml"
```

As always, the buildpack provides `node`. In this case, it requests two different things: `node v10.x` and `node v12.x`. During the `build` phase, it will analyze the two `requires`, and decide which (or both) to follow. Alternatively, it could have resolved the appropriate version in the `detect` phase, and only written the corresponding entry to the build plan.

#### Possible NPM Buildpack
`NPM`, the default package manager for `node`, is distributed together with node. As a result, a NPM buildpack may require `node`, but not want to `provide` it, trusting that the `node-engine` buildpack will be in charge of `providing` `node`.

It could write the following to the build plan:
```
[[requires]]
name = "node"
```

If, looking in the `package.json` file, the NPM buildpack see a specific version of `node` requested in the [engines](https://docs.npmjs.com/files/package.json#engines) field (e.g. `14.1`), it may write the following to the build plan:
```
[[requires]]
name = "node"
version = "14.1"

[requires.metadata]
version-source = "package.json"
```

That `requires` will be used by the lifecycle to decide that this (`node-engine` and `npm`) is the correct set of buildpacks, given that the `node-engine` buildpack `provides` `node`, while the `npm` buildpack `requires` `node`, and therefore all `requires` and `provides` are fulfilled.

### Schema
- **`provides`** _(list, optional)_\
  A list of dependencies which the buildpack provides.
    - **`name`** _(string, required)_\
    The name of the provided dependency.

- **`requires`** _(list, optional)_\
  A list of dependencies which the buildpack requires.
    - **`name`** _(string, required)_\
    The name of the required dependency.

    - **`version`** _(string, optional)_\
    The version of the dependency required.

    - **`metadata`** _(object, optional)_\
    Any additional key-value metadata you wish to store.

- **`or`** _(array, optional)_\
  A list of alternate requirements which the buildpack provides/requires. Each `or` array must contain a valid Build Plan (with `provides` and `requires`)

For more information, see the [Build Plan](https://github.com/buildpacks/spec/blob/master/buildpack.md#buildpack-plan-toml) section of the spec.

## API Compatibility

**Given** the buildpack and lifecycle both declare a **Buildpack API version** in format:\
`<major>.<minor>`

**Then** a buildpack and a lifecycle are considered compatible if all the following conditions are true:

- If versions are pre-release, where `<major>` is `0`, then `<minor>`s must match.
- If versions are stable, where `<major>` is greater than `0`, then `<minor>` of the buildpack must be less than
or equal to that of the lifecycle.
- `<major>`s must always match.

<br />
For example,

| Buildpack _implements_ Buildpack API | Lifecycle _implements_ Buildpack API | Compatible?                           |
| ------------------------------------ | ------------------------------------ | ------------------------------------- |
| `0.2`                                | `0.2`                                | <span class="text-success">yes</span> |
| `1.1`                                | `1.1`                                | <span class="text-success">yes</span> |
| `1.2`                                | `1.3`                                | <span class="text-success">yes</span> |
| `0.2`                                | `0.3`                                | <span class="text-muted">no</span>    |
| `0.3`                                | `0.2`                                | <span class="text-muted">no</span>    |
| `1.3`                                | `1.2`                                | <span class="text-muted">no</span>    |
| `1.3`                                | `2.3`                                | <span class="text-muted">no</span>    |
| `2.3`                                | `1.3`                                | <span class="text-muted">no</span>    |

## Further Reading

You can read the complete [Buildpack API specification on Github](https://github.com/buildpacks/spec/blob/master/buildpack.md).

[buildpack]: /docs/concepts/components/buildpack/
[lifecycle]: /docs/concepts/components/lifecycle/
[meta-buildpack]: /docs/concepts/components/buildpack/#meta-buildpack
