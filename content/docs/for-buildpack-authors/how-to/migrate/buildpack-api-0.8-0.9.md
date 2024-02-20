
+++
title="Buildpack API 0.8 -> 0.9"
aliases=[
  "/docs/reference/spec/migration/buildpack-api-0.8-0.9"
]
weight=5
+++

<!--more-->

This guide is most relevant to buildpack authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/buildpack%2Fv0.9) for Buildpack API 0.9 for the full list of changes and further details.

### Shell removal

Buildpack-defined processes may no longer implicitly rely on a shell (be non-direct). 

In `launch.toml`, `direct` is removed as a key in the `[[processes]]` table, and all processes are inferred to be `direct = true`.

Buildpack processes can still use a shell! However, the `command` must now explicitly begin with `/bin/sh` (or `cmd.exe` on Windows). 

### Overridable process arguments

Hand-in-hand with shell removal is the introduction of overridable process arguments.

In `launch.toml`, `command` is now a list. The first element in `command` is the command, and all following entries are arguments that are always provided to the process, regardless of how the application is started. The `args` list now designates arguments that can be overridden by the end user - if supported by the platform (Platform API version 0.10 and above).

For further details, see the platform [migration guide](/docs/for-platform-operators/how-to/migrate/platform-api-0.9-0.10).

For older platforms (Platform API version 0.9 and below), arguments in `command` will be prepended to arguments in `args`, negating the new functionality (but preserving compatibility).

### Image extensions are supported (experimental)

Platform 0.10 introduces image extensions as experimental components for customizing build and run-time base images (see [here](/docs/for-platform-operators/concepts/dockerfiles) for more information).

For more information, see our tutorial on [authoring an image extension](/docs/for-buildpack-authors/tutorials/basic-extension).
