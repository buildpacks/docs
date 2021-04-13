+++
title="Export"
weight=5
summary="Creates the final OCI image."
+++

{{< param "summary" >}}

### Exit Codes

| Exit Code       | Result|
|-----------------|-------|
| `0`             | Success
| `11`            | Platform API incompatibility error
| `12`            | Buildpack API incompatibility error
| `1-10`, `13-19` | Generic lifecycle errors
| `60-69`         |  Export-specific lifecycle errors


### Image

The `exporter` accepts as an argument the tag reference to which the app image will be written, either in an OCI image registry or a docker daemon.

### report.toml

The `exporter` will write a [`report.toml`](https://github.com/buildpacks/spec/blob/main/platform.md#reporttoml-toml) containing information about the exported image such as its digest and manifest size (if exported to an OCI registry) or identifier, and any build BOM contributed by buildpacks. The location of the output report can be specified by passing the `-report` flag; by default, it is written to `<layers>/report.toml` - note that this is NOT present in the filesystem of the exported image.

***

For more information about the `exporter`, see the [Platform API spec](https://github.com/buildpacks/spec/blob/main/platform.md#exporter).
