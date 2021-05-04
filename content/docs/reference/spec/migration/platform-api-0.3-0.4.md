+++
title="Platform API 0.3 -> 0.4"
+++

<!--more-->

This guide is most relevant to platform operators.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.4) for platform API 0.4 for the full list of changes and further details.

### Windows support

Windows image builds are now supported! See the [Windows build guide](/docs/app-developer-guide/build-a-windows-app)
for more details.

### Multicall launcher

When running the exported application image, it is now possible to provide arguments to pre-defined process types. 
The new flow is described [here](/docs/app-developer-guide/run-an-app/#run-a-multi-process-app).
As part of these changes, the exporter will not set, and the launcher no longer accepts, the `CNB_PROCESS_TYPE` variable.
See the associated [RFC](https://github.com/buildpacks/rfcs/blob/main/text/0045-launcher-arguments.md) and [spec PR](https://github.com/buildpacks/spec/pull/118)
for more details.

### Export & rebase report

The exporter and rebaser now produce a [report.toml](https://github.com/buildpacks/spec/pull/113) containing the identifier of the application image.
When building, platforms can optionally specify the location of the report, or save it off somewhere.

### Removal of top-level `version` from `BOM`

When interpreting the Bill-of-Materials (BOM), `version` [will no longer be found at the top level](https://github.com/buildpacks/spec/pull/117).
The lifecycle will convert any `version` provided by buildpacks to `metadata.version`.
Related: as of buildpack API 0.3, `version` is [deprecated](https://github.com/buildpacks/spec/pull/97) as a top-level key in the build plan.

### New exit code definition

The lifecycle now defines [specific error codes](https://github.com/buildpacks/spec/pull/115) to signal the lifecycle phase where the error occurred, and for API incompatibilities.
When building, the new error codes can be interpreted according to the new definition.
This is particularly helpful when using the `creator`.
