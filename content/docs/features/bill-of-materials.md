+++
title="Structured Bill of Materials"
summary="A Software `Structured Bill-of-Materials` (`SBoM`) gives you a layer-by-layer view of what's inside your container in a variety of formats."
+++

## Summary

A Software **Structured-Bill-of-Materials** (`SBoM`) provides information necessary to know what's inside your container and how it was constructed.
Cloud Native Buildpacks provides Structured-Bill-of-Materials in either CycloneDX, SPDX, or Syft format.

1. Buildpacks can populate `SBoM` information about the dependencies they have provided.
2. A list of what buildpacks were used to build the application.

## Adding Bill of Materials

Use the following tutorial to add a `Bill-of-Materials` using buildpacks. <br/>
[Adding bill of materials][adding-bill-of-materials]

## Viewing Bill of Materials

You can use the `download-sbom` command to inspect your app for it's `Structured-Bill-of-Materials`. The following command will download the application layer containing the `SBoM` files to `./layers/sbom/...`.

```bash
pack download-sbom your-image-name
```

You can also choose to download the `SBoM` from an image hosted in a remote registry, as opposed to an image hosted in a Docker daemon. You use the `--remote` flag to do so.

```bash
pack download-sbom your-image-name --remote
```

The following is a sample directory structure for an `SBoM` layer downloaded to the local filesystem. The files are named in the following pattern `sbom.<FORMAT>.json`, where FORMAT can be one of the Structured-Bill-of-Material formats allowed by Cloud Native Buildpacks tooling: `cdx`, `spdx`, or `syft`. Buildpack authors may choose to generate `SBoM` for the entire buildpack, or individual layers designated by the buildpack.

```bash
.
└── layers
    └── sbom
        └── launch
            └── paketo-buildpacks_ca-certificates
                ├── helper
                │   └── sbom.syft.json
                └── sbom.syft.json
```

The layer information is stored under the `io.buildpacks.lifecycle.metadata` label of the application image.
```bash
docker inspect your-image-name | jq -r '.[0].Config.Labels["io.buildpacks.lifecycle.metadata"]' |  jq -r .sbom
{
  "sha": "sha256:abcd1234defg5678"
}
```

[adding-bill-of-materials]: /docs/buildpack-author-guide/create-buildpack/adding-bill-of-materials/
