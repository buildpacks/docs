+++
title="Create slice layers"
weight=99
+++

A `Slice` represents a layer in the `<app>` directory to be exported during the `export` phase.

<!--more-->

 A buildpack MAY specify sub-paths within `<app>` as `slices` in `launch.toml`. Separate layers MUST be created during the [export](https://buildpacks.io/docs/for-buildpack-authors/concepts/lifecycle-phases/#phase-5-export) phase for each slice with one or more files or directories.

## Key Points

* For each `slice`, buildpacks MUST specify zero or more `path globs` such that each path is either:
  * Relative to the root of the app directory without traversing outside of the app directory
  * Absolute and contained within the app directory
* `Path globs` MUST:
  * Follow the pattern syntax defined in the [Go standard library](https://golang.org/pkg/path/filepath/#Match)
  * Match zero or more files or directories
* The `lifecycle` MUST convert the `<app>` directory into one or more layers using slices in each `launch.toml` such that slices from earlier buildpacks are processed before slices from later buildpacks.
* The `lifecycle` MUST process each slice as if all files matched in preceding slices no longer exists in the app directory
* The `lifecycle` MUST accept slices that do not contain any files or directory; however, it MAY warn about such slices
* The `lifecycle` MUST include all unmatched files in the app directory in any number of additional layers in the `OCI image`

## Use Cases

* `Slices` aid in optimizing data transfer for files that are commonly shared across applications

## Implementation Steps

`Slices` are added to the [launch.toml](https://github.com/buildpacks/spec/blob/main/buildpack.md#launchtoml-toml) file in the `<layers>/<layer>` directory as follows:

```toml
[[slices]]
paths = ["<app sub-path glob>"]
```
