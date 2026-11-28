
+++
title="Package a buildpack or extension"
aliases=[
  "/docs/buildpack-author-guide/package-a-buildpack"
]
weight=4
summary="Learn how to package your buildpack or extension for distribution."
+++

### 0. Grab the sample repo

Before we start, let's pull down a few buildpacks from our [samples][samples] repo.

```bash
# clone the repo
git clone https://github.com/buildpacks/samples
```

### 1. Create a `package.toml`

We will need to create a `package.toml` file in order to tell `pack` where to find the dependencies of the buildpack
being packaged.

```shell script
touch package.toml
```

### 2. Specify your buildpack

Let's start off by specifying the location of the buildpack we are packaging. In this example, we're packaging
the `hello-universe`.

`package.toml`:
```toml
[buildpack]
uri = "samples/buildpacks/hello-universe/"
```

### 3. Specify your dependent buildpacks

Next, by looking at the `[[order]]` of the `hello-universe`, we know that it depends on the `hello-world` and `hello-moon`
buildpacks. We will need to declare the location of those dependencies as well.

`package.toml`:
```toml
[buildpack]
uri = "samples/buildpacks/hello-universe/"

[[dependencies]]
uri = "samples/buildpacks/hello-moon"

[[dependencies]]
uri = "docker://cnbs/sample-package:hello-world"
```

> For more information about the configuration, see [package.toml][package-config] config.

### 4. Package your buildpack as an image

Lastly, we'll run the `buildpack package` command to package the buildpack as an OCI image.

```shell script
pack buildpack package my-buildpack --config ./package.toml
```

> **TIP:** You can verify that the image was created by running `docker images`.

That's it! Your buildpack is now packaged for distribution.

You may now use standard `docker push` to host your buildpack on any OCI registry of your choosing.

Alternatively, you can run `pack buildpack package` with `--publish` to publish it directly to the registry.

### 5. Package your buildpack as a file

You can also run `buildpack package` with a `--format file` flag to save the packaged buildpack as a local file.

```shell script
pack buildpack package my-buildpack.cnb --config ./package.toml --format file
```

You can then use this file (called a `.cnb` file) as an input to `buildpack package`, among other commands.

### 6. Package a multi-platform buildpack

A buildpack can be packaged for more than one platform (for example `linux/amd64` and `linux/arm64`).
When you publish a multi-platform buildpack, `pack` creates one image per platform and an
[image index](https://github.com/opencontainers/image-spec/blob/main/image-index.md) that references them all, so
consumers of the buildpack get the image that matches their platform.

#### Declare the supported platforms

The platforms to package for can be declared in the `[[targets]]` list of the `buildpack.toml`
(or of the `package.toml`, when packaging a composite buildpack):

`buildpack.toml`:
```toml
[[targets]]
os = "linux"
arch = "amd64"

[[targets]]
os = "linux"
arch = "arm64"
```

You can also provide the platforms with the `--target` flag, which overrides the `[[targets]]` in the configuration files:

```shell script
pack buildpack package my-buildpack --config ./package.toml --publish \
  --target linux/amd64 --target linux/arm64
```

> **NOTE:** Multiple targets are only allowed when the buildpack is not exported to the local Docker daemon, because the daemon
> can only hold an image for a single platform. Use `--publish` (or `--format file`) when specifying more than one target.

For the full list of options of a target, such as `variant` and `distros`, see the [`buildpack.toml`][buildpack-config] reference.

#### Platform-specific binaries

If the buildpack ships different binaries for each platform, place them in a directory named after the target, using the
`[os]/[arch]/[variant]` format (for example `linux/amd64` and `linux/arm64`), at the root of the buildpack:

```
my-buildpack
├── buildpack.toml
├── linux
│   ├── amd64
│   │   └── bin
│   │       ├── build
│   │       └── detect
│   └── arm64
│       └── bin
│           ├── build
│           └── detect
```

When packaging for a target, `pack` uses the matching directory as the root of the buildpack for that platform and copies the
`buildpack.toml` into it. If no directory matches the target, the root of the buildpack is used.

#### Publish the buildpack

Multi-platform buildpacks must be published to a registry, so that the image index can be created:

```shell script
pack buildpack package registry.example.com/my-org/my-buildpack:latest --config ./package.toml --publish
```

If your registry doesn't allow overwriting existing tags, add `--append-image-name-suffix` to push each platform-specific image using
an `[os]-[arch]` suffix in the tag (for example, `my-buildpack:latest-linux-amd64`) before the image index is created.

#### Limitations

- When packaging a composite buildpack for multiple platforms, every entry in `[[dependencies]]` must be a buildpack that is already
  published to a registry and referenced with `docker://<image>`; local paths and archives (`uri = "samples/buildpacks/hello-moon"`)
  are not allowed.
- Each dependency must itself provide an image for every platform you are packaging for.
- When using `--format file` with more than one target, current releases of `pack` create a separate `.cnb` file per platform instead of a single file, adding an `[os]-[arch]` suffix to the file name (for example, `my-buildpack-linux-arm64.cnb`).

[buildpack-config]: /docs/reference/config/buildpack-config/
[package-config]: /docs/reference/package-config/
[samples]: https://github.com/buildpacks/samples
