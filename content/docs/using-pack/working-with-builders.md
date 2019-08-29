+++

title="Working with builders using `create-builder`"
weight=303
creatordisplayname = "Andrew Meyer"
creatoremail = "ameyer@pivotal.io"
lastmodifierdisplayname = "Andrew Meyer"
lastmodifieremail = "ameyer@pivotal.io"

+++

`pack create-builder` enables buildpack authors and platform operators to bundle a collection of buildpacks into a
single image for distribution and use with a specified stack.

```bash
$ pack create-builder <image-name> --builder-config <path-to-builder-toml>
```

### Example: Creating a builder from buildpacks

In this example, a builder image is created from buildpacks `org.example.buildpack-1` and `org.example.buildpack-2`.
A [TOML configuration file](#builder-configuration) provides necessary configuration to the command.

```toml
[[buildpacks]]
  id = "org.example.buildpack-1"
  version = "0.0.1"
  uri = "relative/path/to/buildpack-1"

[[buildpacks]]
  id = "org.example.buildpack-2"
  version = "0.0.1"
  uri = "https://example.org/buildpacks/buildpack-2.tgz"

[[order]]
  [[order.group]]
    id = "org.example.buildpack-1"
    version = "0.0.1"
  
  [[order.group]]
    id = "org.example.buildpack-2"
    version = "0.0.1"

[stack]
  id = "com.example.stack"
  build-image = "example/build"
  run-image = "example/run"
```

Running `create-builder` while supplying this configuration file will produce the builder image.

```bash
$ pack create-builder my-builder:my-tag --builder-config path/to/builder.toml
```

Like [`build`](/docs/using-pack/building-app), `create-builder` has a `--publish` flag that can be used to publish
the generated builder image to a registry.

The builder can then be used in `build` by running:

```bash
$ pack build my-app:my-tag --builder my-builder:my-tag --buildpack org.example.buildpack-1
```

### Builders explained

![create-builder diagram](/docs/using-pack/create-builder.svg)

A builder is an image containing a collection of buildpacks that will be executed against application source code, in
the order defined by the builder's [configuration file](#builder-configuration). This image's base will be the build
image associated with a given stack.

> A buildpack's primary role is to inspect the source code, determine any
> dependencies that will be required to compile and/or run the app, and provide runtime dependencies as layers in the
> final app image. 
> 
> It's important to note that the buildpacks in a builder are not actually executed until
> [`build`](/docs/using-pack/building-app/#building-explained) is run.

#### Lifecycle

A builder also includes a layer with a series of binaries that are executed during [`build`](/docs/using-pack/building-app/#building-explained).
These binaries collectively represent the [buildpack lifecycle](https://github.com/buildpack/lifecycle#lifecycle). See
[Builder configuration](#builder-configuration) for more information on configuring the lifecycle for a builder.

### Builder configuration

The [`create-builder`](/docs/using-pack/working-with-builders) command requires a TOML configuration file (commonly
referred to as `builder.toml`). This file has a number of fields.

- **`description`** _(string, optional)_
  <br>
  A human-readable description of the builder, to be shown in `inspect-builder` output
  (run `pack inspect-builder -h` for more information).

- **`buildpacks`** _(list, required)_
  <br>
  A list of buildpacks, each with the following fields:
  
  - **`id`** _(string, optional)_
    <br>
    An identifier for the buildpack. Must match ID specified in buildpack's `buildpack.toml` file.
    
  - **`version`** _(string, optional)_
    <br>
    The version of the buildpack. Must match version specified in buildpack's `buildpack.toml` file.
    
  - **`uri`** _(string, required)_
    <br>
    A URL or path to an [archive](#supported-archives), or a path to a directory. If path is relative, it must be relative to the `builder.toml`.

- **`order`** _(list, required)_
  <br>
  A list of buildpack groups. This list determines the order in which groups of buildpacks
  will be tested during detection. Detection is a phase of the [lifecycle](#lifecycle) where
  buildpacks are tested, one group at a time, for compatibility with the provided application source code. The first
  group whose non-optional buildpacks all pass detection will be the group selected for the remainder of the build. Each
  group currently contains a single required field:
  
    - **`group`** _(list, required)_
    <br>
    A set of buildpack references. Each buildpack reference specified has the following fields:
    
        - **`id`** _(string, required)_
          <br>
          The identifier of a buildpack from the configuration's top-level `buildpacks` list. Buildpacks with the same ID may
          appear in multiple groups at once but never in the same group.
        
        - **`version`** _(string, optional, default: inferred)_
          <br>
          The version of the buildpack being referred to. This field may be omitted if the top-level `buildpacks` list contains
          only one version of the buildpack.
        
        - **`optional`** _(boolean, optional, default: `false`)_
          <br>
          Whether or not this buildpack is optional during detection.
 
- **`stack`** _(required)_
  <br>
  The stack to use for the builder. See [Working with stacks](/docs/using-pack/stacks) for more information about this field. It
  contains the following fields:
  
  - **`id`** _(required, string)_
    <br>
    Identifier for the stack
  
  - **`build-image`** _(required, string)_
    <br>
    Build image for the stack
  
  - **`run-image`** _(required, string)_
    <br>
    Run image for the stack
  
  - **`run-image-mirrors`** _(optional, string list)_
    <br>
    [Run image mirrors](/docs/using-pack/stacks#run-image-mirrors) for the stack

- **`lifecycle`** _(optional)_
  <br>
  The [lifecycle](#lifecycle) to embed into the builder. It must contain **at most one** the following fields:
  
  - **`version`** _(string, optional)_
    <br>
    The version of the lifecycle (semver format) to download. If specified, `uri` must not be provided.
   
  - **`uri`** _(string, optional)_
    <br>
     A URL or path to an [archive](#supported-archives). If specified, `version` must not be provided.

    > If `version` and `uri` are both omitted, `lifecycle` defaults to the version that was last released
    > at the time of `pack`'s release. In other words, for a particular version of `pack`, this default
    > will not change despite new lifecycle versions being released.
  
#### Supported archives

Currently, when specifying a URI to a buildpack or lifecycle, only `tar` or `tgz` archive types are supported.
