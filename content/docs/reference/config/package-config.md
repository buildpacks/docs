+++
title="package.toml"
aliases=[
  "/docs/reference/package-config/",
]
weight=4
+++

The package config file is used for packaging buildpacks for distribution as OCI images or tar files.

<!--more-->

The schema is as follows:

- #### `buildpack` _(required)_
  The buildpack to package. It must contain the following field:

  - **`uri`** _(string, required)_\
    A URL or path to an [archive][supported-archives], or a path to a directory. If path is relative, it must be relative to the `package.toml`.

- #### `dependencies` _(list, optional)_
  A set of dependent buildpack locations, for packaging a composite buildpack (sometimes referred to as a "meta buildpack"). Each dependent buildpack location must correspond to an [order group][order-group] within the composite buildpack being packaged, and must have **one** of the following fields:

  - **`uri`** _(string)_\
    A URL or path to an [archive][supported-archives], a packaged buildpack (saved as a `.cnb` file), or a directory. If path is relative, it must be relative to the `package.toml`.

- #### `platform` _(optional)_
  The expected runtime environment for the buildpackage. It should contain the following field:

  - **`os`** _(string, optional)_\
    The operating system type that the buildpackage will run on. Only `linux` or `windows` is supported. If omitted, `linux` will be the default. 


## Further Reading

You can view [sample buildpackages](https://github.com/buildpacks/samples/tree/main/packages) on Github.

[package]: /docs/for-platform-operators/concepts/buildpack#distribution
[supported-archives]: /docs/reference/builder-config#supported-archives
[order-group]: https://github.com/buildpacks/spec/blob/main/buildpack.md#order-resolution
