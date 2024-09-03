+++
title="Clear the buildpack environment"
weight=99
+++

"Clearing" the buildpack environment with `clear-env` is the process of preventing end-users from customizing a buildpack's behavior through environment variables.

<!--more-->

Buildpack authors may elect to clear user-provided environment variables when `bin/detect` and `bin/build` are executed. This is achieved by setting `clear-env` to `true` in [buildpack.toml](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpacktoml-toml); by default `clear-env` is set to `false`.

* When `clear-env` is set to `true` for a given buildpack, the `lifecycle` will not set user-provided environment variables when running `/bin/detect` or `/bin/build`.
* If a buildpack does allow customization by the end-user through the environment (`clear-env` is `false`), there is a special convention for naming the environment variables recognized by the buildpack, shown in the following table:

| Env Variable           | Description                                       | Detect | Build | Launch |
|------------------------|---------------------------------------------------|--------|-------|--------|
| `BP_*`                 | User-provided variable for buildpack              | [x]    | [x]   |        |
| `BPL_*`                | User-provided variable for exec.d                 |        |       | [x]    |

### Further Reading

For more about how environment variables are specified by end-users, see the page for how to [customize buildpack behavior with build-time environment variables](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/).
