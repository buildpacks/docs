+++
title="Using Inline Buildpacks"
weight=7
summary="Learn how to create an ephemeral buildpack to customize your build."
+++

You can supplement your app's build proces with custom scripts by creating an _inline buildpack_. An inline buildpack is an ephemeral buildpack that's defined in your [project descriptor][project-toml] (i.e. `project.toml`). You can include a script to run as part of the build without setting up all the files and directories that are required for a complete buildpack.

Inline buildpacks are defined as an entry in the `[[build.buildpacks]]` table of the project descriptor by inlcuding an `inline` script in the `[build.buildpacks.script]` table.

For example, you may want to run a Rake task against a Ruby app after the Ruby buildpack builds your app.

```toml
[project]
id = "io.buildpacks.my-app"

[[build.buildpacks]]
id = "example/ruby"
version = "1.0"

[[build.buildpacks]]
id = "me/rake-tasks"

  [build.buildpacks.script]
  api = "0.6"
  inline = "rake package"
```

In this example, the `me/rake-tasks` inline buildpack is configured to run after the `example/ruby` buildpack. The inline script is compatible with API version `0.4` (this is a required field), and it will execute the `rake package` command during the build step.

> **Note:** Inline buildpacks will _always_ pass detection.

Inline buildpacks aren't constrained to a single command, however. You can define complex scripts as [heredocs](https://toml.io/en/v1.0.0#string) in your project descriptor. For example, this snippet of a descriptor will source a shell script contained in the app repo, use it to modify the app directory (and thus the files that go into the final image), and create slices for the app:

```toml
[[build.buildpacks]]
id = "me/cleanup"

  [build.buildpacks.script]
  api = "0.6"
  inline = """
set -e
source scripts/utils.sh
find . -type f -name $(my_data_files) -delete
cat <<EOF > ${1}/launch.toml
[[processes]]
type = 'bash'
command = 'bin/bash'
EOF
"""
```

### Further Reading
For more about project descriptors, look at the [schema][descriptor-schema], as well as the [specification][spec].

[project-toml]: /docs/app-developer-guide/using-project-descriptor/
[descriptor-schema]: /docs/reference/project-descriptor/
[spec]: https://github.com/buildpacks/spec/blob/main/extensions/project-descriptor.md
