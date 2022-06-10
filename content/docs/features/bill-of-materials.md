+++
title="Software Bill of Materials"
summary="A `Software Bill-of-Materials` (`SBoM`) gives you a layer-by-layer view of what's inside your container in a variety of formats."
+++

## Summary

A **Software-Bill-of-Materials** (`SBoM`) lists all the software components included in an image.  Cloud Native Buildpacks provides all the transparency you need to have confidence in your image supply chain.  Software-Bill-of-Materials in [CycloneDX](https://cyclonedx.org/), [Syft](https://github.com/anchore/syft) and [Spdx](https://spdx.dev/) formats are supported.

1. Buildpacks can populate `SBoM` information about the dependencies they have provided.

## Viewing Bill of Materials

You can use the `sbom download` command to inspect your app for its Software-Bill-of-Materials. The following command will download the application layer containing the `SBoM` files to `./layers/sbom/...` on your local filesystem.

```bash
pack sbom download your-image-name
```

You can also choose to download the `SBoM` from an image hosted in a remote registry, as opposed to an image hosted in a Docker daemon. You use the `--remote` flag to do so.

```bash
pack sbom download your-image-name --remote
```

The following example demonstrates  running `pack sbom download ...` on an image containing an `SBoM` in  `syft` format.  Running `pack sbom download ...` creates a `layers/sbom` directory and populates that directory with `sbom.syft.json` files.  The combined metadata from all of the `sbom.syft.json` files is the image `SBoM`. Where an image generates CycloneDX `SBoM` metadata, the files a named `sbom.cdx.json`. Similarly, Spdx files are named `sbom.cdx.json`.

```bash
layers
  └── sbom
      └── launch
          └── paketo-buildpacks_ca-certificates
              ├── helper
              │   └── sbom.syft.json
              └── sbom.syft.json
```

## Adding Bill of Materials

[`pack`](https://github.com/buildpacks/pack), [`kpack`](https://github.com/pivotal/kpack) and [tekton](https://tekton.dev/) users will find that images created using these tools contain an SBoM.

Developers writing a new buildpack or updating an existing buildpack should use the [Adding bill of materials][adding-bill-of-materials] tutorial to incorporate a `Bill-of-Materials` in their buildpack.

[adding-bill-of-materials]: /docs/buildpack-author-guide/create-buildpack/adding-bill-of-materials/
