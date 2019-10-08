+++
title="Environment variables"
weight=1
summary="Environment variables are a common way to configure various buildpacks at build-time."
+++

Environment variables are a common way to configure various buildpacks at build-time.

Here are a few ways you can do so.

### Using CLI arguments (`--env`)

The `--env` parameter must be one of the following:

- `VARIABLE=VALUE`
- `VARIABLE`, where the value of `VARIABLE` will be taken from the local environment

##### Example:

For this example we will use our [samples][samples] repo for simplicity.

```bash
# clone the repo
git clone https://github.com/buildpack/samples

# set an environment variable
export FOO=BAR

# build the app
pack build sample-app \
    --env "HELLO=WORLD" \
    --env "FOO" \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --path  samples/apps/java-maven/
```

The following environment variables were set and available to buildpacks at build-time:

| Name    | Value   |  _Source_                  |
|---------|---------|----------------------------|
| `HELLO` | `WORLD` | _hard-coded inline value_  |
| `FOO`   | `BAR`   | _current environment_      |


### Using files (`--env-file`)

The `--env-file` parameter must be a path to a file where each line is one of the following:

- `VARIABLE=VALUE`
- `VARIABLE`, where the value of `VARIABLE` will be taken from the current environment

##### Example:

For this example we will use our [samples][samples] repo for simplicity.

```bash
# clone the repo
git clone https://github.com/buildpack/samples

# set an environment variable
export FOO=BAR

# create an env file
echo -n "HELLO=WORLD\nFOO" > ./envfile

# build the app
pack build sample-app \
    --env-file ./envfile \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --path  samples/apps/java-maven/
```

The following environment variables were set and available to buildpacks at build-time:

| Name    | Value   |  _Source_                  |
|---------|---------|----------------------------|
| `HELLO` | `WORLD` | _hard-coded value in file_ |
| `FOO`   | `BAR`   | _current environment_      |

<p class="spacer"></p>

> **NOTE:** Variables defined using `--env` take precedence over variables defined in `--env-file`.

[samples]: https://github.com/buildpack/samples