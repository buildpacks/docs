+++
title="Platform API 0.7 -> 0.8"
+++

<!--more-->

This guide is most relevant to platform operators.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.8) for platform API 0.8 for the full list of changes and further details.

## Platform Operator

### New standardized SBOM format

Buildpacks implementing Buildpack API 0.7+ may output write Software Bill of Materials (SBOM) files describing build- or run-time dependencies. These files must use the `application/vnd.cyclonedx+json`, `application/spdx+json`, or `application/vnd.syft+json` media types (a buildpack may output SBOM files in multiple formats). Files may be written to the following locations:
                                                      
* `<layers>/<buildpack-id>/<layer>.sbom.<ext>` - for describing dependencies associated with a layer
* `<layers>/<buildpack-id>/launch.sbom.<ext>` - for describing run-time dependencies not associated with a layer
* `<layers>/<buildpack-id>/build.sbom.<ext>` - for describing build-time dependencies not associated with a layer

Valid `<ext>` extensions are as follows:
 | SBOM Media Type                  | File Extension
 |----------------------------------|----------------------------------------------
 | `application/vnd.cyclonedx+json` | `cdx.json`
 | `application/spdx+json`          | `spdx.json`
 | `application/vnd.syft+json`      | `syft.json`

#### Launch
 
SBOM files for launch will be included in the application image at the following locations:

* `<layers>/<buildpack-id>/<layer>.sbom.<ext>` (as written by the buildpack) is moved to `<layers>/sbom/launch/<buildpack-id>/<layer>/sbom.<ext>` for launch layers
* `<layers>/<buildpack-id>/launch.sbom.<ext>` (as written by the buildpack) is moved to `<layers>/sbom/launch/<buildpack-id>/sbom.<ext>`

The platform can retrieve the digest of the layer containing the SBOM files by reading the `sbom` key from the `io.buildpacks.lifecycle.metadata` label.

#### Build

SBOM files for build will be available in the build container at the following locations:

* `<layers>/<buildpack-id>/<layer>.sbom.<ext>` (as written by the buildpack) is moved to `<layers>/sbom/build/<buildpack-id>/<layer>/sbom.<ext>` for non-launch layers
* `<layers>/<buildpack-id>/build.sbom.<ext>` (as written by the buildpack) is moved to `<layers>/sbom/build/<buildpack-id>/sbom.<ext>`

Note that the `<layers>/sbom/build` directory is NOT present in the application image. It may be saved off by the platform prior to the build container exiting.

#### Backwards compatibility - older buildpacks

Platforms can continue to retrieve BOM information in the legacy format (if output by buildpacks) by reading the `bom` key in the `io.buildpacks.build.metadata` label (for run-time dependencies), and by saving off report.toml prior to the build container exiting (for build-time dependencies).
