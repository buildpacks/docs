
+++
title="Platform API 0.10 -> 0.11"
aliases=[
  "/docs/reference/spec/migration/platform-api-0.10-0.11"
]
weight=4
+++

<!--more-->

This guide is most relevant to platform operators and builder authors.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.11) for Platform API 0.11 for the full list of changes and further details.

## Platform Operator

### SBOM files for the `launcher` are included in the application image

In Platform 0.11, the lifecycle ships with standardized SBOM files describing the `lifecycle` and `launcher` binaries
(these are included in the tarball on the GitHub release page and within the image at `index.docker.io/buildpacksio/lifecycle:<version>`).

After a build, SBOM files describing the `launcher` are included in the application image at `<layers>/sbom/launch/buildpacksio_lifecycle/launcher/sbom.<ext>`,
where `<ext>` is each of: `cdx.json`, `spdx.json`, and `syft.json`.
Additionally, SBOM files describing the `lifecycle` are copied to `<layers>/sbom/build/buildpacksio_lifecycle/sbom.<ext>`,
where they may be saved off by the platform prior to the build container exiting.

This mirrors what is already being done as of Platform 0.8 for buildpack-provided standardized SBOM files,
which are exported to `<layers>/sbom/launch/<buildpack-id>/<layer>/sbom.<ext>` (for runtime dependencies)
and copied to `<layers>/sbom/launch/<buildpack-id>/sbom.<ext>` (for build-time dependencies).

To use this feature, no additional action is required from platforms that are already handling buildpack-provided SBOM files.
The SBOMs for the image will simply be more complete.

### The rebaser accepts a -previous-image flag to allow rebasing by digest reference

Previously, when rebasing an image, the rebased image would always be saved to the same tag as the original image.
This prevented rebasing by digest, among other use cases.

In Platform 0.11, the original image may be specified separately from the destination image with the `previous-image` flag, as in the following:

```bash
/cnb/lifecycle/rebaser \
    -previous-image registry.example.com/example/my-app:org \
    registry.example.com/example/my-app:dst
```

As before, additional tags for the destination image can also be provided:

```bash
/cnb/lifecycle/rebaser \
    -previous-image registry.example.com/example/my-app:org \
    -tag registry.example.com/example/my-app:latest \
    registry.example.com/example/my-app:dst
```

To use this feature, platforms can provide the new `-previous-image` flag to the `rebaser`.

## Builder Author

### Platforms can specify build time environment variables

Builders can include a `/cnb/build-config/env/` directory to define environment variables for buildpacks.

As an example, file `/cnb/build-config/env/SOME_VAR` with contents `some-val` will become `SOME_VAR=some-val` in the buildpack environment.

Files in the `/cnb/build-config/env/` directory can use suffixes to control the behavior when another entity defines the same variable -
e.g., if `/cnb/build-config/env/SOME_VAR.override` has contents `some-builder-val` and `<platform>/env/SOME_VAR` has contents `some-user-val`,
the buildpack environment will contain `SOME_VAR=some-builder-val`.
This is similar to the [environment modification rules for buildpacks](https://github.com/buildpacks/spec/blob/main/buildpack.md#environment-variable-modification-rules),
except that the default behavior when no file suffix is provided is `default`.

The order of application for env directories is:
* Buildpack: `<layers>/<buildpack-id>/<layer>/<env>/`
* User: `<platform>/env/` - overrides buildpack values
* Builder: `/cnb/build-config/env/`

For additional information, see the [buildpack environment](https://github.com/buildpacks/spec/blob/main/platform.md#buildpack-environment) section in the Platform spec.

To use this feature, builder authors should include a `/cnb/build-config/env/` directory with the desired configuration.
