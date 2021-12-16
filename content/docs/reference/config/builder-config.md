+++
title="builder.toml"
summary="Schema of the builder config file."
aliases=["/docs/reference/builder-config/"]
+++

A [builder][builder] configuration schema is as follows:

- #### `description` _(string, optional)_
  A human-readable description of the builder, to be shown in `inspect-builder` output
  (run `pack inspect-builder -h` for more information).

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
  will be tested during detection. Detection is a phase of the [lifecycle][lifecycle] where
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
          Whether or not this buildpack is optional during detection.

- #### `stack` _(required)_
  The stack to use for the builder. See [Working with stacks](/docs/concepts/components/stack) for more information about this field. It
  contains the following fields:

  - **`id`** _(required, string)_\
    Identifier for the stack

  - **`build-image`** _(required, string)_\
    Build image for the stack

  - **`run-image`** _(required, string)_\
    Run image for the stack

  - **`run-image-mirrors`** _(optional, string list)_
    [Run image mirrors](/docs/concepts/components/stack#run-image-mirrors) for the stack

- #### `lifecycle` _(optional)_
  The [lifecycle][lifecycle] to embed into the builder. It must contain **at most one** the following fields:

  - **`version`** _(string, optional)_\
    The version of the lifecycle (semver format) to download. If specified, `uri` must not be provided.

  - **`uri`** _(string, optional)_\
    A URL or path to an [archive](#supported-archives). If specified, `version` must not be provided.

    > If `version` and `uri` are both omitted, `lifecycle` defaults to the version that was last released
    > at the time of `pack`'s release. In other words, for a particular version of `pack`, this default
    > will not change despite new lifecycle versions being released.

### Supported archives

Currently, when specifying a URI to a buildpack or lifecycle, only `tar` or `tgz` archive types are supported.

[builder]: /docs/concepts/components/builder
[lifecycle]: /docs/concepts/components/lifecycle
