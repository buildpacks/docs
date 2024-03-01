+++
title="Create dependency layers"
weight=99
+++

Each directory created by the buildpack under the `CNB_LAYERS_DIR` can be used as a layer in the final image or build cache.

<!--more-->

That is, each directory can be used for any of the following purposes:

* Launch - the directory will be included in the run image as a single layer
* Cache - the directory will be included in the cache and restored on future builds
* Build - the directory will be accessible by subsequent buildpacks

A buildpack defines how a layer will by used by creating a `<layer>.toml`
with a name matching the directory it describes in the `CNB_LAYERS_DIR`.

For example, a buildpack might create a `$CNB_LAYERS_DIR/python` directory
and a `$CNB_LAYERS_DIR/python.toml` with the following contents:

```
launch = true
cache = true
build = true
```

In this example, the `python` directory will be included in the run image,
cached for future builds, and will be accessible to subsequent buildpacks via the environment.

### Example

This is a simple example of a buildpack that runs Python's `pip` package manager
to resolve dependencies:

```
#!/bin/sh

PIP_LAYER="$CNB_LAYERS_DIR/pip"
mkdir -p "$PIP_LAYER/modules" "$PIP_LAYER/env"

pip install -r requirements.txt -t "$PIP_LAYER/modules" \
  --install-option="--install-scripts=$PIP_LAYER/bin" \
  --exists-action=w --disable-pip-version-check --no-cache-dir

echo "launch = true" > "$PIP_LAYER.toml"
```
