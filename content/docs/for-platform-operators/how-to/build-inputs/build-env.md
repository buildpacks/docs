+++
title="Specify the build time environment variables"
weight=4
+++

Environment variables are any values used to allow `Buildpacks` configurability. Some environment variables can't be modified while others are expected to get changed to allow a level of customization.

<!--more-->

## Buildpack Environment

### Base Image-Provided Variables

Environment variables that are set in the `lifecycle` execution environment and are inherited by the
buildpack without any modification, such as:

| Env Variable                | Description                    |
|-----------------------------|--------------------------------|
| `HOME`                      | Current user's home directory  |

### POSIX Path Variables

Environment variables that are set in the `lifecycle` execution environment. These variables can be modified by previous buildpacks before they being passed to the next buildpack:

| Env Variable      | Layer Path   | Contents         |
|-------------------|--------------|------------------|
| `PATH`            | `/bin`       | binaries         |
| `LD_LIBRARY_PATH` | `/lib`       | shared libraries |
| `LIBRARY_PATH`    | `/lib`       | static libraries |
| `CPATH`           | `/include`   | header files     |
| `PKG_CONFIG_PATH` | `/pkgconfig` | pc files         |

> Note: the `platform` does not assume any other `base-image` provided environment variables are inherited by the buildpack.

### User-Provided Variables

These variables are usually supplied by the `platform` as files in the `<platform>/env/` directory. Each file defines a single environment variable, where the file name defines the key and the file contents define the value.

Only user-provided environment variables that are [POSIX path variables](#posix-path-variables) can be modified by prior buildpacks; however the user-provided value always get prepended to the buildpack-provided value.

> Note: the `platform` does not set user-provided environment variables directly in the `lifecycle` execution environment.

### Operator-Defined Variables

The `platform` supplies Operator-defined environment variables as files in the `<build-config>/env/` directory.

Operator-defined environment variables can be modified by previous buildpacks before getting passed to the following buildpack; however, the operator-defined value is always applied after the buildpack-provided value.

> Note: the `platform` does not set operator-provided environment variables directly in the `lifecycle` execution environment.

## Launch Environment

User-provided modifications to the process execution environment are set directly in the `lifecycle` execution environment.

The process inherits both `base-image-provided` and `user-provided` variables from the `lifecycle` execution environment with the following exceptions:

* `CNB_APP_DIR`, `CNB_LAYERS_DIR` and `CNB_PROCESS_TYPE` SHALL NOT be set in the process execution environment.
* `/cnb/process` SHALL be removed from the beginning of `PATH`.
* The lifecycle SHALL apply buildpack-provided modifications to the environment as outlined in the [Buildpack Interface Specification](https://github.com/buildpacks/spec/blob/main/buildpack.md).
