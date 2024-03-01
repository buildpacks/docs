+++
title="Create dependency layers"
weight=3
+++

Each directory created by the buildpack under the `CNB_LAYERS_DIR` can be used as a layer in the final app image or build cache.

<!--more-->

That is, each directory can be used for any of the following purposes:

| Layer Type |                                                                                                             |
|------------|-------------------------------------------------------------------------------------------------------------|
| `Launch`   | the directory will be included in the **final app image** as a single layer                                 |
| `Cache`    | the directory will be included in the **build cache** and restored to the `CNB_LAYERS_DIR` on future builds |
| `Build`    | the directory will be accessible to **buildpacks that follow** in the build (via the environment)           |

A buildpack can control how a layer will be used by creating a `<layer>.toml` with a name matching the directory it describes in the `CNB_LAYERS_DIR`.

### Example

A buildpack might create a `$CNB_LAYERS_DIR/python` directory and a `$CNB_LAYERS_DIR/python.toml` with the following contents:

```
launch = true
cache = true
build = true
```

In this example:
* the final app image will contain a layer with `python`, as this is needed to run the app
* the `$CNB_LAYERS_DIR/python` directory will be pre-created for future builds, avoiding the need to re-download this large dependency
* buildpacks that follow in the build will be able to use `python`

### Example

This is a simple `./bin/build` script for a buildpack that runs Python's `pip` package manager to resolve dependencies:

```
#!/bin/sh

PIP_LAYER="$CNB_LAYERS_DIR/pip"
mkdir -p "$PIP_LAYER/modules" "$PIP_LAYER/env"

pip install -r requirements.txt -t "$PIP_LAYER/modules" \
  --install-option="--install-scripts=$PIP_LAYER/bin" \
  --exists-action=w --disable-pip-version-check --no-cache-dir

echo "launch = true" > "$PIP_LAYER.toml"
```
