+++
title="Specify the environment"
weight=99
+++

Environment variables are a common way to configure buildpacks at build-time and the application at runtime.

<!--more-->

### Preparing the environment at build time

When the `lifecycle` runs each buildpack, it first tears down any environment variables defined on the `build-time` base image. It only allows a [specific set](https://github.com/buildpacks/lifecycle/blob/a43d5993a4f2cc23c44b6480ba2ab09fe81d57ed/env/build.go#L9-L19) of pre-configured environment variables through.

For the `detect` phase, the `lifecycle` then applies user-provided environment variables, followed by platform-provided environment variables. For more information, see the page for how to [customize buildpack behavior with build-time environment variables](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/).

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

* User-provided variables are then applied, meaning that it's possible for the end-user to override buildpack-provided variables.
* Finally, `platform-defined` variables are applied, which eventually override any previous values.

### Preparing the environment at runtime

At `runtime`, the `lifecycle` (or rather, the piece of the lifecycle known as the `launcher` that gets included in the application image) prepares the environment for the application process.
For setting up environment variables at `runtime`, the [tree above](#example) is still applicable except that the layer must be a `launch` layer, i.e., `some-launch-layer.toml` has

```yaml

[types]
launch = true

```

>Note that the `launcher` binary is found inside the application image at `/cnb/lifecycle/launcher` and is the entrypoint for any `CNB-built` image.

### When multiple buildpacks define the same variable

When multiple buildpacks define the same variable, the ["environment modification rules"](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules) come into play.

Let's say buildpack A (which runs first) defines `SOME_VAR=foo` and buildpack B defines `SOME_VAR=bar`. The `lifecycle` can perform different modifications when setting up the environment for buildpack C (which runs last).

* The `lifecycle` can `append` the second value to the first, so that buildpack C sees something like `SOME_VAR=foo:bar`.
* The `lifecycle can` `prepend` the second value to the first, so that buildpack C sees something like `SOME_VAR=bar:foo`.
* The `lifecycle` can `override` the first value with the second value, so that buildpack C sees `SOME_VAR=bar`.
* The `lifecycle` can treat the second value as a `default` (the value to set when no other entity defines this variable), so that buildpack C sees `SOME_VAR=foo`.
* In all cases, the behavior of the `lifecycle` is governed by the file suffix for `<layers>/<layer>/<env>/SOME_VAR<.suffix>`. The suffix is optional, and the assumed behavior when no suffix is provided is `override`.

>Note that whenever the suffix is `append` or `prepend` an additional file, `<layers>/<layer>/<env>/SOME_VAR.delim`, is needed to specify the delimiter used during concatenation. If no delimiter is provided, none will be used.

To better understand the above modification rules, let's take a look at the tree below:

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

Assuming that `some-buildpack-id` comes before `some-other-buildpack-id` in the buildpack group, the final value of `SOME_VAR` shown above  would be `foo:bar`.

Note that the examples shown on this page are relatively simple. It is possible for a buildpack to double-specify the same variable (i.e., within two or more different layers), and for a buildpack to specify a variable for a particular phase (build or launch) when the layer has type both `build = true` and `launch = true`. Additionally, for `runtime` variables, buildpacks can specify a variable for a particular process.

In these cases, the lifecycle determines the final value of the variable according to a process outlined in the specification.

>For more information on modifying environment variables, see the [Environment Variable Modification Rules](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules) section of the specification.
