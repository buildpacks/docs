# Specify launch process
# Specify launch process

Learn how to specify the launch process for an app.


### Build a multi-process app

For this example we will use the `hello-processes` buildpack from our [samples][samples] repo so make sure you have it cloned locally.

Let's build the app.
```
pack build multi-process-app \
    --builder cnbs/sample-builder:alpine \
    --buildpack samples/java-maven \
    --buildpack samples/buildpacks/hello-processes/ \
    --path samples/apps/java-maven/
```{{execute}}

If you inspect the app image with `pack`, you will see multiple process types defined:

```
pack inspect-image multi-process-app
```{{execute}}

The output should look similar to the below:

```
Inspecting image: multi-process-app

REMOTE:
(not present)

LOCAL:

Stack: io.buildpacks.samples.stacks.alpine

Base Image:
  Reference: f5898fb2b30c2b66f5a69a424bae6473259fa48b387df35335f04332af7f1091
  Top Layer: sha256:700c764e7c5d5c75e6a0fc7d272b7e1c70ab327c03fbdf4abd9313e5ec3217f7

Run Images:
  cnbs/sample-stack-run:alpine

Buildpacks:
  ID                             VERSION           HOMEPAGE
  samples/java-maven             0.0.1             https://github.com/buildpacks/samples/tree/main/buildpacks/java-maven
  samples/hello-processes        0.0.1             https://github.com/buildpacks/samples/tree/main/buildpacks/hello-process

Processes:
  TYPE                 SHELL        COMMAND                                                     ARGS
  web (default)        bash         java -jar target/sample-0.0.1-SNAPSHOT.jar
  sys-info             bash         /layers/samples_hello-processes/sys-info/sys-info.sh
```

Notice that the default process type is `web`. This is because `pack` will always attempt to set the default process type to `web` unless the `--default-process` flag is passed.
If we had run the `pack build` command above with `--default-process sys-info`, `sys-info` would be the default process for the app image!

### Run a multi-process app

Buildpacks are designed to give you much flexibility in how you run your app. The lifecycle includes a binary called the `launcher` which is present in the final app image and is responsible for starting your app.
By default, the `launcher` will start processes with `bash` (these are referred to as `non-direct` processes). Processes that are started without `bash` are referred to as `direct` processes.
The `launcher` will source any profile scripts (for `non-direct` processes) and set buildpack-provided environment variables in the app's execution environment before starting the app process.

#### Default process type

If you would like to run the default process, you can simply run the app image without any additional arguments:

```
docker run --rm -p 8080:8080 multi-process-app
```{{execute}}

#### Default process type with additional arguments

If you would like to pass additional arguments to the default process, you can run the app image with the arguments specified in the command:

```
docker run --rm -p 8080:8080 multi-process-app --spring.profiles.active=mysql
```{{execute interrupt}}

#### Non-default process-type

To run a non-default process type, set the process type as the entrypoint for the run container:

```
docker run --rm --entrypoint sys-info multi-process-app
```{{execute interrupt}}

#### Non-default process-type with additional arguments

You can pass additional arguments to a non-default process type:

```
docker run --rm --entrypoint sys-info multi-process-app --spring.profiles.active=mysql
```{{execute interrupt}}

#### User-provided shell process

You can even override the buildpack-defined process types:

```
docker run --rm --entrypoint launcher -it multi-process-app bash
```{{execute interrupt}}

Now let's exit this shell and run an alternative entrypoint - 
```
exit
```{{execute interrupt}}
```
docker run --rm --entrypoint launcher -it multi-process-app echo hello "$WORLD" # $WORLD is evaluated on the host machine
```{{execute interrupt}}
```
docker run --rm --entrypoint launcher -it multi-process-app echo hello '$WORLD' # $WORLD is evaluated in the container after profile scripts are sourced
```{{execute interrupt}}

#### User-provided shell process with bash script

An entire script may be provided as a single argument:

```
docker run --rm --entrypoint launcher -it multi-process-app 'for opt in $JAVA_OPTS; do echo $opt; done'
```{{execute interrupt}}

#### User-provided direct process

By passing `--` before the command, we instruct the `launcher` to start the provided process without `bash`.
Note that while buildpack-provided environment variables will be set in the execution environment, no profile scripts will be sourced (as these require `bash`):

```
docker run --rm --entrypoint launcher multi-process-app -- env # output will include buildpack-provided env vars
docker run --rm --entrypoint launcher multi-process-app -- echo hello "$WORLD" # $WORLD is evaluated on the host machine
docker run --rm --entrypoint launcher multi-process-app -- echo hello '$WORLD' # $WORLD is not evaluated, output will include string literal `$WORLD`
```

#### No launcher

You can bypass the launcher entirely by setting a new entrypoint for the run container:

```
docker run --rm --entrypoint bash -it multi-process-app # profile scripts have NOT been sourced and buildpack-provided env vars are NOT set in this shell
```{{execute interrupt}}

To learn more about the launcher, see the [platform spec](https://github.com/buildpacks/spec/blob/main/platform.md#launcher).

[samples]: https://github.com/buildpacks/samples