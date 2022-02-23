+++
title="Structured Bill of Materials"
summary="A Software `Structured Bill-of-Materials` (`SBoM`) gives you a layer-by-layer view of what's inside your container in a variety of formats."
+++

## Summary

A **Structured-Bill-of-Materials** (`SBoM`) provides information necessary to know what's inside your container and how it was constructed.
Cloud Native Buildpacks provides Structured-Bill-of-Materials in either CycloneDX, SPDX, or Syft format.

1. Buildpacks can populate `SBoM` information about the dependencies they have provided.
2. A list of what buildpacks were used to build the application.

## Adding Bill of Materials

Use the following tutorial to add a `Bill-of-Materials` using buildpacks. <br/>
[Adding bill of materials][adding-bill-of-materials]

## Viewing Bill of Materials

You can use the `sbom download` command to inspect your app for its `Structured-Bill-of-Materials`. The following command will download the application layer containing the `SBoM` files to `./layers/sbom/...` on your local filesystem.

```bash
pack sbom download your-image-name
```

You can also choose to download the `SBoM` from an image hosted in a remote registry, as opposed to an image hosted in a Docker daemon. You use the `--remote` flag to do so.

```bash
pack download-sbom your-image-name --remote
```

Cloud Native Buildpacks support `SBoM` metadata in [CycloneDX](https://cyclonedx.org/), [Syft](https://github.com/anchore/syft) or [Spdx](https://spdx.dev/) formats.  The following example demonstrates `syft` format `SBoM` metadata to the local filesystem.  The combined metadata from all of the `sbom.syft.json` files is the image `SBoM`. Where CycloneDX `SBoM` metadata is generated, the files are named `sbom.cdx.json`. Similarly, Spdx files are named `sbom.cdx.json`.

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
