+++
title="Specify process types"
weight=1
+++

One of the benefits of buildpacks is that they are multi-process - an image can have multiple entrypoints for each operational mode.

<!--more-->

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
