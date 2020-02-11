+++
title="Builder Configuration"
weight=9
+++

A [builder][builder] configuration schema is as follows:

- #### `description` _(string, optional)_
  <br>

  A human-readable description of the builder, to be shown in `inspect-builder` output
  (run `pack inspect-builder -h` for more information).

- #### `buildpacks` _(list, required)_
  <br>

  A list of buildpacks, each with the following fields:

  - **`id`** _(string, optional)_
    <br>
    An identifier for the buildpack. Must match ID specified in buildpack's `buildpack.toml` file.

  - **`version`** _(string, optional)_
    <br>
    The version of the buildpack. Must match version specified in buildpack's `buildpack.toml` file.

  - **`uri`** _(string, required)_
    <br>
    A URL or path to an [archive](#supported-archives), or a path to a directory. If path is relative, it must be relative to the `builder.toml`.

- #### `order` _(list, required)_
  <br>

  A list of buildpack groups. This list determines the order in which groups of buildpacks
  will be tested during detection. Detection is a phase of the [lifecycle](#lifecycle) where
  buildpacks are tested, one group at a time, for compatibility with the provided application source code. The first
  group whose non-optional buildpacks all pass detection will be the group selected for the remainder of the build. Each
  group currently contains a single required field:

    - **`group`** _(list, required)_
    <br>

    A set of buildpack references. Each buildpack reference specified has the following fields:

    - **`id`** _(string, required)_
      <br>

      The identifier of a buildpack from the configuration's top-level `buildpacks` list. Buildpacks with the same ID may
      appear in multiple groups at once but never in the same group.

    - **`version`** _(string, optional, default: inferred)_
      <br>

      The version of the buildpack being referred to. This field may be omitted if the top-level `buildpacks` list contains
      only one version of the buildpack.

    - **`optional`** _(boolean, optional, default: `false`)_
      <br>

      Whether or not this buildpack is optional during detection.

- #### `stack` _(required)_
  <br>

  The stack to use for the builder. See [Working with stacks](/docs/concepts/components/stack) for more information about this field. It
  contains the following fields:

  - **`id`** _(required, string)_
    <br>

    Identifier for the stack

  - **`build-image`** _(required, string)_
    <br>

    Build image for the stack

  - **`run-image`** _(required, string)_
    <br>

    Run image for the stack

  - **`run-image-mirrors`** _(optional, string list)_
    <br>

    [Run image mirrors](/docs/concepts/components/stack#run-image-mirrors) for the stack

- #### `lifecycle` _(optional)_
  <br>

  The [lifecycle](#lifecycle) to embed into the builder. It must contain **at most one** the following fields:

  - **`version`** _(string, optional)_
    <br>

    The version of the lifecycle (semver format) to download. If specified, `uri` must not be provided.

  - **`uri`** _(string, optional)_
    <br>

    A URL or path to an [archive](#supported-archives). If specified, `version` must not be provided.

    > If `version` and `uri` are both omitted, `lifecycle` defaults to the version that was last released
    > at the time of `pack`'s release. In other words, for a particular version of `pack`, this default
    > will not change despite new lifecycle versions being released. The current default lifecycle versin can be [seen here](https://github.com/buildpacks/pack/blob/e4315be24c103e3c5722b08561bf13a55876cbbc/internal/builder/lifecycle.go#L18).

### Supported archives

Currently, when specifying a URI to a buildpack or lifecycle, only `tar` or `tgz` archive types are supported.

[builder]: /docs/concepts/components/builder
