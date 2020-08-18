+++
title="Environment variables"
weight=1
summary="Environment variables are a common way to configure various buildpacks at build-time."
+++

Environment variables are a common way to configure various buildpacks at build-time.

Below are a few ways you can do so. All of them will use our [samples][samples] repo for simplicity.

### Using CLI arguments (`--env`)

The `--env` parameter must be one of the following:

- `VARIABLE=VALUE`
- `VARIABLE`, where the value of `VARIABLE` will be taken from the local environment

##### Example:
```bash
# clone the repo
git clone https://github.com/buildpacks/samples

# set an environment variable
export FOO=BAR

# build the app
pack build sample-app \
    --env "HELLO=WORLD" \
    --env "FOO" \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --buildpack samples/apps/bash-script/bash-script-buildpack/ \
    --path  samples/apps/bash-script/

# run the app
docker run sample-app
```

The following environment variables were set and available to buildpacks at build-time:

| Name    | Value   |  _Source_                  |
|---------|---------|----------------------------|
| `HELLO` | `WORLD` | _hard-coded inline value_  |
| `FOO`   | `BAR`   | _current environment_      |


### Using env files (`--env-file`)

The `--env-file` parameter must be a path to a file where each line is one of the following:

- `VARIABLE=VALUE`
- `VARIABLE`, where the value of `VARIABLE` will be taken from the current environment

##### Example:
```bash
# clone the repo
git clone https://github.com/buildpacks/samples

# set an environment variable
export FOO=BAR

# create an env file
echo -en "HELLO=WORLD\nFOO" > ./envfile

# build the app
pack build sample-app \
    --env-file ./envfile \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --buildpack samples/apps/bash-script/bash-script-buildpack/ \
    --path  samples/apps/bash-script/

# run the app
docker run sample-app
```

The following environment variables were set and available to buildpacks at build-time:

| Name    | Value   |  _Source_                  |
|---------|---------|----------------------------|
| `HELLO` | `WORLD` | _hard-coded value in file_ |
| `FOO`   | `BAR`   | _current environment_      |

<p class="spacer"></p>

> **NOTE:** Variables defined using `--env` take precedence over variables defined in `--env-file`.

### Using Project Descriptor (`project.toml`, or `--descriptor`)
The `--descriptor` parameter must be a path to a file which follows the project.toml [schema][descriptor-schema].
You can define environment variables in an `env` table in the file, and pass those into the application.

##### Example:
```bash
# clone the repo
git clone https://github.com/buildpacks/samples

# Add an environment variable to the project.toml
printf "[[build.env]]\nname='HELLO'\nvalue='WORLD'" >> samples/apps/bash-script/project.toml

# build the app
pack build sample-app \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --buildpack samples/apps/bash-script/bash-script-buildpack/ \
    --path  samples/apps/bash-script/

# run the app
docker run sample-app
```

The following environment variables were set and available to buildpacks at build-time:

| Name    | Value   |  _Source_                  |
|---------|---------|----------------------------|
| `HELLO` | `WORLD` | _hard-coded value in file_ |

<p class="spacer"></p>

> **NOTE:** Variables defined using `--env` or `--env-file` take precedence over variables defined in the `project.toml`.

> **NOTE:** `project.toml` can't detect environment variables (so, for instance, if one ran `export FOO=BAR` and added
>`name=FOO` to the `project.toml`, it wouldn't detect any value set for `FOO`).

[descriptor-schema]: /docs/reference/project-descriptor/
[samples]: https://github.com/buildpacks/samples
