+++
title="Make your application runnable"
weight=405
+++

<!-- test:suite=create-buildpack;weight=5 -->

To make your app runnable, a default start command must be set. You'll need to add the following to the end of your `build` script:

<!-- file=node-js-buildpack/bin/build data-target=append -->
```bash
# ...

# Set default start command
cat > "${layersdir}/launch.toml" << EOL
[[processes]]
type = "web"
command = "node app.js"
default = true
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

# ========== ADDED ===========
# 5. SET DEFAULT START COMMAND
cat > "${layersdir}/launch.toml" << EOL
[[processes]]
type = "web"
command = "node app.js"
default = true
EOL
```

Then rebuild your app using the updated buildpack:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

You should then be able to run your new NodeJS app:

```bash
docker run --rm -p 8080:8080 test-node-js-app
```
<!--+- "{{execute}}"+-->

and see the server log output:

```text
Server running at http://0.0.0.0:8080/
```

Test it out by navigating to [localhost:8080](http://localhost:8080) in your favorite browser!

We can add multiple process types to a single app. We'll do that in the next section.

<!--+if false+-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/specify-multiple-process-types" class="button bg-pink">Next Step</a>
<!--+end+-->