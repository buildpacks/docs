+++

title="Working with builders"
weight=3
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"

+++
## Working with builders using `create-builder`

`pack create-builder` enables buildpack authors and platform operators to bundle a collection of buildpacks into a
single image for distribution and use with a specified stack.

```bash
$ pack create-builder <image-name> --builder-config <path-to-builder-toml>
```

### Example: Creating a builder from buildpacks

In this example, a builder image is created from buildpacks `org.example.buildpack-1` and `org.example.buildpack-2`.
A `builder.toml` file provides necessary configuration to the command.

```toml
[[buildpacks]]
  id = "org.example.buildpack-1"
  uri = "relative/path/to/buildpack-1" # URIs without schemes are read as paths relative to builder.toml

[[buildpacks]]
  id = "org.example.buildpack-2"
  uri = "https://example.org/buildpacks/buildpack-2.tgz"

[[groups]]
  [[groups.buildpacks]]
    id = "org.example.buildpack-1"
    version = "0.0.1"
  
  [[groups.buildpacks]]
    id = "org.example.buildpack-2"
    version = "0.0.1"
```

Running `create-builder` while supplying this configuration file will produce the builder image.

```bash
$ pack create-builder my-builder:my-tag --builder-config path/to/builder.toml

2018/10/29 15:35:47 Pulling builder base image packs/build
2018/10/29 15:36:06 Successfully created builder image: my-builder:my-tag
```

Like [`build`](#building-app-images-using-build), `create-builder` has a `--publish` flag that can be used to publish
the generated builder image to a registry.

> The above example uses the default stack, whose build image is `packs/build`.
> The `--stack` parameter can be used to specify a different stack (currently, the only built-in stack is
> `io.buildpacks.stacks.bionic`). For more information about managing stacks and their associations with build and run
> images, see the [Managing stacks](#managing-stacks) section.

The builder can then be used in `build` by running:

```bash
$ pack build my-app:my-tag --builder my-builder:my-tag --buildpack org.example.buildpack-1
```

### Builders explained

![create-builder diagram](/docs/using-pack/create-builder.svg)

A builder is an image containing a collection of buildpacks that will be executed, in the order that they appear in
`builder.toml`, against app source code. A buildpack's primary role is to inspect the source code, determine any
dependencies that will be required to compile and/or run the app, and provide those dependencies as layers in the
resulting image. This image's base will be the build image associated with a given stack.

It's important to note that the buildpacks in a builder are not actually executed until
[`build`](#building-explained) is run.
