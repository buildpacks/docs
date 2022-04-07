+++
title="Platform API 0.8 -> 0.9"
+++

<!--more-->

This guide is most relevant to platform operators.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.9) for platform API 0.9 for the full list of changes and further details.

## Platform Operator

### Legacy BOM information removed from `io.buildpacks.build.metadata` label

Legacy BOM information is removed from the `io.buildpacks.build.metadata` label and `<layers>/config/metadata.toml`. Buildpacks may still output BOM information in the legacy format, and it can now be found in `<layers>/sbom/launch/sbom.legacy.json` (for runtime dependencies) or `<layers>/sbom/build/sbom.legacy.json` (for build time dependencies). Note that `<layers>/sbom/build/sbom.legacy.json` is not exported in the application image, and must be copied from the build container before it exits.

### Configurable image create time

Platforms can set `SOURCE_DATE_EPOCH` in the exporter's environment to configure the create time of the exported application image. For example, platforms can set `SOURCE_DATE_EPOCH=$(date +%s)` to give images a meaningful create time instead of the current hard coded value of January 1, 1980. Note that changing the create time for an image will change its digest, affecting build reproducibility. For more information on build reproducibility, see our [blog post](https://medium.com/buildpacks/time-travel-with-pack-e0efd8bf05db).

### New analyzer flags

The analyze phase accepts a `-launch-cache` flag, improving performance when restoring the SBOM layer from the previous image in a Docker daemon. This should save several seconds of build time when using a Docker daemon and the untrusted builder workflow. Additionally, the analyzer accepts a `-skip-layers` flag to completely skip SBOM layer restoration instead of merely omitting SBOM files from buildpack layer directories when skipping the `restore` phase.

### Process-specific working directory

As of Buildpack API 0.8, buildpacks can specify the working directory for a process. If a working directory has been specified, this information will be included in the `io.buildpacks.build.metadata` label so that platforms can display this information to end users.
