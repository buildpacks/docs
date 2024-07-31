+++
title="Create slice layers"
weight=99
+++

After all buildpacks have executed, the contents of the application directory will be included in the final application image as a single layer, OR as `slice` layers. A `slice` layer contains a portion of the application directory as defined by a `filepath` glob.

<!--more-->

`Slices` are useful to avoid re-uploading unchanged data to the image registry. For example, if the application directory is a monolithic repository containing code for both a web frontend and sever backend, buildpacks can slice the directory into separate layers. Thus developers iterating on one part of the code base don't have to wait for the entire directory to re-upload at the end of the build.

## Key Points

* For each `slice`, buildpacks MUST specify zero or more `path globs` such that each path is either:
  * Relative to the root of the app directory without traversing outside of the app directory
  * Absolute and contained within the app directory
* `Path globs` MUST:
  * Follow the pattern syntax defined in the [Go standard library](https://golang.org/pkg/path/filepath/#Match)
  * Match zero or more files or directories
* `Slices` from earlier buildpacks are processed before `slices` from later buildpacks. When a file is included in a `slice`, it is as if it no longer exists in the application directory for processing future `slices`.

## Implementation Steps

`Slices` are added to the [launch.toml](https://github.com/buildpacks/spec/blob/main/buildpack.md#launchtoml-toml) file in the `<layers>/<layer>` directory as follows:

```toml
[[slices]]
paths = ["<app sub-path glob>"]
```

A buildpack may specify sub-paths within `<app>` as `slices` in `launch.toml`. The lifecycle will create separate layers during the [export](https://buildpacks.io/docs/for-buildpack-authors/concepts/lifecycle-phases/#phase-5-export) phase for each slice containing one or more files or directories. Any files in the `<app>` directory that are not included in buildpack-defined slices will be included in the image as a final slice layer.
