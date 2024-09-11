+++
title="Analyze"
aliases=[
  "/docs/concepts/components/lifecycle/analyze"
]
weight=1
+++

The `analyzer` restores files that buildpacks may use to optimize the `build` and `export` phases.

<!--more-->

Prior to `Platform API 0.7`, the `analyzer` was responsible for analyzing the metadata from the cache and the previously built image, if available, to determine what layers can or cannot be reused.
This information is used during the `export` phase in order to avoid re-uploading unchanged layers.\
Starting from `Platform API 0.7`, the `analyze` phase runs before the `detect` phase in order to validate registry access for all images that are used during the build as early as possible. In this way it provides faster failures for end users. The other responsibilities of the `analyzer` were moved to the `restorer`.\
For more information, please see [this migration guide][platform-api-06-07-migration].

### Exit Codes

| Exit Code       | Result                              |
|-----------------|-------------------------------------|
| `0`             | Success                             |
| `11`            | Platform API incompatibility error  |
| `12`            | Buildpack API incompatibility error |
| `1-10`, `13-19` | Generic lifecycle errors            |
| `30-39`         | Analysis-specific lifecycle errors  |

[platform-api-06-07-migration]: https://buildpacks.io/docs/for-platform-operators/how-to/migrate/deprecated/platform-api-0.6-0.7/
