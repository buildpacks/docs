+++
title="Clear the buildpack environment"
weight=99
+++

During the `detect` and `build` phases, the lifecycle MUST provide as environment variables any user-provided files in `<platform>/env/` with environment variable names and contents matching the file names and contents.

<!--more-->

The `lifecycle` MUST also provide as environment variables any operator-provided files in `<build-config>/env` with environment variable names and contents matching the file names and contents. This applies for all values of `clear-env` or if `clear-env` is undefined in `buildpack.toml`.

* When `clear-env` in `buildpack.toml` is set to `true` for a given buildpack, the lifecycle MUST NOT set user-provided environment variables in the environment of `/bin/detect` or `/bin/build`.
* When `clear-env` in `buildpack.toml` is not set to `true` for a given buildpack, the lifecycle MUST set user-provided environment variables in the environment of `/bin/detect` or `/bin/build` such that:

  * For layer path environment variables, user-provided values are prepended before any existing values and are delimited by the OS path list separator.
  * For all other environment variables, user-provided values override any existing values.
* The environment variable prefix `CNB_` is reserved. It MUST NOT be used for environment variables that are not defined in this specification or approved extensions.

The following environment variables MUST NOT be overridden by the `lifecycle`

| Env Variable           | Description                                       | Detect | Build | Launch |
|------------------------|---------------------------------------------------|--------|-------|--------|
| `BP_*`                 | User-provided variable for buildpack              | [x]    | [x]   |        |
| `BPL_*`                | User-provided variable for exec.d                 |        |       | [x]    |
| `HOME`                 | Current user's home directory                     | [x]    | [x]   | [x]    |
