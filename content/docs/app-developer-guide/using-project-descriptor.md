+++
title="Using project.toml"
weight=6
summary="Learn how to use a project.toml file to simplify configuring pack."
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
[project]
id = "io.buildpacks.bash-script"
name = "Bash Script"
version = "1.0.0"

[build]
exclude = [
    "/README.md",
    "bash-script-buildpack"
]

include = []

[[build.buildpacks]]
uri = "bash-script-buildpack/"
```

To use a `project.toml` file, simply:
```shell script
# build the app
pack build sample-app \
    --builder cnbs/sample-builder:bionic \
    --path  samples/apps/bash-script/

# run the app
docker run sample-app
```

If the descriptor is named `project.toml`, it will be read by `pack` automatically. Otherwise, you can run:
```shell script
pack build sample-app \
    --builder cnbs/sample-builder:bionic \
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
[project]
id = "io.buildpacks.bash-script"
name = "Bash Script"
version = "1.0.0"

[build]
exclude = [
    "README.md",
    "bash-script-buildpack"
]
[[build.buildpacks]]
uri = "../../buildpacks/hello-world/"


[[build.buildpacks]]
uri = "bash-script-buildpack/"

[[build.env]]
name='HELLO'
value='WORLD'
```

Paste the above `toml` as `new-project.toml` in the `samples/apps/bash-script/` directory, and simply:
```shell script
# build the app
pack build sample-app \
    --builder cnbs/sample-builder:bionic \
    --path  samples/apps/bash-script/ \
    --descriptor samples/apps/bash-script/new-project.toml

# run the app
docker run sample-app
```

### Further Reading
For more about project descriptors, look at the [schema][descriptor-schema], as well as the [specification][spec].

[specify-buildpacks]: /docs/app-developer-guide/specify-buildpacks/
[descriptor-envs]: /docs/app-developer-guide/environment-variables/#using-project-descriptor
[descriptor-schema]: /docs/reference/project-descriptor/
[samples]: https://github.com/buildpacks/samples
[spec]: https://github.com/buildpacks/spec/blob/main/extensions/project-descriptor.md
