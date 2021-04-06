+++
title="Platform API 0.5 -> 0.6"
+++

<!--more-->

This guide is most relevant to platform operators.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.6) for platform API 0.6 for the full list of changes and further details.

## Platform Operator

### Default process type not set if none is specified

The `exporter` will no longer set the default process type if none is specified (even if there is only one process). Buildpacks implementing Buildpack API 0.6 or greater may set the default process type, or it may be specified by passing `-process-type` to the `exporter`. To enable buildpacks implementing older Buildpack APIs to work with newer buildpacks, the lifecycle will assume that buildpacks that implement Buildpack API less than 0.6 intended for `web` processes to be the default.

### New location for order.toml

The `detector` will now look for `order.toml` in `<layers>` before checking other paths. This enables platforms to write `order.toml` into a mounted `<layers>` directory and override the builder's `order.toml` without knowing where it is saved on the builder.

### Image working directory is set to app directory

The working directory on the exported image config will match the value of `CNB_APP_DIR`. This means that when running the image, processes started without the launcher will still use the app directory as the working directory.

### Condensed exit codes

Lifecycle exit codes are condensed to be within 0-255 so that they are understandable when surfaced in Bash. Platforms should take note of the new values when interpreting exit codes returned by the lifecycle. See the [lifecycle][lifecycle] component pages for more information.

### Image manifest size in report.toml

The report.toml output by the exporter will now include the image manifest size in bytes. Note that this only applies to published images, as images exported to a docker daemon will not have a manifest.

[lifecycle]: /docs/concepts/components/lifecycle/
