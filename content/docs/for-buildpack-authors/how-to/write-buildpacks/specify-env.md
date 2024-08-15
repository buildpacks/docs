+++
title="Specify the environment"
weight=99
+++

Environment variables are a common way to configure buildpacks at build-time and the application at runtime.

<!--more-->

### Preparing the environment at build time

When the `lifecycle` runs each buildpack, it first tears down any environment variables defined on the `build-time` base image of the environment. It only allows a [specific set](https://github.com/buildpacks/lifecycle/blob/a43d5993a4f2cc23c44b6480ba2ab09fe81d57ed/env/build.go#L9-L19) of pre-configured environment variables through.

For the detect phase, the lifecycle then applies user-provided environment variables. For more information, see [clearing the buildpack environment](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/clear-env/)

For the `build` phase, the process is more complex. Before applying user-provided environment variables, the `lifecycle` applies buildpack-provided environment variables, which is anything that a previous buildpack (a buildpack that ran earlier in the `build` phase) might have configured in its `layers` directory.

>Note that buildpacks cannot set environment variables for other buildpacks during the `detect` phase.

#### Example

Let's look at the following directory tree to see how layers created by a previous buildpack (with id `some-buildpack-id`) would affect the environment for the current buildpack.

```text

layers/
└── some-buildpack-id
    ├── some-build-layer
    │   ├── bin
    │   │   └── some-binary
    │   ├── env
    │   │   └── SOME_VAR # contents foo
    │   └── lib
    │       └── some-static-library
    └── some-build-layer.toml  # has build = true in the [types] table

```

With this tree:

* The current buildpack will see `SOME_VAR=foo` in its environment
* The current buildpack will find `some-binary` in `PATH`
* The current buildpack will find `some-static-library` in `LIBRARY_PATH`

Thus, any `<layers>/<layer>/<env>` directory is for setting environment variables directly, and `<layers>/<layer>/<bin>`, `<layers>/<layer>/<lib>`, etc. offer a convenient way to modify `POSIX` path variables.

The full list of convenience directories is summarized in the table below:

| Env Variable                               | Layer Path   | Contents         | Build | Launch |
|--------------------------------------------|--------------|------------------|-------|--------|
| `PATH`                                     | `/bin`       | binaries         | [x]   | [x]    |
| `LD_LIBRARY_PATH`                          | `/lib`       | shared libraries | [x]   | [x]    |
| `LIBRARY_PATH`                             | `/lib`       | static libraries | [x]   |        |
| `CPATH`                                    | `/include`   | header files     | [x]   |        |
| `PKG_CONFIG_PATH`                          | `/pkgconfig` | pc files         | [x]   |        |

* If `env/SOME_VAR` and `env.build/SOME_VAR` have a conflict, a given procedure applies to figure out who "wins" when applying the environment [modification rules](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules).
* `User-defined` variables are then applied; meaning it's possible to override `buildpack-defined` variables.
* Finally, `platform-defined` variables are applied, which eventually override any previous values.

### Preparing the environment at runtime

For `runtime` and `process` environment variables, the [tree above](#example) is still applicable except that it doesn't include a `build` layer. Instead it has a`launch` layer, i.e., `some-launch-layer.toml` that has

```yaml

[types]
launch = true

```

>Note that the `launcher` binary sets up the environment at `runtime`. The `launcher` is found inside the app image at `/cnb/lifecycle/launcher` and is the entrypoint for any `CNB-built` image.

### When multiple buildpacks define the same variable

When multiple buildpacks define the same variable, the ["environment modification rules"](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules) come into play.

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

#### Append

The value of the environment variable MUST be a concatenation of the file contents and the contents of other files representing that environment variable.

#### Default

The value of the environment variable MUST only be the file contents if the environment variable is empty.

#### Delimiter

The file contents MUST be used to delimit any concatenation within the same layer involving that environment variable.

#### Override

The value of the environment variable MUST be the file contents.

#### Prepend

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

Please note that when `clear-env` is not set to `true`, the `lifecycle` MUST set user-provided environment variables in the environment of `/bin/detect` or `/bin/build` such that:

* For layer path environment variables, user-provided values are prepended before any existing values and are delimited by the OS path list separator.
* For all other environment variables, user-provided values override any existing values.
* The environment variable prefix `CNB_` is reserved. It MUST NOT be used for environment variables that are not defined in this specification or approved extensions.

>For more information on clearing user-defined environment variables, see [Clear the buildpack environment](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/clear-env/) documentation.

### Further reading

For more about environment variables, see the [customize buildpack behavior with build-time environment variables](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/) documentation and the [Environment](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment) specification.
