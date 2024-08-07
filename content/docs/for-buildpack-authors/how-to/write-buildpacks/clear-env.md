+++
title="Clear the buildpack environment"
weight=99
+++

Clearing the buildpack environment `clear-env` is the process of preventing end-users from customizing a buildpack.

<!--more-->

Buildpack authors may elect to clear user-defined environment variables on the execution of `bin/detect` and `bin/build`. This is achievable by setting `clear-env` to `true` in [buildpack.toml](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpacktoml-toml); by default `clear-env` is set `false`.

* When `clear-env` in `buildpack.toml` is set to `true` for a given buildpack, the lifecycle MUST NOT set user-provided environment variables in the environment of `/bin/detect` or `/bin/build`.
* On the other hand, when `clear-env` in `buildpack.toml` is not set to `true` for a given buildpack, the lifecycle MUST set user-provided environment variables in the environment of `/bin/detect` or `/bin/build` such that:

  * For layer path environment variables, user-provided values are prepended before any existing values and are delimited by the OS path list separator.
  * For all other environment variables, user-provided values override any existing values.
* The environment variable prefix `CNB_` is reserved. It MUST NOT be used for environment variables that are not defined in this specification or approved extensions.

The following environment variables MUST NOT be overridden by the `lifecycle`

| Env Variable           | Description                                       | Detect | Build | Launch |
|------------------------|---------------------------------------------------|--------|-------|--------|
| `BP_*`                 | User-provided variable for buildpack              | [x]    | [x]   |        |
| `BPL_*`                | User-provided variable for exec.d                 |        |       | [x]    |
| `HOME`                 | Current user's home directory                     | [x]    | [x]   | [x]    |
