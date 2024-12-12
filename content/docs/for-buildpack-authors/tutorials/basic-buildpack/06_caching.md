
+++
title="Improving performance with caching"
aliases=[
  "/docs/buildpack-author-guide/create-buildpack/caching"
]
weight=6
+++

<!-- test:suite=create-buildpack;weight=7 -->

We can improve performance by caching the runtime between builds, only re-downloading when necessary. To begin, let's cache the runtime layer.

## Cache the runtime layer

To do this, replace the following lines in the `build` script:

```bash
# 3. MAKE node-js AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "${CNB_LAYERS_DIR}/node-js.toml"
```

with the following:

```bash
# 3. MAKE node-js AVAILABLE DURING LAUNCH and CACHE it
echo -e '[types]\ncache = true\nlaunch = true' > "${CNB_LAYERS_DIR}/node-js.toml"
```

Your full `node-js-buildpack/bin/build`<!--+"{{open}}"+--> script should now look like the following:

<!-- test:file=node-js-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

# 1. CREATE THE LAYER DIRECTORY
node_js_layer="${CNB_LAYERS_DIR}"/node-js
mkdir -p "${node_js_layer}"

# 2. DOWNLOAD NodeJS
echo "---> Downloading and extracting NodeJS"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "$node_js_url" | tar -xJf - --strip-components 1 -C "${node_js_layer}"

# 3. MAKE NodeJS AVAILABLE DURING LAUNCH and CACHE the LAYER
# ========== MODIFIED ===========
 cat > "${CNB_LAYERS_DIR}/node-js.toml" << EOL
[types]
cache = true
launch = true
EOL

# 4. SET DEFAULT START COMMAND
cat > "${CNB_LAYERS_DIR}/launch.toml" << EOL
# our web process
[[processes]]
type = "web"
command = ["node", "app.js"]
default = true
EOL
```

Now when we build the image twice we should see the `node-js` layer is reused on the second build:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

You will see something similar to the following during the `EXPORTING` phase:

<!-- test:assert=contains -->
```text
Reusing layer 'examples/node-js:node-js'
```

## Caching dependencies

Now, let's implement the caching logic.  We need to record the version of the NodeJS runtime that is used in a build.  On subsequent builds, the caching logic will detect if the NodeJS version is the same as the version in the cached layer.  We restore the previous layer from the cache if the current requested NodeJS version matches the previous NodeJS runtime version.

<!-- test:file=node-js-buildpack/bin/build -->
```
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

# 1. CREATE THE LAYER DIRECTORY
node_js_layer="${CNB_LAYERS_DIR}"/node-js
mkdir -p "${node_js_layer}"

# ======= MODIFIED =======
# 2. DOWNLOAD node-js
node_js_version="18.18.1"
node_js_url=https://nodejs.org/dist/v${node_js_version}/node-v${node_js_version}-linux-x64.tar.xz
cached_nodejs_version=$(cat "${CNB_LAYERS_DIR}/node-js.toml" 2> /dev/null | yj -t | jq -r .metadata.nodejs_version 2>/dev/null || echo 'NOT FOUND')
if [[ "${node_js_url}" != *"${cached_nodejs_version}"* ]] ; then
    echo "-----> Downloading and extracting NodeJS"
    wget -q -O - "${node_js_url}" | tar -xJf - --strip-components 1 -C "${node_js_layer}"
else
    echo "-----> Reusing NodeJS"
fi

# ======= MODIFIED =======
# 3. MAKE node-js AVAILABLE DURING LAUNCH and CACHE the LAYER
    cat > "${CNB_LAYERS_DIR}/node-js.toml" << EOL
[types]
cache = true
launch = true
[metadata]
nodejs_version = "${node_js_version}"
EOL

# 4. SET DEFAULT START COMMAND
cat >> "${CNB_LAYERS_DIR}/launch.toml" << EOL
[[processes]]
type = "web"
command = ["node", "app.js"]
default = true
EOL
```

Now when you build your app, the second call will reuse the layer:

<!-- test:exec -->
```text
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

you will see the new caching logic at work during the `BUILDING` phase:

<!-- test:assert=contains;ignore-lines=... -->
```text
===> BUILDING
...
[builder] ---> NodeJS Buildpack
[builder] -----> Reusing NodeJS
```

Next, let's see how buildpack users may be able to provide configuration to the buildpack.

<!--+if false+-->
---

<a href="/docs/for-buildpack-authors/tutorials/basic-buildpack/07_make-buildpack-configurable" class="button bg-pink">Next Step</a>
<!--+end+-->
