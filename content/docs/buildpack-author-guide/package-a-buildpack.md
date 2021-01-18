+++
title="Package a buildpack"
weight=5
summary="Learn how to package your buildpack for distribution using standard OCI registries."
+++

{{< param "summary" >}}

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

[package-config]: /docs/reference/package-config/
[samples]: https://github.com/buildpacks/samples
