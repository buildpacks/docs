+++
title="Restore"
weight=3
+++

The `restorer` copies layers from the `cache` into the `build` container.

<!--more-->

During this phase, the `restorer` looks for layers that could be reused or should be replaced while building the app image.

One of the `restorer`'s [input files](https://github.com/buildpacks/spec/blob/main/platform.md#inputs-2) are `<cache-dir>`and `<cache-image>`to retrieve cache contents, and two of its [output files](https://github.com/buildpacks/spec/blob/main/platform.md#outputs-2) are `store.toml` and `<layer>.toml`.

Unless the `<skip-layers>` flag is passed in as `true`, the `restorer` must always perform [layer restoration](#layer-restoration)

- For each buildpack in `<group>`, if persistent metadata for that buildpack exists in the analysis metadata, the `lifecycle` must write a `toml` representation of the persistent metadata to `<layers>/<buildpack-id>/store.toml`
- **If** `<skip-layers>` is `true` the lifecycle must not perform layer restoration.
- **Else** the `lifecycle` must perform [layer restoration](#layer-restoration) for any app image layers or cached layers created by any buildpack present in the provided `<group>`.
- When `<build-image>` is provided (optional), the lifecycle:
  - MUST record the digest reference to the provided `<build-image>` in `<analyzed>`
  - MUST copy the OCI manifest and config file for `<build-image>` to `<kaniko-dir>/cache`
- The `lifecycle`:
  - Must [resolve mirrors](https://github.com/buildpacks/spec/blob/main/platform.md#run-image-resolution) for the `run-image.reference` in `<analyzed>` and resolve it to a digest reference
  - Must populate `run-image.target` data in `<analyzed>` if not present
  - **If** `<analyzed>` has `run-image.extend = true`, the `lifecycle`:
    - Must download from the registry and save in OCI layout format the `run-image` in `<analyzed>` to `<kaniko-dir>/cache`

### Layer Restoration

The `lifecycle` must use the provided `cache-dir` or `cache-image` to retrieve cache contents. The [rules](https://github.com/buildpacks/spec/blob/main/buildpack.md#layer-types) for restoration must be followed when determining how and when to store cache layers.

### Exit Codes

If the `restore` phase was successful or there was any error during the process, the output will have one of the following exit codes:

| Exit Code       | Result                                |
|-----------------|---------------------------------------|
| `0`             | Success                               |
| `11`            | Platform API incompatibility error    |
| `12`            | Buildpack API incompatibility error   |
| `1-10`, `13-19` | Generic lifecycle errors              |
| `40-49`         | Restoration-specific lifecycle errors |

***

For more information about the `restorer`, see the [Platform API spec](https://github.com/buildpacks/spec/blob/main/platform.md#restorer).
