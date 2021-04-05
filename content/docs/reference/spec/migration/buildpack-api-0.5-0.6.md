+++
title="Buildpack API 0.5 -> 0.6"
+++

<!--more-->

This guide is most relevant to buildpack authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/buildpack%2Fv0.6) for buildpack API 0.6 for the full list of changes and further details.

### Opt-in layer caching and launch.toml format changes

Buildpacks must now explicitly opt-in to layer re-use by setting the `launch`, `build`, and `cache` keys in `<layers>/<layer>.toml`. If buildpacks do not modify `<layers>/<layer>.toml`, the layer will behave like a temporary directory, available only to the authoring buildpack, existing for the duration of a single build - even if the buildpack in the previous build set any of these keys to `true`.

> **NOTE**: Additionally, the `launch`, `build`, and `cache` keys are moved under a new `[types]` table in `<layers>/<layer>.toml` and removed from the top level. 

A Bash buildpack could write something like the following to `<layers>/<layer>.toml` in order to cache a layer:

```bash
cat >> layer.toml <<EOL
[types]
cache = true
EOL
```

### Buildpacks contribute default process type

Buildpacks may now contribute the default process type by writing `default = true` in the process type definition in `<layers>/launch.toml`. An individual buildpack may only specify one process type with `default = true`. The lifecycle will choose, from all buildpack-provided process types, the last process type with `default = true` as the buildpack-provided default. A user may override the buildpack-provided default process type by passing `-process-type` to the exporter. Note: to enable buildpacks implementing older Buildpack APIs to work with newer buildpacks, the lifecycle will assume that buildpacks on Buildpack API < 0.6 intended for `web` processes to be the default.
For example - 

```toml
# launch.toml
[[processes]]
type = "<process type>"
command = "<command>"
args = ["<arguments>"]
direct = false
# the default field is new
default = false
```

### New fields in buildpack descriptor

To introduce more information into the Buildpack Registry search API, the following are added to `buildpack.toml`:
* A `description` free text field
* A `keywords` array
* A `licenses` array of table
Each license in `[[buildpack.licenses]]` can contain a `type` and `uri`, where `type` may use the [SPDX 2.1 license expression](https://spdx.org/spdx-specification-21-web-version), but it is not limited to identifiers in the [SPDX Licenses List](https://spdx.org/licenses/). If the buildpack is using a nonstandard license, then the `uri` key may be specified in lieu of or in addition to `type` to point to the license.

### exec.d on Windows
Buildpack API 0.5 introduced support for `exec.d` executables that may be used to modify the environment for an app process (similar to profile.d) but do not depend on a shell.
The launcher will execute each file in each `<layers>/<layer>/exec.d` directory and each file in each `<layers>/<layer>/exec.d/<process>` directory before the app process is started.
Previously, this was only implemented on Linux, but starting from Buildpack API 0.6, it is implemented on Windows as well. On Windows, the launcher will set `CNB_EXEC_D_HANDLE` in each `exec.d` executable's environment to the hex representation of an open file handle where the executable is expected to write its output. The output may contain any number of top-level key-value pairs, which will be sourced by the launcher in the app process's environment.
