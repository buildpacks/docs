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

# 3. DOWNLOAD RUBY
echo "---> Downloading and extracting NodeJS"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "$node_js_url" | tar -xJf - -C "${node_js_layer}"

# 4. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "${layersdir}/node-js.toml"

# 5. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="${node_js_layer}"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"${node_js_layer}/lib"

# ======= MODIFIED =======
# 6. INSTALL GEMS
echo "---> Installing gems"
runtimelayer="${layersdir}/bundler"
mkdir -p "${runtimelayer}"
echo -e '[types]\ncache = true\nlaunch = true' > "${layersdir}/bundler.toml"
bundle config set --local path "${runtimelayer}" && bundle install && bundle binstubs --all --path "${runtimelayer}/bin"

# 7. SET DEFAULT START COMMAND
cat > "${layersdir}/launch.toml" << EOL
# our web process
[[processes]]
type = "web"
command = "bundle exec node-js app.rb"
default = true

# our worker process
[[processes]]
type = "worker"
command = "bundle exec node-js worker.rb"
EOL
```

Now when we run:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

You will see something similar to the following during the `EXPORTING` phase:

<!-- test:assert=contains -->
```text
Adding layer 'examples/node-js:bundler'
```

## Caching dependencies

Now, let's implement the caching logic. We'll first need to create a `node-js-sample-app/Gemfile.lock`<!--+"{{open}}"+--> file with the contents given below:

> Typically you would run `bundle install` locally to generate this file, but for the sake
> of simplicity we'll create `node-js-sample-app/Gemfile.lock` manually.

<!-- test:file=node-js-sample-app/Gemfile.lock -->
```text
GEM
  remote: https://node-jsgems.org/
  specs:
    mustermann (1.0.3)
    rack (2.0.7)
    rack-protection (2.0.7)
      rack
    sinatra (2.0.7)
      mustermann (~> 1.0)
      rack (~> 2.0)
      rack-protection (= 2.0.7)
      tilt (~> 2.0)
    tilt (2.0.9)

PLATFORMS
  node-js

DEPENDENCIES
  sinatra

BUNDLED WITH
   2.0.2
```

Replace the gem installation logic from the previous step:

```bash
# ...

echo "---> Installing gems"
runtimelayer="${layersdir}/bundler"
mkdir -p "${runtimelayer}"
echo -e '[types]\ncache = true\nlaunch = true' > "${layersdir}/bundler.toml"
bundle config set --local path "${runtimelayer}" && bundle install && bundle binstubs --all --path "${runtimelayer}/bin"


# ...
```

with the new logic below that checks to see if any gems have been changed. This simply creates a checksum for the previous `Gemfile.lock` and compares it to the checksum of the current `Gemfile.lock`. If they are the same, the gems are reused. If they are not, the new gems are installed.

We'll now write additional metadata to our `bundler.toml` of the form `cache = true` and `launch = true`. This directs the lifecycle to cache our gems and provide them when launching our application. With `cache = true` the lifecycle can keep existing gems around so that build times are fast, even with minor `Gemfile.lock` changes.

Note that there may be times when you would want to clean the cached layer from the previous build, in which case you should always ensure to remove the contents of the layer before proceeding with the build. In the case below this can be done using a simple `rm -rf "${runtimelayer}"/*` after the `mkdir -p "${runtimelayer}"` command.

```bash
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
runtimelayer="${layersdir}/bundler"
local_bundler_checksum=$((sha256sum Gemfile.lock || echo 'DOES_NOT_EXIST') | cut -d ' ' -f 1)
remote_bundler_checksum=$(cat "${layersdir}/bundler.toml" | yj -t | jq -r .metadata.checksum 2>/dev/null || echo 'DOES_NOT_EXIST')

# Always set the types table so that we re-use the appropriate layers
echo -e '[types]\ncache = true\nlaunch = true' >> "${layersdir}/bundler.toml"

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "${runtimelayer}" >/dev/null
    bundle config --local bin "${runtimelayer}/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "${runtimelayer}"
    cat >> "${layersdir}/bundler.toml" << EOL
[metadata]
checksum = "$local_bundler_checksum"
EOL
    bundle config set --local path "${runtimelayer}" && bundle install && bundle binstubs --all --path "${runtimelayer}/bin"

fi
```

Your full `node-js-buildpack/bin/build`<!--+"{{open}}"+--> script will now look like this:

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

# 3. DOWNLOAD RUBY
echo "---> Downloading and extracting NodeJS"
node_js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "$node_js_url" | tar -xJf - -C "${node_js_layer}"

# 4. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "${layersdir}/node-js.toml"

# 5. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="${node_js_layer}"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"${node_js_layer}/lib"

# ======= MODIFIED =======
# 6. INSTALL GEMS
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
runtimelayer="${layersdir}/bundler"
local_bundler_checksum=$((sha256sum Gemfile.lock || echo 'DOES_NOT_EXIST') | cut -d ' ' -f 1)
remote_bundler_checksum=$(cat "${layersdir}/bundler.toml" | yj -t | jq -r .metadata.checksum 2>/dev/null || echo 'DOES_NOT_EXIST')
# Always set the types table so that we re-use the appropriate layers
echo -e '[types]\ncache = true\nlaunch = true' >> "${layersdir}/bundler.toml"

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "${runtimelayer}" >/dev/null
    bundle config --local bin "${runtimelayer}/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "${runtimelayer}"
    cat >> "${layersdir}/bundler.toml" << EOL
[metadata]
checksum = "$local_bundler_checksum"
EOL
    bundle config set --local path "${runtimelayer}" && bundle install && bundle binstubs --all --path "${runtimelayer}/bin"

fi

# 7. SET DEFAULT START COMMAND
cat > "${layersdir}/launch.toml" << EOL
# our web process
[[processes]]
type = "web"
command = "bundle exec node-js app.rb"
default = true

# our worker process
[[processes]]
type = "worker"
command = "bundle exec node-js worker.rb"
EOL
```

Now when you build your app:

<!-- test:exec -->
```text
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

it will download the gems:

<!-- test:assert=contains;ignore-lines=... -->
```text
===> BUILDING
...
---> NodeJS Buildpack
---> Downloading and extracting NodeJS
---> Installing gems
```

If you build the app again:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

you will see the new caching logic at work during the `BUILDING` phase:

<!-- test:assert=contains;ignore-lines=... -->
```text
===> BUILDING
...
---> NodeJS Buildpack
---> Downloading and extracting NodeJS
---> Reusing gems
```

Next, let's see how buildpack users may be able to provide configuration to the buildpack.

<!--+if false+-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/make-buildpack-configurable" class="button bg-pink">Next Step</a>
<!--+end+-->
