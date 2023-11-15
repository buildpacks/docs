+++
title="Improving performance with caching"
weight=407
+++

<!-- test:suite=create-buildpack;weight=7 -->

We can improve performance by caching the runtime between builds, only re-downloading when necessary. To begin, let's cache the runtime layer.

## Cache the runtime layer

To do this, replace the following lines in the `build` script:

```bash
# 4. MAKE node-js AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "${layersdir}/node-js.toml"
```

with the following:

```bash
# 4. MAKE node-js AVAILABLE DURING LAUNCH and CACHE it
echo -e '[types]\ncache = true\nlaunch = true' > "${layersdir}/node-js.toml"
```

Your full `node-js-buildpack/bin/build`<!--+"{{open}}"+--> script should now look like the following:

<!-- test:file=node-js-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

# 1. GET ARGS
layersdir=$1

# 2. CREATE THE LAYER DIRECTORY
node_js_layer="${layersdir}"/node-js
mkdir -p "${node_js_layer}"

# 3. DOWNLOAD NodeJS
echo "---> Downloading and extracting NodeJS"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "$node_js_url" | tar -xJf - --strip-components 1 -C "${node_js_layer}"

# 4. MAKE NodeJS AVAILABLE DURING LAUNCH and CACHE the LAYER
# ========== MODIFIED ===========
echo -e '[types]\ncache = true\nlaunch = true' > "${layersdir}/node-js.toml"

# 5. SET DEFAULT START COMMAND
cat > "${layersdir}/launch.toml" << EOL
# our web process
[[processes]]
type = "web"
command = "node app.js"
default = true

# our debug process
[[processes]]
type = "debug"
command = "node --inspect app.js"
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

Now, let's implement the caching logic.  We need to record the version of the NodeJS runtime that is used in a build.  On subsequent builds, the caching logic will detect the current requested NodeJS version and restore the previous layer from the cache if the current requested NodeJS version matches the previous NodeJS runtime version.

<!-- test:file=node-js-buildpack/bin/build -->
```
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

# 1. GET ARGS
layersdir=$1

# 2. CREATE THE LAYER DIRECTORY
node_js_layer="${layersdir}"/node-js
mkdir -p "${node_js_layer}"

# 3. DOWNLOAD node-js
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
remote_nodejs_version=$(cat "${layersdir}/node-js.toml" 2> /dev/null | yj -t | jq -r .metadata.nodejs-version 2>/dev/null || echo 'NOT FOUND')
if [[ "${node_js_url}" != *"${remote_nodejs_version}"* ]] ; then
    echo "-----> Downloading and extracting NodeJS"
    node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
    wget -q -O - "${node_js_url}" | tar -xJf - --strip-components 1 -C "${node_js_layer}"
    cat >> "${layersdir}/node-js.toml" << EOL
[metadata]
nodejs-version = "18.18.1"
EOL
else
    echo "-----> Reusing NodeJS"
fi

# 4. MAKE node-js AVAILABLE DURING LAUNCH and CACHE the LAYER
echo -e '[types]\ncache = true\nlaunch = true' > "${layersdir}/node-js.toml"

# ========== ADDED ===========
# 5. SET DEFAULT START COMMAND
cat > "${layersdir}/launch.toml" << EOL
[[processes]]
type = "web"
command = "node app.js"
default = true
EOL
```

Now when you build your app:

<!-- test:exec -->
```text
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

you will see the new caching logic at work during the `BUILDING` phase:

<!-- test:assert=contains;ignore-lines=... -->
```text
===> BUILDING
...
---> NodeJS Buildpack
---> Reusing node-js
```

Next, let's see how buildpack users may be able to provide configuration to the buildpack.

<!--+if false+-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/make-buildpack-configurable" class="button bg-pink">Next Step</a>
<!--+end+-->
