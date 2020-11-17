+++
title="package.toml"
summary="Schema of the buildpack package config file."
aliases=["/docs/reference/package-config/"]
+++

A [buildpackage][package] configuration schema is as follows:

- #### `buildpack` _(required)_
  The buildpack to package. It must contain the following field:

  - **`uri`** _(string, required)_\
    A URL or path to an [archive][supported-archives], or a path to a directory. If path is relative, it must be relative to the `package.toml`.

- #### `dependencies` _(list, optional)_
  A set of dependent buildpack locations, for packaging a meta-buildpack. Each dependent buildpack location must correspond to an [order group][order-group] within the meta-buildpack being packaged, and must have **one** of the following fields:

  - **`uri`** _(string)_\
    A URL or path to an [archive][supported-archives], a packaged buildpack (saved as a `.cnb` file), or a directory. If path is relative, it must be relative to the `package.toml`.

- #### `platform` _(optional)_
  The expected runtime environment for the buildpackage. It should contain the following field:

  - **`os`** _(string, optional)_\
    The operating system type that the buildpackage will run on. Only `linux` or `windows` is supported. If omitted, `linux` will be the default. 


## Further Reading

You can view [sample buildpackages](https://github.com/buildpacks/samples/tree/main/packages) on Github.

[package]: /docs/concepts/components/buildpack#distribution
[supported-archives]: /docs/reference/builder-config#supported-archives
[order-group]: /docs/reference/spec/buildpack-api/#schema
