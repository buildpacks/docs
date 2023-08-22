+++
title="Platform API 0.11 -> 0.12"
+++

<!--more-->

This guide is most relevant to platform operators, base image authors, and builder authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.12) for Platform API 0.12 for the full list of changes and further details.

## Platform Operator

### Stacks are deprecated

In Platform 0.12, the concepts of stacks and mixins are removed
in favor of existing constructs in the container image ecosystem such as operating system name, operating system distribution, and architecture.

#### During build

The `-stack` flag is removed from the `analyzer` and `exporter` and replaced with a `-run` flag
that indicates the location of a `run.toml` file with schema:

```toml
[[images]]
 image = "<image>"
 mirrors = ["<mirror>", "<mirror>"]
```

This file will be created automatically during `pack builder create` if the `pack` version is at least `0.30.0` (see below).

For each image in `[[images]]`, `image` is a tag reference to a run image and `mirrors` contains tag references to its mirrors.
Note that whereas `stack.toml` (removed in this API version) only contained a single run image with mirrors, `run.toml` contains a list of images.
This is because of image extensions and the possibility of run image switching, introduced in Platform 0.10.
For platforms that do not use image extensions, only a single run image with mirrors is needed in `run.toml`.

#### After build

The `stack` key in the `io.buildpacks.lifecycle.metadata` is removed.
To find a tag reference to the run image and mirrors information,
platforms should read the newly added `runImage.image` and `runImage.mirrors` in `io.buildpacks.lifecycle.metadata`.

#### During rebase

Additional validations were added to the `rebaser` along with a `-force` flag to force rebase when validations are not satisfied.

If `-force` is not provided,
* The following values in the image config for the new run image must match the original image config:
  * `os`
  * `architecture`
  * `variant` (if specified)
  * `io.buildpacks.base.distro.name` label (if specified)
  * `io.buildpacks.base.distro.version` label (if specified)
* If `-run-image` is provided it must be found in `io.buildpacks.lifecycle.metadata` in either `runImage.image` or `runImage.mirrors`
* `io.buildpacks.rebasable` must be `true` (see below)

### Run image extensions is supported (experimental)

In Platform 0.12 extensions can be used to extend not only build-time base images, but runtime base images as well.

TODO

### OCI layout is a supported export format (experimental)

In Platform 0.12, a new capability to [export application images on disk in OCI layout format](https://github.com/buildpacks/rfcs/blob/main/text/0119-export-to-oci.md) was added.

Platform must prepare a [layout directory](https://github.com/buildpacks/rfcs/blob/main/text/0119-export-to-oci.md#how-it-works) containing input images in OCI layout format, and provide the location of the directory to the lifecycle.

#### Lifecycle phases affected

The lifecycle phases affected by this new behavior are:
- [Analyze](https://buildpacks.io/docs/concepts/components/lifecycle/analyze/)
- [Restore](https://buildpacks.io/docs/concepts/components/lifecycle/restore/)
- [Export](https://buildpacks.io/docs/concepts/components/lifecycle/export/)
- [Create](https://buildpacks.io/docs/concepts/components/lifecycle/create/)

**Note** [Rebasing](https://buildpacks.io/docs/concepts/components/lifecycle/rebase/) an image exported to OCI layout format is not supported.

#### Before executing the lifecycle

Input images required by any phase, like the `run-image` or `previous-image`, must be saved on disk in OCI layout format in the layout directory following the 
[rules](https://github.com/buildpacks/spec/blob/platform/v0.12/platform.md#map-an-image-reference-to-a-path-in-the-layout-directory) to convert the reference to a path.

#### During lifecycle execution

For the phases affected, the feature is enabled by providing a new `-layout` flag or by setting the `CNB_USE_LAYOUT` environment variable to `true`.
* If the feature is enabled: 
  *  A path to a directory where the images are located and saved must be specified, either by providing a `-layout-dir` flag or by setting the `CNB_LAYOUT_DIR` environment variable.

## Base Image Author

### Stacks are deprecated

When creating build-time or runtime base images, base image authors should set `io.buildpacks.base.distro.name` and `io.buildpacks.base.distro.version` labels
containing the values specified in `/etc/os-release` (`$ID` and `$VERSION_ID`).
This information - along with operating system, architecture, and architecture variant from the OCI image config,
will be exposed to buildpacks through `$CNB_TARGET_*` environment variables.

Additionally, authors may set an `io.buildpacks.base.id` label on runtime base images to uniquely identify the image "flavor" - see the [Platform spec](https://github.com/buildpacks/spec/blob/main/platform.md#target-data) for further information and requirements.

To allow newer builders to run on older platforms, base image authors should continue to set any `io.buildpacks.stack.*` labels that are still relevant.
Note that "information only" labels such as `io.buildpacks.stack.maintainer` have new equivalents in `io.buildpacks.base.maintainer`,
and it is recommended to set both sets of labels for the time being.

To maintain compatibility with older buildpacks, build-time base images should continue to set `$CNB_STACK_ID` in the build environment.

## Builder Author

### Stacks are deprecated

With the removal of stacks, there is also a new way to reference build-time and runtime base images in `builder.toml`.
Builder authors should ensure their `pack` version is at least `0.30.0` in order to create builders that will work with newer platforms.

The new `builder.toml` schema is:

```toml
[run]
[[run.images]]
image = "cnbs/some-run-image"
mirrors = ["mirror1", "mirror2"]
[build]
image = "cnbs/some-build-image"
```

Run image information will be translated to `run.toml` in the builder with schema:

```toml
[[images]]
 image = "cnbs/some-run-image"
 mirrors = ["mirror1", "mirror2"]
```

Run image information will also be translated to `stack.toml` (for compatibility with older platforms) in the builder with schema:

```toml
[run-image]
 image = "cnbs/some-run-image"
 mirrors = ["mirror1", "mirror2"]
```

The old `builder.toml` schema is still valid:

```toml
[stack]
id = "some.stack.id"
run-image = "cnbs/some-run-image"
run-image-mirrors = ["mirror1", "mirror2"]
build-image = "cnbs/some-build-image"
```

If the old `builder.toml` schema is used, run image information will be translated to the same `run.toml` and `stack.toml` file formats as above.

It is possible to define both the new and the old schema within `builder.toml`, but they must be consistent or `pack builder create` will fail.
