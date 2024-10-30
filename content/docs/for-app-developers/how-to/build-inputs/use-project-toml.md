
+++
title="Use project.toml"
aliases=[
  "/docs/app-developer-guide/using-project-descriptor"
]
weight=4
summary="Simplify your `pack` configuration."
+++

A `project descriptor` (alternatively referred to as a `project.toml` file) allows users to detail configuration for a
repository. Users can, for instance, specify which buildpacks should be used when building the repository, what files
should be included/excluded in the build, and [set environment variables at build time][descriptor-envs].

### Example
We will use our [samples][samples] repo to demonstrate how to use a `project.toml` file.

In the below example (`samples/apps/bash-script/project.toml`), we define project information (in this case, the `id`
and human-readable `name` of the application we are building, and a `version`), and specify build information to pack.


Note the `include` and `exclude` sections in the below `project.toml` file use `gitignore` syntax. So `"/README.md"` excludes the `README`
file at the root of the application. For more on `gitignore` matching see [these docs](https://linuxize.com/post/gitignore-ignoring-files-in-git/#literal-file-names).

```toml
[_]
schema-version = "0.2"
id = "io.buildpacks.bash-script"
name = "Bash Script"
version = "1.0.0"

[io.buildpacks]
exclude = [
    "/README.md",
    "bash-script-buildpack"
]

include = []

[[io.buildpacks.group]]
uri = "bash-script-buildpack/"
```

To use a `project.toml` file, simply:
```shell script
# build the app
pack build sample-app \
    --builder cnbs/sample-builder:noble \
    --path  samples/apps/bash-script/

# run the app
docker run sample-app
```

If the descriptor is named `project.toml`, it will be read by `pack` automatically. Otherwise, you can run:
```shell script
pack build sample-app \
    --builder cnbs/sample-builder:noble \
    --path  samples/apps/bash-script/ \
    --descriptor  samples/apps/bash-script/<project-descriptor-file.toml>
```
to specify an alternatively named `project descriptor`.

### Specify Buildpacks and Envs
As with other methods of [specifying buildpacks][specify-buildpacks], the only ones used are those that are specifically
requested. Therefore, if we'd want to include another buildpack in our build (like a `hello-world` buildpack, to help us
understand the environment), we would want to add it to our `project.toml`.

> **Note:** Flags passed directly into `pack` have precedence over anything in the `project.toml`. Therefore, if we wanted
> to use different buildpacks in the above case, we could also call `pack build ... --buildpack ...`

Below is an expanded `project.toml`, with an additional buildpack and environment variable included.

```toml
[_]
schema-version = "0.2"
id = "io.buildpacks.bash-script"
name = "Bash Script"
version = "1.0.0"

[io.buildpacks]
exclude = [
    "README.md",
    "bash-script-buildpack"
]
[[io.buildpacks.group]]
uri = "../../buildpacks/hello-world/"


[[io.buildpacks.group]]
uri = "bash-script-buildpack/"

[[io.buildpacks.build.env]]
name='HELLO'
value='WORLD'
```

Paste the above `toml` as `new-project.toml` in the `samples/apps/bash-script/` directory, and simply:
```shell script
# build the app
pack build sample-app \
    --builder cnbs/sample-builder:noble \
    --path  samples/apps/bash-script/ \
    --descriptor samples/apps/bash-script/new-project.toml

# run the app
docker run sample-app
```

### Specify Builder
The builder can also be [specified](https://github.com/buildpacks/spec/blob/main/extensions/project-descriptor.md#iobuildpacksbuilder-optional) in `project.toml`.

```toml
[io.buildpacks]
builder = "cnbs/sample-builder:noble"
```

```shell script
# then the pack command does not require builder to be set
pack build sample-app \
    --path  samples/apps/bash-script/
```


### Further Reading
For more about project descriptors, look at the [schema][descriptor-schema], as well as the [specification][spec].

[specify-buildpacks]: /docs/for-app-developers/how-to/build-inputs/specify-buildpacks
[descriptor-envs]: /docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/#using-project-descriptor
[descriptor-schema]: /docs/reference/project-descriptor/
[samples]: https://github.com/buildpacks/samples
[spec]: https://github.com/buildpacks/spec/blob/main/extensions/project-descriptor.md
