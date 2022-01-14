# Environment variables
# Environment variables

Environment variables are a common way to configure various buildpacks at build-time.

Below are a few ways you can do so. All of them will use our [samples][samples] repo for simplicity.

### Using CLI arguments (`--env`)

The `--env` parameter must be one of the following:

- `VARIABLE=VALUE`
- `VARIABLE`, where the value of `VARIABLE` will be taken from the local environment

##### Example:

1. Set an environment variable
```
export FOO=BAR
```{{execute}}

2. Build the app
```
pack build sample-app \
    --env "HELLO=WORLD" \
    --env "FOO" \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --buildpack samples/apps/bash-script/bash-script-buildpack/ \
    --path  samples/apps/bash-script/
```{{execute}}

3. Run the app
```
docker run sample-app
```{{execute}}

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

1. Set an environment variable
```
export FOO=BAR
```{{execute}}

2. Create an env file
```
echo -en "HELLO=WORLD\nFOO" > ./envfile
```{{execute}}

3. Build the app
```
pack build sample-app \
    --env-file ./envfile \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --buildpack samples/apps/bash-script/bash-script-buildpack/ \
    --path  samples/apps/bash-script/
```{{execute}}

4. Run the app
```
docker run sample-app
```{{execute}}

The following environment variables were set and available to buildpacks at build-time:

| Name    | Value   |  _Source_                  |
|---------|---------|----------------------------|
| `HELLO` | `WORLD` | _hard-coded value in file_ |
| `FOO`   | `BAR`   | _current environment_      |



> **NOTE:** Variables defined using `--env` take precedence over variables defined in `--env-file`.

### Using Project Descriptor
The `--descriptor` parameter must be a path to a file which follows the project.toml [schema][descriptor-schema].
Without the `--descriptor` flag, `pack build` will use the `project.toml` file in the application directory if it exists.
You can define environment variables in an `env` table in the file, and pass those into the application.

##### Example:

1. Add an environment variable to the project.toml

```
cat >> samples/apps/bash-script/project.toml <<EOL

[[build.env]]
name="HELLO"
value="WORLD"
EOL
```{{execute}}

2. Build the app
```
pack build sample-app \
    --builder cnbs/sample-builder:bionic \
    --buildpack  samples/buildpacks/hello-world/ \
    --buildpack samples/apps/bash-script/bash-script-buildpack/ \
    --path  samples/apps/bash-script/
```{{execute}}

3. Run the app
```
docker run sample-app
```{{execute}}

The following environment variables were set and available to buildpacks at build-time:

| Name    | Value   |  _Source_                  |
|---------|---------|----------------------------|
| `HELLO` | `WORLD` | _hard-coded value in file_ |


> **NOTE:** Variables defined using `--env` or `--env-file` take precedence over variables defined in the `project.toml`.

> **NOTE:** `project.toml` can't detect environment variables (so, for instance, if one ran `export FOO=BAR` and added
>`name=FOO` to the `project.toml`, it wouldn't detect any value set for `FOO`).

[descriptor-schema]: https://buildpacks.io/docs/reference/project-descriptor/
[samples]: https://github.com/buildpacks/samples