+++
title="Package Configuration"
weight=9
+++

A [package][package] configuration schema is as follows:

- #### `buildpack` _(required)_
  <br>

  The buildpack to package. It must contain the following field:

  - **`uri`** _(string, required)_
    <br>
    A URL or path to an [archive][supported archives], or a path to a directory. If path is relative, it must be relative to the `package.toml`.

- #### `dependencies` _(list, optional)_
  <br>

  A set of dependent buildpack locations, for packaging a meta-buildpack. Each dependent buildpack location corresponds to an [order group][order group] within the meta-buildpack being packaged, and must have **one** of the following fields: 

  - **`uri`** _(string)_
    <br>
    A URL or path to an [archive][supported archives], or a path to a directory. If path is relative, it must be relative to the `package.toml`.

    OR

  - **`image`** _(string)_
    <br>
    A registry location (if no registry host is specified in the image name, DockerHub is assumed).

## Further Reading

You can view [sample buildpack packages on Github](https://github.com/buildpacks/samples/tree/master/packages).

[package]: /docs/concepts/components/buildpack#distribution
[supported archives]: /docs/reference/builder-config#supported-archives
[order group]: /docs/reference/buildpack-api/#schema