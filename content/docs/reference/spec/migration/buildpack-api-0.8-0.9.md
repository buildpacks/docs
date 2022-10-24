+++
title="Buildpack API 0.8 -> 0.9"
+++

<!--more-->

This guide is most relevant to buildpack authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/buildpack%2Fv0.9) for buildpack API 0.9 for the full list of changes and further details.

### Shell removal

Buildpack-defined processes may no longer implicitly rely on a shell (be non-direct). 

In `launch.toml`, `direct` is removed as a key in the `[[processes]]` table, and all processes are inferred to be `direct = true`.

Buildpack processes can still use a shell! However, the `command` must now explicitly begin with `/bin/sh` (or `cmd.exe` on Windows). 

### Overridable process arguments

Hand-in-hand with shell removal is the introduction of overridable process arguments.

In `launch.toml`, `command` is now a list. The first element in `command` is the command, and all following entries are arguments that are always provided to the process, regardless of how the application is started. The `args` list now designates arguments that can be overridden by the end user - if supported by the platform (platform API version 0.10 and above). For further details, see the platform [migration guide](/docs/reference/spec/migration/platform-api-0.9-0.10).

For older platforms (platform API version 0.9 and below), arguments in `args` will be appended to arguments in `command`, negating the new functionality (but preserving compatibility).

### Image extensions are supported (experimental)

Platform 0.10 introduces image extensions as experimental components for customizing build and run-time base images (see [here](/docs/features/dockerfiles) for more information).

For more information, see [authoring an image extension](/docs/extension-author-guide/create-extension).
