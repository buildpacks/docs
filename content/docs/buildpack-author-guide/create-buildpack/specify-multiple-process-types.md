+++
title="Specify multiple process types"
weight=406
+++

<!-- test:suite=create-buildpack;weight=6 -->

One of the benefits of buildpacks is that they are multi-process - an image can have multiple entrypoints for each operational mode. Let's see how this works. We will extend our app to have an entrypoint that allows a debugger to attach to it.

To enable running the debug process, we'll need to have our buildpack define a "process type" for the worker.  Modify the section where processes are defined to:

```bash
# ...

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

# ...
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

# 3. DOWNLOAD node-js
echo "---> Downloading and extracting NodeJS"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "$node_js_url" | tar -xJf - --strip-components 1 -C "${node_js_layer}"

# 4. MAKE node-js AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "${layersdir}/node-js.toml"

# ========== MODIFIED ===========
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

Now if you rebuild your app using the updated buildpack:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

You should then be able to run your new NodeJS debug process:

<!-- test:exec -->
```bash
docker run --rm --entrypoint debug test-node-js-app
```
<!--+- "{{execute}}"+-->

and see the debug log output:

<!-- test:assert=contains -->
```text
Debugger listening on ws://127.0.0.1:9229/
```

Next, we'll look at how to improve our buildpack by leveraging cache.

<!--+if false+-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/caching" class="button bg-pink">Next Step</a>
<!--+end+-->