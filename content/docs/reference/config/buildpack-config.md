+++
title="buildpack.toml"
weight=3
+++

The buildpack configuration file is a necessary component of a [buildpack].

<!--more-->

The schema is as follows:

- **`api`** _(string, required, current: `0.10`)_\
  The Buildpack API version the buildpack adheres to. Used to ensure [compatibility](/docs/reference/spec/buildpack-api#api-compatibility) against
  the [lifecycle].

  > Not to be confused with Cloud Foundry or Heroku buildpack versions.
  > This version pertains to the interface between the [buildpack] and the [lifecycle] of Cloud Native Buildpacks.

- **`buildpack`** _(required)_\
  Information about the buildpack.

  - **`id`** _(string, required)_\
    A globally unique identifier.

  - **`version`** _(string, required)_\
    The version of the buildpack.

  - **`name`** _(string, required)_\
    Human readable name.

  - **`clear-env`** _(boolean, optional, default: `false`)_\
    Clears user-defined environment variables when `true` on executions of `bin/detect` and `bin/build`.

  - **`homepage`** _(string, optional)_\
    Buildpack homepage.

  - **`description`** _(string, optional)_\
    A short description of the buildpack.

  - **`keywords`** _(string(s), optional)_\
    Keywords to help locate the buildpack. These can be useful if publishing to the [Buildpack Registry](https://registry.buildpacks.io/).

  - **`sbom-formats`** _(string(s), optional)_\
    SBOM formats output by the buildpack. Supported values are the following media types: `application/vnd.cyclonedx+json`, `application/spdx+json`, and `application/vnd.syft+json`.

  - **`licenses`** _(list, optional)_\
    A list of licenses pertaining to the buildpack.

    - **`type`** _(string, optional)_\
      The type of the license. This may use the [SPDX 2.1 license expression](https://spdx.org/spdx-specification-21-web-version), but it is not limited to identifiers in the [SPDX Licenses List](https://spdx.org/licenses/). If the buildpack is using a nonstandard license, then the `uri` key may be specified in lieu of or in addition to `type` to point to the license.

    - **`uri`** _(string, optional)_\
      A URL or path to the license.

- **`targets`** _(list, optional)_\
  A list of targets supported by the buildpack.
  When no targets are specified, the `os`/`arch` will be inferred from the contents of the `./bin` directory
  (`./bin/build` implies `linux`/`amd64` and `./bin/build.bat` implies `windows`/`amd64`).
  For each target, all fields are optional (though at least one should be provided).
  _Cannot be used in conjunction with `order` list._

  - **`os`** _(string, optional)_\
    The supported operating system name.

  - **`arch`** _(string, optional)_\
    The supported architecture.

  - **`variant`** _(string, optional)_\
    The supported architecture variant.

  - **`targets.distros`** _(optional)_\
    A list of supported distributions for the given operating system, architecture, and architecture variant.

    - **`name`** _(string, optional)_\
      The supported operating system distribution name.

    - **`version`** _(string, optional)_\
      The supported operating system distribution version.

- **`stacks`** _(list, deprecated, optional)_\
  A list of stacks supported by the buildpack.
  _Cannot be used in conjunction with `order` list._

  - **`id`** _(string, required)_\
    The id of the supported stack.

  - **`mixins`** _(string list, required)_\
    A list of mixins required on the stack images.

- **`order`** _(list, optional)_\
  A list of buildpack groups for the purpose of creating a [composite buildpack][composite buildpack] (sometimes referred to as a "meta buildpack"). This list determines the
  order in which groups of buildpacks will be tested during detection. _If omitted, `targets` or `stacks` list must be present.
  Cannot be used in conjunction with `targets` or `stacks` list._

  - **`group`** _(list, required)_\
    A list of buildpack references.

    - **`id`** _(string, required)_\
      The identifier of a buildpack being referred to.
      Buildpacks with the same ID may appear in multiple groups at once but never in the same group.

    - **`version`** _(string, required)_\
      The version of the buildpack being referred to.

    - **`optional`** _(boolean, optional, default: `false`)_\
      Whether this buildpack is optional during detection.

- **`metadata`** _(any, optional)_\
  Arbitrary data for buildpack.

[buildpack]: /docs/for-buildpack-authors/concepts/buildpack
[lifecycle]: /docs/for-buildpack-authors/concepts/lifecycle-phases
[composite buildpack]: /docs/for-platform-operators/concepts/composite-buildpack
