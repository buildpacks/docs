+++
title="project.toml"
summary="Schema of the project descriptor file."
aliases=["/docs/reference/project-descriptor/"]
+++

A project descriptor allows users to detail configuration for apps, services, functions and buildpacks. It should, by
default, be named `project.toml`, though users can name it differently, and pass the filename to `pack` by calling
```shell script
$ pack build --descriptor <project-descriptor path>
```

The schema for the `project descriptor` is:

- #### `project` _(table, optional)_
  A configuration table for a project.

  - **`id`** _(string, optional)_\
    A machine readable identifier for the `project`. For example, `com.example.myservice`.

  - **`name`** _(string, optional)_\
    A human readable identifier for the `project`. For example, `My Example Service`.

  - **`version`** _(string, optional)_\
    The version of the `project`.

   - **`authors`** _(string list, optional)_\
    The names and/or email addresses of the `project` authors.

  - **`documentation-url`** _(string, optional)_\
    A link to the documentation for the `project`.

  - **`source-url`** _(string, optional)_\
    A link to the source code of the `project`.

   - **`licenses`** _(list, optional)_\
    A list of project licenses. Each must contain **at least one** of the following fields:

      - **`type`** _(string, optional)_\
        The type of license.

      - **`uri`** _(string, optional)_\
        If the project uses a nonstandard license, you may use `uri` to point to the license.

- #### `build` _(table, optional)_
  A list of specifications for build-time configuration of the project.

   - **`env`** _(list, optional)_
    You can set environment variables at build time, by defining each with the following fields:

      - **`name`** _(string, optional)_\
        The name of the environment variable

      - **`value`** _(string, optional, default: latest)_\
        The assigned version of the environment variable

   - **`include`** _(string list, optional)_\
    A list of files to include in the build, while excluding everything else.

        OR

   - **`exclude`** _(string list, optional)_\
    A list of files to exclude from the build, while including everything else.

    > If `include` and `exclude` are both present, the lifecycle will error out.

   - **`buildpacks`** _(list, optional)_
    A list of buildpacks. Either a `version`, `uri`, or `script` table must be included, but it must not include any combination of these elements.

      - **`id`** _(string, optional)_\
        An identifier for the buildpack. Must match ID specified in buildpack's `buildpack.toml` file.

      - **`version`** _(string, optional, default: latest)_\
        The version of the buildpack. Must match version specified in buildpack's `buildpack.toml` file.

      - **`uri`** _(string, default=`urn:buildpack:<id>`)_\
        A URL or path to an [archive][supported-archives], a packaged buildpack (saved as a `.cnb` file), or a directory. If path is relative, it must be relative to the `project.toml`.

      - **`script`** _(list, optional)_
      Defines an inline buildpack.

        - **`api`** _(string, required, current: `0.5`)_\
          The Buildpack API version the buildpack adheres to. Used to ensure [compatibility][api-compat] against the [lifecycle][lifecycle].

        - **`inline`** _(string, required)_\
          The build script contents.

        - **`shell`** _(string, optional, default=`/bin/sh`)_\
          The shell used to execute the `inline` script.

- #### `metadata` _(table, optional)_
  Buildpacks and specific platforms are free to define additional arbitrary key-value pairs in the `metadata` table.

## Example
An example `project.toml` is:
```toml
[project]
id = "io.buildpacks.my-app"
version = "0.1"

[build]
include = [
    "cmd/",
    "go.mod",
    "go.sum",
    "*.go"
]

[[build.env]]
name = "JAVA_OPTS"
value = "-Xmx1g"

[[build.buildpacks]]
id = "io.buildpacks/java"
version = "1.0"

[[build.buildpacks]]
id = "io.buildpacks/nodejs"
version = "1.0"

[metadata]
foo = "bar"

[metadata.fizz]
buzz = ["a", "b", "c"]
```

## Specification
For more detail, you can check out the `project.toml` [specification][spec]

[spec]: https://github.com/buildpacks/spec/blob/main/extensions/project-descriptor.md
[supported-archives]: /docs/reference/builder-config#supported-archives
[api-compat]: /docs/reference/buildpack-api#api-compatibility
[lifecycle]: /docs/concepts/components/lifecycle/
