+++
title="Clear the buildpack environment"
weight=99
+++

Clearing the buildpack environment `clear-env` is the process of preventing end-users from customizing a buildpack.

<!--more-->

Buildpack authors may elect to clear user-defined environment variables on the execution of `bin/detect` and `bin/build`. This is achievable by setting `clear-env` to `true` in [buildpack.toml](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpacktoml-toml); by default `clear-env` is set to `false`.

* When `clear-env` is set to `true` for a given buildpack, the `lifecycle` MUST NOT set user-provided environment variables in `/bin/detect` or `/bin/build`.
* There is a special convention to configure Buildpacks that allow end user customization; shown in the following table.

The following environment variables MUST NOT be overridden by the `lifecycle`

| Env Variable           | Description                                       | Detect | Build | Launch |
|------------------------|---------------------------------------------------|--------|-------|--------|
| `BP_*`                 | User-provided variable for buildpack              | [x]    | [x]   |        |
| `BPL_*`                | User-provided variable for exec.d                 |        |       | [x]    |
| `HOME`                 | Current user's home directory                     | [x]    | [x]   | [x]    |

### Further Reading

For more about environment variables, see the [customize buildpack behavior with build-time environment variables](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/) documentation and the [Environment](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment) specification.
