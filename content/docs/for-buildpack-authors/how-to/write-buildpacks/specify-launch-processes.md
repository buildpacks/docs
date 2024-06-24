+++
title="Specify process types"
weight=4
+++

One of the benefits of buildpacks is that they are multi-process - an image can have multiple entrypoints for each operational mode.

<!--more-->

A `process type` is a named process definition, contributed by a buildpack at build-time and executed by the launcher at run-time.
Buildpacks declare process types during the build phase by writing entries into `<layers>/launch.toml`.

## Key Points

For each process, the buildpack:

* MUST specify a `type`, an identifier for the process, which:
  * MUST NOT be identical to other process types provided by the same buildpack.
  * MUST only contain numbers, letters, and the characters `.`, `_`, and `-`.
* MUST specify a `command` list such that:
  * The first element of `command` is a path to an executable or the file name of an executable in `$PATH`.
  * Any remaining elements of `command` are arguments that are always passed directly to the executable [^command-args].
* MAY specify an `args` list to be passed directly to the specified executable, after arguments specified in `command`.
  * The `args` list is a default list of arguments that may be overridden by the user [^command-args].
* MAY specify a `default` boolean that indicates that the process type should be selected as the [buildpack-provided default](https://github.com/buildpacks/spec/blob/main/platform.md#outputs-4) during the export phase.
* MAY specify a `working-dir` for the process. The `working-dir` defaults to the application directory if not specified.

## Implementation Steps  

Processes are added to the `launch.toml` file in the `<layers>/<layer>` directory as follows:

```toml
[[processes]]
type = "<process type>"
command = ["<command>"]
args = ["<arguments>"]
default = false
working-dir = "<working directory>"
```

### Examples

Let's see how this works. We will specify a process type that allows a debugger to attach to our application.

To enable running the debug process, we'll need to have our buildpack define a "process type" for the worker.
We'll need to create a `launch.toml` file in the buildpack layers directory:

```bash
# ...

cat > "${CNB_LAYERS_DIR}/launch.toml" << EOL
# our web process
[[processes]]
type = "web"
command = ["node", "app.js"]
default = true

# our debug process
[[processes]]
type = "debug"
command = ["node", "--inspect", "app.js"]
EOL

# ...
```

After building the application, you should then be able to run your new NodeJS debug process:

```bash
docker run --rm --entrypoint debug test-node-js-app
```

and see the debug log output:

```text
Debugger listening on ws://127.0.0.1:9229/
```
