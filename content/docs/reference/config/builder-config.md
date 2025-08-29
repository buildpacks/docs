+++
title="builder.toml"
aliases=[
  "/docs/reference/builder-config/"
]
weight=2
+++

The builder config file is used for creating [builders][builder].

<!--more-->

The schema is as follows:

- #### `description` _(string, optional)_

  A human-readable description of the builder, to be shown in `builder inspect` output
  (run `pack builder inspect -h` for more information).

- #### `buildpacks` _(list, optional)_

  A list of buildpacks, each with the following fields:

  - **`id`** _(string, optional)_\
    An identifier for the buildpack. Must match ID specified in buildpack's `buildpack.toml` file.

  - **`version`** _(string, optional)_\
    The version of the buildpack. Must match version specified in buildpack's `buildpack.toml` file.

  - **`uri`** _(string)_\
     A URL or path to an [archive](#supported-archives), a packaged buildpack (saved as a `.cnb` file), or a directory. If path is relative, it must be relative to the `builder.toml`.

- #### `order` _(list, required)_

  A list of buildpack groups. This list determines the order in which groups of buildpacks
  will be tested during detection. Detection is a phase of the [lifecycle] where
  buildpacks are tested, one group at a time, for compatibility with the provided application source code. The first
  group whose non-optional buildpacks all pass detection will be the group selected for the remainder of the build. Each
  group currently contains a single required field:

  - **`group`** _(list, required)_\
    A set of buildpack references. Each buildpack reference specified has the following fields:

    - **`id`** _(string, required)_\
      The identifier of a buildpack from the configuration's top-level `buildpacks` list. Buildpacks with the same ID may
      appear in multiple groups at once but never in the same group.

    - **`version`** _(string, optional, default: inferred)_\
      The version of the buildpack being referred to. This field may be omitted if
      exactly one version of the buildpack
      occurs in either the top-level `buildpacks` list or those buildpacks' dependencies.

    - **`optional`** _(boolean, optional, default: `false`)_\
      Whether this buildpack is optional during detection.

- #### `build` _(required)_

  Build-time information. It contains the following field:

  - **`image`** _(required, string)_\
    Image to use as the build-time base

- #### `run` _(required)_

  Run-time information. It contains the following:

  - **`run.images`** _(list, required)_\
    A set of run image references. By default, the first run image specified will be used.
    Image extensions (experimental) may be used to switch the run image dynamically at build-time.
    Each run image reference has the following:

    - **`image`** _(string, required)_\
      Image to use as the run-time base

    - **`mirrors`** _(list, optional)_\
      [Mirrors](/docs/for-app-developers/concepts/base-images/run#run-image-mirrors) for the provided image

- #### `stack` _(optional, deprecated)_

  The stack to use for the builder. See [stack](/docs/for-app-developers/concepts/base-images/stack) concept information for more details.
  This field should be specified if it is necessary to maintain compatibility with older platforms.
  If specified, the information in this field must be consistent with the `build` and `run` fields (see above).
  It contains the following:

  - **`id`** _(required, string)_\
    Identifier for the stack

  - **`build-image`** _(required, string)_\
    Build image for the stack

  - **`run-image`** _(required, string)_\
    Run image for the stack

  - **`run-image-mirrors`** _(optional, string list)_
    [Run image mirrors](/docs/for-app-developers/concepts/base-images/run#run-image-mirrors) for the stack

- #### `lifecycle` _(optional)_

  The [lifecycle] to embed into the builder. It must contain **at most one** the following fields:

  - **`version`** _(string, optional)_\
    The version of the lifecycle (semver format) to download. If specified, `uri` must not be provided.

  - **`uri`** _(string, optional)_\
    A URL or path to an [archive](#supported-archives). If specified, `version` must not be provided.

    > If `version` and `uri` are both omitted, `lifecycle` defaults to the version that was last released
    > at the time of `pack`'s release. In other words, for a particular version of `pack`, this default
    > will not change despite new lifecycle versions being released.

- #### `build.env` _(optional)_

  The [[[build.env]]](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules) is used to specify [operator-defined](https://github.com/buildpacks/spec/blob/main/platform.md#operator-defined-variables) build-time environment variables for buildpacks. Set `CNB_BUILD_CONFIG_DIR` in pack's environment to override the default directory (`/cnb/build-config/env`) where environment variable files are stored within the builder.

  - **`name`** _(string, required)_\
    The name/key of the environment variable.

  - **`value`** _(string, required)_\
    The value of the environment variable.

  - **`suffix`** _(string, optional)_\
    The type of action used to modify the environment variable when end-users or buildpacks define the same name/key, one of [`default`](https://github.com/buildpacks/spec/blob/main/buildpack.md#default), [`override`](https://github.com/buildpacks/spec/blob/main/buildpack.md#override), [`append`](https://github.com/buildpacks/spec/blob/main/buildpack.md#append), or [`prepend`](https://github.com/buildpacks/spec/blob/main/buildpack.md#prepend). Defaults to `default` if this field is omitted. Operator-defined environment variables take precedence over end-user or buildpack-defined environment variables.

  - **`delim`** _(string, optional)_\
    The delimiter used to concatenate two or more values for the given `name`.

  > The `delim` is required when `suffix` is one of `append` or `prepend`.

### Supported archives

Currently, when specifying a URI to a buildpack or lifecycle, only `tar` or `tgz` archive types are supported.

[builder]: /docs/for-platform-operators/concepts/builder
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle
