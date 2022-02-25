+++
title="Buildpack API 0.6 -> 0.7"
+++

<!--more-->

This guide is most relevant to buildpack authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/buildpack%2Fv0.7) for buildpack API 0.7 for the full list of changes and further details.

### New standardized SBOM format

Buildpacks may write Software Bill of Materials (SBOM) files describing build- or run-time dependencies. These files must use the `application/vnd.cyclonedx+json`, `application/spdx+json`, or `application/vnd.syft+json` media types (a buildpack may output SBOM files in multiple formats). Files may be written to the following locations:

* `<layers>/<layer>.sbom.<ext>` - for describing dependencies associated with a layer
  * Example (launch layer): libraries that were included in an output compiled binary (e.g., `go` libraries in a `go` binary)
  * Example (build layer): tools like a package manager
* `<layers>/launch.sbom.<ext>` - for describing run-time dependencies not associated with a layer
  * Example: dependencies installed in the `/workspace` directory
* `<layers>/build.sbom.<ext>` - for describing build-time dependencies not associated with a layer
  * Example: build time configuration

Valid `<ext>` extensions are as follows:
 | SBOM Media Type                  | File Extension
 |----------------------------------|----------------------------------------------
 | `application/vnd.cyclonedx+json` | `cdx.json`
 | `application/spdx+json`          | `spdx.json`
 | `application/vnd.syft+json`      | `syft.json`

SBOM files for launch will be included in the application image if the platform api supports it; SBOM files for build may be saved off by the platform prior to the build container exiting.

Layer-associated SBOM files will be cached and restored to the buildpack layers directory on re-builds of the same image (much like the `<layers>/<layer>.toml` metadata file). `<layers>/launch.sbom.<ext>` and `<layers>/build.sbom.<ext>` must be re-created on each build.

The `[bom]` tables in launch.toml and build.toml are deprecated, but remain supported to enable backwards compatibility with platforms implementing Platform API < 0.8.

### New fields in buildpack descriptor

* A `sbom-formats` array indicating the SBOM formats output by the buildpack.
