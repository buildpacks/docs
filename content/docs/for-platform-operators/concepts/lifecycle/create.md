+++
title="Create"
weight=6
+++

The `creator` runs `analyze`, `detect`, `restore`, `build`, and `export` in a single command.

<!--more-->

The `platform` must execute `creator` in the `build` environment.

### Exit Codes

The outputs produced by `creator` are identical to those produced by `exporter`, with the following additional expanded set of error codes.

| Exit Code       | Result                                |
|-----------------|---------------------------------------|
| `0`             | Success                               |
| `11`            | Platform API incompatibility error    |
| `12`            | Buildpack API incompatibility error   |
| `1-10`, `13-19` | Generic lifecycle errors              |
| `20-29`         | Detection-specific lifecycle errors   |
| `30-39`         | Analysis-specific lifecycle errors    |
| `40-49`         | Restoration-specific lifecycle errors |
| `50-59`         | Build-specific lifecycle errors       |
| `60-69`         | Export-specific lifecycle errors      |

***

For more information about the `creator`, see the [Platform API spec](https://github.com/buildpacks/spec/blob/main/platform.md#creator).
