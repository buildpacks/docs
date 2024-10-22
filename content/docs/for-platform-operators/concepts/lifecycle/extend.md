+++
title="Extend"
weight=9
+++

The `extender` applies `Dockerfiles` output by image extensions to the `build` or `runtime` base image.

<!--more-->

### Exit Codes

When extending the build image:

- In addition to the outputs enumerated below, outputs produced by `extender` include those produced by `builder` - as the `lifecycle` will run the `build` phase after extending the `build image`.
- Platforms MUST skip the `builder` and proceed to the `exporter`.

| Exit Code       | Result                              |
|-----------------|-------------------------------------|
| `0`             | Success                             |
| `11`            | Platform API incompatibility error  |
| `12`            | Buildpack API incompatibility error |
| `1-10`, `13-19` | Generic lifecycle errors            |
| `100-109`       | Extension-specific lifecycle errors |

- For each extension in `<group>` in order, if a `Dockerfile` exists in `<generated>/<buildpack-id>/<kind>.Dockerfile`, the `lifecycle`:
  - Shall apply the `Dockerfile` to the environment according to the process outlined in the [Image Extension Specification](https://github.com/buildpacks/spec/blob/main/image_extension.md).
  - SHALL set the build context to the folder according to the process outlined in the [Image Extension Specification](https://github.com/buildpacks/spec/blob/main/image_extension.md).
- The extended image must be an extension of:
  - The `build-image` in `<analyzed>` when `<kind>` is `build`, or
  - The `run-image` in `<analyzed>` when `<kind>` is `run`
- When extending the `build image`, after all `build.Dockerfile`s are applied, the `lifecycle`:
  - Shall proceed with the `build` phase using the provided `<gid>` and `<uid>`
- When extending the run image, after all `run.Dockerfile`s are applied, the `lifecycle`:
  - **If** any `run.Dockerfile` set the label `io.buildpacks.rebasable` to `false` or left the label unset:
    - Shall set the label `io.buildpacks.rebasable` to `false` on the extended run image
  - **If** after the final `run.Dockerfile` the run image user is `root`,
    - Shall fail
  - Shall copy the manifest and config for the extended run image, along with any new layers, to `<extended>`/run

***

For more information about the `extender`, see the [Platform API spec](https://github.com/buildpacks/spec/blob/main/platform.md#extender-optional).
