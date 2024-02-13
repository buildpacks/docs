+++
title="Buildpack API 0.9 -> 0.10"
weight=6
+++

<!--more-->

This guide is most relevant to buildpack authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/buildpack%2Fv0.10) for Buildpack API 0.10 for the full list of changes and further details.

### Stacks are deprecated

In Buildpack 0.10, the concepts of stacks and mixins are removed
in favor of existing constructs in the container image ecosystem such as operating system name, operating system distribution, and architecture.

#### Before build

`builder.toml` contains a new table for buildpacks to express the os/arch combinations that they are compatible with:

```toml
[[targets]]
os = "<OS name>"
arch = "<architecture>"
variant = "<architecture variant>"
[[targets.distros]]
name = "<OS distribution name>"
version = "<OS distribution version>"
```

All fields are optional and any missing field is assumed to "match any".

This information will be used by the lifecycle to skip running detect on any buildpack that is not compatible with the current os/arch.

Note that the `[[stacks]]` table is still supported and buildpack authors are encouraged to continue to provide this information for the time being
in order to maintain compatibility with older platforms.

#### During build

The lifecycle will provide the following environment variables during `detect` and `build` to describe the target os/arch:

| Env Variable                | Description                               |
|-----------------------------|-------------------------------------------|
| `CNB_TARGET_OS`             | Target OS                                 |
| `CNB_TARGET_ARCH`           | Target architecture                       |
| `CNB_TARGET_ARCH_VARIANT`   | Target architecture variant (optional)    |
| `CNB_TARGET_DISTRO_NAME`    | Target OS distribution name (optional)    |
| `CNB_TARGET_DISTRO_VERISON` | Target OS distribution version (optional) |

Buildpacks can use this information to modify their behavior depending on the target.

### Run image extensions is supported (experimental)

In Platform 0.12, extensions can be used to extend not only build-time base images, but runtime base images as well.

For more information, see [authoring an image extension](/docs/for-buildpack-authors/tutorials/write-basic-extension).
