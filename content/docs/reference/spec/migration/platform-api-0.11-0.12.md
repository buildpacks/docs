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
* `io.buildpacks.rebasable` must be `true` (see image extensions below)

### Run image extensions is supported (experimental)

In Platform 0.12, extensions can be used to extend not only build-time base images, but runtime base images as well.

#### During build

To use the feature, platforms should:
* Invoke `analyzer` as usual for Platform 0.12
* Invoke `detector` with the `-run` flag, to specify the location of a `run.toml` file containing run image information
  * When extensions switch the run image, this is used to log a warning if the new run image is not a known run image
* Invoke `restorer` with the `-dameon` flag (newly added in this Platform API version) if the export target is a daemon
  * When extensions switch the run image, the `restorer` must re-read target data from the new run image in order to provide this information to buildpacks; if `-daemon` is provided the `restorer` will look for the run image in a daemon instead of a registry
  * When extensions extend the run image, the `-daemon` flag has no effect as the `restorer` must be able to pull the run image manifest from a registry
* Invoke `extender` as usual to extend the builder image (see [migration guide](/docs/reference/spec/migration/platform-api-0.9-0.10/index.html) for Platform 0.10)
* Inspect the contents of `analyzed.toml` - if `run-image.extend` is `true` we must run the `extender` on the run image
* Using the **run image** as the basis for the container, invoke `extender` with flags `-kind run` and `-extended <extended dir>`
  * `<extended dir>` is the directory where layers from applying each `run.Dockerfile` to the run image will be saved for use by the `exporter`; it defaults to `<layers>/extended`
  * Run image extension may be done in parallel with builder image extension
* Invoke `exporter` with the `-extended` flag

#### After build

Note that unlike buildpack-provided layers, layers from extensions may NOT be safe to rebase.
The `io.buildpacks.rebasable` label on the exported application image will be `false` if rebase is unsafe.
The `-force` flag must be provided to the `rebaser` in order to rebase images with unsafe extension layers,
and should be used with great care.

### OCI layout is a supported export format (experimental)

Platform 0.12 adds a new capability to [export application images on disk in OCI layout format](https://github.com/buildpacks/rfcs/blob/main/text/0119-export-to-oci.md).

#### Before build

To use the feature, platforms must prepare a [layout directory](https://github.com/buildpacks/rfcs/blob/main/text/0119-export-to-oci.md#how-it-works) containing input images (`<run-image>` or `<previous-image>` if available) in OCI layout format,
following the [rules](https://github.com/buildpacks/spec/blob/platform/v0.12/platform.md#map-an-image-reference-to-a-path-in-the-layout-directory) to convert the image reference to a path.

#### During build

The feature is enabled by providing a `-layout` flag or by setting the `CNB_USE_LAYOUT` environment variable to `true` for the following lifecycle phases:

- [Analyze](https://buildpacks.io/docs/concepts/components/lifecycle/analyze/)
- [Restore](https://buildpacks.io/docs/concepts/components/lifecycle/restore/)
- [Export](https://buildpacks.io/docs/concepts/components/lifecycle/export/)
- [Create](https://buildpacks.io/docs/concepts/components/lifecycle/create/)

Additionally, the path to the layout directory must be specified, either by providing a `-layout-dir` flag or by setting the `CNB_LAYOUT_DIR` environment variable.

**Note**: [Rebasing](https://buildpacks.io/docs/concepts/components/lifecycle/rebase/) an image exported to OCI layout format
and extending OCI layout base images with Dockerfiles are currently not supported.

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
