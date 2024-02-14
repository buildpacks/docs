+++
title="Download a Software Bill-of-Materials (SBOM)"
summary="An SBOM can give you a layer-by-layer view of what's inside your application image."
weight=3
+++

## Summary

A **Software-Bill-of-Materials** (`SBOM`) lists all the software components included in an image.  Cloud Native Buildpacks provides all the transparency you need to have confidence in your image supply chain.  Software-Bill-of-Materials in [CycloneDX](https://cyclonedx.org/), [Syft](https://github.com/anchore/syft) and [Spdx](https://spdx.dev/) formats are supported.

1. Buildpacks can populate `SBOM` information about the dependencies they have provided.

## Viewing Bill of Materials

You can use the `sbom download` command to inspect your app for its Software-Bill-of-Materials. The following command will download the application layer containing the `SBOM` files to `./layers/sbom/...` on your local filesystem.

```bash
pack sbom download your-image-name
```

You can also choose to download the `SBOM` from an image hosted in a remote registry, as opposed to an image hosted in a Docker daemon. You use the `--remote` flag to do so.

```bash
pack sbom download your-image-name --remote
```

The following example demonstrates  running `pack sbom download ...` on an image containing an `SBOM` in  `syft` format.  Running `pack sbom download ...` creates a `layers/sbom` directory and populates that directory with `sbom.syft.json` files.  The combined metadata from all of the `sbom.syft.json` files is the image `SBOM`. Where an image generates CycloneDX `SBOM` metadata, the files are named `sbom.cdx.json`. Similarly, Spdx files are named `sbom.spdx.json`.

```bash
layers
  └── sbom
      └── launch
          └── paketo-buildpacks_ca-certificates
              ├── helper
              │   └── sbom.syft.json
              └── sbom.syft.json
```
