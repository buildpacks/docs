
+++
title="Building your application"
aliases=[
  "/docs/buildpack-author-guide/create-buildpack/build-app"
]
weight=4
+++

<!-- test:suite=create-buildpack;weight=4 -->

Now we'll change the build step you created to install application dependencies. This will require updates to the `build` script such that it performs the following steps:

1. Create a layer for the NodeJS runtime
1. Download the NodeJS runtime and installs it to the layer

By doing this, you'll learn how to create arbitrary layers with your buildpack, and how to read the contents of the app in order to perform actions like downloading dependencies.

Let's begin by changing the `node-js-buildpack/bin/build`<!--+"{{open}}"+--> so that it creates a layer for NodeJS.

### Creating a Layer

A Buildpack layer is represented by a directory inside the [layers directory][layers-dir] provided to our buildpack by the Buildpack execution environment.  As defined by the buildpack specification, the layers directory is always passed to the `build` script as the first positional parameter. To create a new layer directory representing the NodeJS runtime, change the `build` script to look like the following.  The variable `CNB_LAYERS_DIR` is provided to the build script as defined by the [buildpacks specification](https://github.com/buildpacks/spec/blob/main/buildpack.md#positional-arguments-to-detect-and-build-executables).

<!-- file=node-js-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

node_js_layer="${CNB_LAYERS_DIR}"/node-js
mkdir -p "${node_js_layer}"
```

The `node_js_layer` directory is a sub-directory of the directory provided as the first positional argument to the build script (the [layers directory][layers-dir]), and this is where we'll store the NodeJS runtime.

Next, we'll download the NodeJS runtime and install it into the layer directory. Add the following code to the end of the `build` script:

<!-- file=node-js-buildpack/bin/build data-target=append -->
```bash
echo "---> Downloading and extracting NodeJS"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "${node_js_url}" | tar -xJf - --strip-components 1 -C "${node_js_layer}"
```

This code uses the `wget` tool to download the NodeJS binaries from the given URL, and extracts it to the `node_js_layer` directory.  We use `tar` to extract the NodeJS distribution into the `node_js_layer`.  During the extraction we remove the top level directory (i.e. `--strip-components 1`).  This means that we will end up with `${node_js_layer}/bin` and `${node_js_layer}/lib`.  When starting the container the layers `bin` will automatically be added to the runtime `${PATH}`.

The last step in creating a layer is writing a TOML file that contains metadata about the layer. The TOML file's name must match the name of the layer (in this example it's `node-js.toml`). Without this file, the Buildpack lifecycle will ignore the layer directory. For the NodeJS layer, we need to ensure it is available in the launch image by setting the `launch` key to `true`. Add the following code to the build script:

<!-- file=node-js-buildpack/bin/build data-target=append -->
```bash
echo -e '[types]\nlaunch = true' > "${CNB_LAYERS_DIR}/node-js.toml"
```

Now the Buildpack is ready to test.

### Running the Build

Your complete `node-js-buildpack/bin/build`<!--+"{{open}}"+--> script should look like this:

<!-- test:file=node-js-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

# 1. CREATE THE LAYER DIRECTORY
node_js_layer="${CNB_LAYERS_DIR}"/node-js
mkdir -p "${node_js_layer}"

# 2. DOWNLOAD node-js
echo "---> Downloading and extracting NodeJS"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "${node_js_url}" | tar -xJf - --strip-components 1 -C "${node_js_layer}"

# 3. MAKE node-js AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "${CNB_LAYERS_DIR}/node-js.toml"
```

Build your app again:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

You will see the following output:

```
===> DETECTING
...
===> RESTORING
===> BUILDING
[builder] ---> NodeJS Buildpack
[builder] ---> Downloading and extracting NodeJS
...
===> EXPORTING
...
Successfully built image 'test-node-js-app'
```

A new image named `test-node-js-app` was created in your Docker daemon with a layer containing the NodeJS runtime. However, your app image is not yet runnable. We'll make the app image runnable in the next section.

<!--+if false+-->
---

<a href="/docs/for-buildpack-authors/tutorials/basic-buildpack/05_make-app-runnable" class="button bg-pink">Next Step</a>
<!--+end+-->

[layers-dir]: /docs/for-buildpack-authors/how-to/write-buildpacks/create-layer
