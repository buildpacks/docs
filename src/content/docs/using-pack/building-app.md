+++
title="Building app images using `build`"
weight=301
creatordisplayname = "Andrew Meyer"
creatoremail = "ameyer@pivotal.io"
lastmodifierdisplayname = "Max Prettyjohns"
lastmodifieremail = "heshoots9999@gmail.com"
+++

`pack build` enables app developers to create runnable app images from source code using buildpacks.

```bash
$ pack build <image-name>
```

### Example: Building using the default builder image

In the following example, an app image is created from Node.js application source code.

```bash
$ cd path/to/node/app
$ pack build my-app:my-tag
```

In this case, the default [builder](/docs/using-pack/working-with-builders) (essentially, an image containing
buildpacks) is used, and an appropriate buildpack is automatically selected from the builder based on the app source code.

> You can change the default builder using the `set-default-builder` command.
>
> Alternately, you can ignore the default and use a specific builder with the `build` command's `--builder` flag.

To publish the produced image to an image registry, include the `--publish` flag:

```bash
$ pack build registry.example.com/my-app:my-tag --publish
```

### Example: Building using a specified buildpack

In the following example, an app image is created from Node.js application source code, using a buildpack chosen by the
user.

```bash
$ cd path/to/node/app
$ pack build my-app:my-tag --buildpack path/to/some/buildpack
```

The `--buildpack` parameter can be

- a path to a directory, or
- the ID of a buildpack located in a builder

> Multiple buildpacks can be specified, in order, by:
>
> - supplying `--buildpack` multiple times, or
> - supplying a comma-separated list to `--buildpack` (without spaces)

### Example: Building using environment variables

In the following example, an app image is created which uses an environment variable during the build.
```bash
$ cd path/to/java/app
$ pack build my-app:my-tag --env="MAVEN_OPTS=-dskipTests"--buildpack=path/to/java-buildpack
```

Environment variables can be passed with `--env` or `--env-file`.

`--env` uses the format `NAME=value`.

`--env-file` provides the path to a file containing environment variables in the following format:
```sh
NAME=value
OTHER_NAME=value2
```
> Multiple environment variables can be specified, by supplying `--env` or `--env-file` multiple times.

When creating a buildpack which consumes environment variables, they are not immediately available to the builder. The environment variables are stored as files in the platform directory (the second argument to the build script) under the `env` directory. The file name is the name of the environment variable, its content is the value of the variable.

The java buildpack access all user environment variables with the following script.

```bash
env_dir="$2/env"
...
# Load user-provided build-time environment variables
if compgen -G "$env_dir/*" > /dev/null; then
  for var in "$env_dir"/*; do
    declare "$(basename "$var")=$(<"$var")"
  done
fi
```

This checks that the environment directory contains variables, then for each variable in the directory, declares them in the current scope.

### Building explained

![build diagram](/docs/using-pack/build.svg)

To create an app image, `build` executes one or more buildpacks against the app's source code.
Each buildpack inspects the source code and provides relevant dependencies. An image is then generated
from the app's source code and these dependencies.

Buildpacks are compatible with one or more [stacks](/docs/using-pack/managing-stacks). A stack designates a **build image**
and a **run image**. During the build process, a stack's build image becomes the environment in which buildpacks are
executed, and its run image becomes the base for the final app image. For more information on working with stacks, see
the [Managing stacks](/docs/using-pack/managing-stacks) section.

Buildpacks can be bundled together with a specific stack's build image, resulting in a
[builder](/docs/using-pack/working-with-builders) image (note the "er" ending). Builders provide the most
convenient way to distribute buildpacks for a given stack. For more information on working with builders, see the
[Working with builders using `create-builder`](/docs/using-pack/working-with-builders) section.
