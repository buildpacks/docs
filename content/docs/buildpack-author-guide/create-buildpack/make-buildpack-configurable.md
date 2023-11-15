+++
title="Making your buildpack configurable"
weight=408
+++

<!-- test:suite=create-buildpack;weight=8 -->

It's likely that not all NodeJS apps will want to use the same version of NodeJS. Let's make the NodeJS version configurable.

## Select NodeJS version

We'll allow buildpack users to define the desired NodeJS version via a `.node-js-version` file in their app. We'll first update the `detect` script to check for this file. We will then record the dependency we can `provide` (NodeJS), as well as the specific dependency the application will `require`, in the `Build Plan`, a document the lifecycle uses to determine if the buildpack will provide everything the application needs.

Update `node-js-buildpack/bin/detect` to look like this:

<!-- test:file=node-js-buildpack/bin/detect -->
```bash
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f package.json ]]; then
   exit 100
fi

# ======= ADDED =======
plan=$2
version=3.1.3

if [[ -f .node-js-version ]]; then
    version=$(cat .node-js-version | tr -d '[:space:]')
fi

echo "provides = [{ name = \"node-js\" }]" > "$plan"
echo "requires = [{ name = \"node-js\", metadata = { version = \"$version\" } }]" >> "$plan"
# ======= /ADDED =======
```

Then you will need to update your `build` script to look for the recorded NodeJS version in the build plan:

Your `node-js-buildpack/bin/build` script should look like the following:

<!-- test:file=node-js-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

# ======= MODIFIED =======
# 1. GET ARGS
layersdir=$1
plan=$3

# 2. CREATE THE LAYER DIRECTORY
node_js_layer="${layersdir}"/node-js
mkdir -p "${node_js_layer}"

# ======= MODIFIED =======
# 3. DOWNLOAD node-js
node_js_version=$(cat "$plan" | yj -t | jq -r '.entries[] | select(.name == "node-js") | .metadata.version') || "18.18.1"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v${node_js_version}-linux-x64.tar.xz
remote_nodejs_version=$(cat "${layersdir}/node-js.toml" 2> /dev/null | yj -t | jq -r .metadata.nodejs-version 2>/dev/null || echo 'NOT FOUND')
if [[ "${node_js_url}" != *"${remote_nodejs_version}"* ]] ; then
    echo "-----> Downloading and extracting NodeJS"
    node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
    wget -q -O - "${node_js_url}" | tar -xJf - --strip-components 1 -C "${node_js_layer}"
    cat >> "${layersdir}/node-js.toml" << EOL
[metadata]
nodejs-version = "${node_js_version}"
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

Finally, create a file `node-js-sample-app/.node-js-version` with the following contents:

<!-- test:file=node-js-sample-app/.node-js-version -->
```
18.18.1
```

Now when you run:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

You will notice that version of NodeJS specified in the app's `.node-js-version` file is downloaded.

<!-- test:assert=contains;ignore-lines=... -->
```text
===> BUILDING
...
---> NodeJS Buildpack
---> Downloading and extracting NodeJS 18.18.1
```

Next, let's see how buildpacks can store information about the dependencies provided in the output app image for introspection.

<!--+if false+-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/adding-bill-of-materials" class="button bg-pink">Next Step</a>
<!--+end+-->
