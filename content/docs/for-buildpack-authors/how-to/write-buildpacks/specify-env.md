+++
title="Specify the environment"
weight=99
+++

Environment variables are a common way to configure various buildpacks at build-time, make executables available on the `$PATH` environment variable, and configure the app at runtime.

<!--more-->

When `clear-env` is not set to `true`, the `lifecycle` MUST set user-provided environment variables in the environment of `/bin/detect` or `/bin/build` such that:

* For layer path environment variables, user-provided values are prepended before any existing values and are delimited by the OS path list separator.
* For all other environment variables, user-provided values override any existing values.
* The environment variable prefix `CNB_` is reserved. It MUST NOT be used for environment variables that are not defined in this specification or approved extensions.

### POSIX Path Variables

When the `lifecycle` runs buildpacks, it first tears down anything defined on the `build-time` base image of the environment. It only allows a [specific set](https://github.com/buildpacks/lifecycle/blob/a43d5993a4f2cc23c44b6480ba2ab09fe81d57ed/env/build.go#L9-L19) of pre-configured environment variables through.

Then, it applies `buildpack defined` environment variables including anything that might have been configured by a buildpack that ran earlier during the `build` phase.

>Note that buildpacks cannot set environment variables for other buildpacks during the `detect` phase.

#### Example

Looking at the following directory tree and table

```text

layers/
└── some-buildpack-id
    ├── some-build-layer
    │   ├── bin
    │   │   └── some-binary
    │   ├── env
    │   │   └── SOME_VAR # contents foo
    │   ├── env.build
    │   │   └── SOME_VAR # contents bar
    │   └── lib
    │       ├── some-shared-library
    │       └── some-static-library
    └── some-build-layer.toml

```

| Env Variable                               | Layer Path   | Contents         | Build | Launch |
|--------------------------------------------|--------------|------------------|-------|--------|
| `PATH`                                     | `/bin`       | binaries         | [x]   | [x]    |
| `LD_LIBRARY_PATH`                          | `/lib`       | shared libraries | [x]   | [x]    |
| `LIBRARY_PATH`                             | `/lib`       | static libraries | [x]   |        |
| `CPATH`                                    | `/include`   | header files     | [x]   |        |
| `PKG_CONFIG_PATH`                          | `/pkgconfig` | pc files         | [x]   |        |

* To add a directory to the $PATH variable for buildpacks that follow, we need to create a `<layers>/<layer>/bin` directory and add any executables we want to make available within that directory. The `lifecycle` will automatically add the new `bin` directory to the `PATH` for buildpacks that follow.
* Binaries, such as `some-binary`, are added to `PATH` for buildpacks that follow
* Shared libraries, such as `Some-shared-library` and `some-static-library`, are added to `LD_LIBRARY_PATH` and `LIBRARY_PATH`
* If `env/SOME_VAR` and `env.build/SOME_VAR` have a conflict, a given procedure applies to figure out who "wins" when applying the environment [modification rules](#environment-variable-modification-rules).
* `User-defined` variables are then applied; meaning it's possible to override `buildpack-defined` variables.
* Finally, `platform-defined` variables are applied, which eventually override any previous values.

The above is only relevant for `build` because the layer `some-build-layer` is a build layer, i.e., `some-build-layer.toml` has

```yaml

[types]
build = true

```

>Note that the platform SHOULD NOT assume any other `base-image` provided environment variables are inherited by the buildpack.

### Build Environment Variables

During the `build` phase, buildpacks MAY write environment variable files to `<layers>/<layer>/env/`, `<layers>/<layer>/env.build/`, and `<layers>/<layer>/env.launch/` directories.

For each `<layers>/<layer>/` designated as a build layer, for each file written to `<layers>/<layer>/env/` or `<layers>/<layer>/env.build/` by `/bin/build`, the `lifecycle` MUST modify an environment variable in subsequent executions of `/bin/build` according to the [environment variable modification rules](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules).

### Process and Runtime Environment Variables

For `runtime` and `process` environment variables, the [tree above](#example) is still applicable except that it doesn't include a `build` layer. Instead it has a`launch` layer, i.e., `some-launch-layer.toml` that has

```yaml

[types]
launch = true

```

### Multiple Buildpacks Defining the Same Environment Variable

During the `build` phase, each variable designated for `build` MUST contain absolute paths of all previous buildpacks’ `<layers>/<layer>/` directories that are designated for build.

When the exported `OCI image` is launched, each variable designated for launch MUST contain absolute paths of all buildpacks’ `<layers>/<layer>/` directories that are designated for launch.

In either case,

* The lifecycle MUST order all `<layer>` paths to reflect the reversed order of the buildpack group.
* The lifecycle MUST order all `<layer>` paths provided by a given buildpack alphabetically ascending.
* The lifecycle MUST separate each path with the OS path list separator (e.g. `:` on Linux, `;` on Windows).

#### Environment Variable Modification Rules

The lifecycle MUST consider the name of the environment variable to be the name of the file up to the first period (`.`) or to the end of the name if no periods are present. In all cases, file contents MUST NOT be evaluated by a shell or otherwise modified before inclusion in environment variable values.

For each environment variable file the period-delimited suffix SHALL determine the modification behavior as follows.

| Suffix     | Modification Behavior                     |
|------------|-------------------------------------------|
| none       | [Override](#override)                     |
| `.append`  | [Append](#append)                         |
| `.default` | [Default](#default)                       |
| `.delim`   | [Delimiter](#delimiter)                   |
| `.override`| [Override](#override)                     |
| `.prepend` | [Prepend](#prepend)                       |

##### Append

The value of the environment variable MUST be a concatenation of the file contents and the contents of other files representing that environment variable.

##### Default

The value of the environment variable MUST only be the file contents if the environment variable is empty.

##### Delimiter

The file contents MUST be used to delimit any concatenation within the same layer involving that environment variable.

##### Override

The value of the environment variable MUST be the file contents.

##### Prepend

The value of the environment variable MUST be a concatenation of the file contents and the contents of other files representing that environment variable.

To better understand the above modification rules, let's take a look at the tree below,

```text

layers/
├── some-buildpack-id
│   ├── some-layer
│   │   └── env
│   │       ├── SOME_VAR # contents foo
│   │       └── SOME_VAR.append # contents :
│   └── some-layer.toml
└── some-other-buildpack-id
    ├── some-layer
    │   └── env
    │       ├── SOME_VAR # contents bar
    │       └── SOME_VAR.append # contents :
    └── some-layer.toml

```

Assuming that `some-buildpack-id` comes before `some-other-buildpack-id` in the buildpack group, the final value of `SOME_VAR` shown above  would be `foo:bar`

>For more information on modifying environment variables, see [Environment Variable Modification Rules](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules) specification.

### Further Reading

For more about environment variables, see the [customize buildpack behavior with build-time environment variables](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/) documentation and the [Environment](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment) specification.
