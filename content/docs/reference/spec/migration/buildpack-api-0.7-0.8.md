+++
title="Buildpack API 0.7 -> 0.8"
+++

<!--more-->

This guide is most relevant to buildpack authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/buildpack%2Fv0.8) for buildpack API 0.8 for the full list of changes and further details.

### Process-Specific Working Directory

Buildpacks may specify the working directory for a process by setting the `working-dir` field on the process in [`launch.toml`](https://github.com/buildpacks/spec/blob/buildpack/0.8/buildpack.md#launchtoml-toml).

Prior to this, all processes ran from the app directory (`CNB_APP_DIR`).
Running a process from a different directory typically involved running a shell to execute a `cd` command and then start the process, like:

```
[[processes]]
command = "bash"
args = ["-c", "cd <working-dir> && <start-process>"]
```

Buildpacks can now specify the process directly with a specific working directory, like:

```
[[processes]]
command = "<start-process>"
working-dir = "<working-dir>"
```

For details, see [RFC 81](https://github.com/buildpacks/rfcs/blob/main/text/0081-process-specific-working-directory.md).

### Deprecate Positional Args to `build` and `detect` Executables

The positional arguments to the `detect` and `build` executables are deprecated.
Lifecycle now accepts these values as environment variables.

To upgrade, buildpack authors should use the following environment variables:

For `detect`:

- `CNB_PLATFORM_DIR` replaces the first positional argument.
- `CNB_BUILD_PLAN_PATH` replaces the second positional argument.

For `build`:

* `CNB_LAYERS_DIR` replaces the first positional argument.
* `CNB_PLATFORM_DIR` replaces the second positional argument.
* `CNB_BP_PLAN_PATH` replaces the third positional argument.

For details, see [RFC 100](https://github.com/buildpacks/rfcs/blob/main/text/0100-buildpack-input-vars.md).
