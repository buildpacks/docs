+++
title="Adding Bill-of-Materials"
weight=409
+++

<!-- test:suite=create-buildpack;weight=9 -->

One of the benefits of buildpacks is they can also populate the app image with metadata from the build process, allowing you to audit the app image for information like:

* The process types that are available and the commands associated with them
* The run-image the app image was based on
* The buildpacks were used to create the app image
* Whether the run-image can be rebased with a new version through the `Rebasable` label or not
* And more...!

You can find some of this information using `pack` via its `inspect-image` command.  The bill-of-materials information will be available using `pack sbom download`.

<!-- test:exec -->
```bash
pack inspect-image test-node-js-app
```
<!--+- "{{execute}}"+-->
You should see the following:

<!-- test:assert=contains;ignore-lines=... -->
```text
Run Images:
  cnbs/sample-base-run:jammy
...

Buildpacks:
  ID                   VERSION        HOMEPAGE
  examples/node-js        0.0.1          -

Processes:
  TYPE                 SHELL        COMMAND                           ARGS        WORK DIR
  web (default)        bash         node-js app.js                                   /workspace
```

Apart from the above standard metadata, buildpacks can also populate information about the dependencies they have provided in form of a `Bill-of-Materials`. Let's see how we can use this to populate information about the version of `node-js` that was installed in the output app image.

To add the `node-js` version to the output of `pack download sbom`, we will have to provide a [Software `Bill-of-Materials`](https://en.wikipedia.org/wiki/Software_bill_of_materials) (`SBOM`) containing this information. There are three "standard" ways to report SBOM data.  You'll need to choose to use one of [CycloneDX](https://cyclonedx.org/), [SPDX](https://spdx.dev/) or [Syft](https://github.com/anchore/syft) update the `node-js.sbom.<ext>` (where `<ext>` is the extension appropriate for your SBOM standard, one of `cdx.json`, `spdx.json` or `syft.json`) at the end of your `build` script.  Discussion of which SBOM format to choose is outside the scope of this tutorial, but we will note that the SBOM format you choose to use is likely to be the output format of any SBOM scanner (eg: [`syft cli`](https://github.com/anchore/syft)) you might choose to use.  In this example we will use the CycloneDX json format.

First, annotate the `buildpack.toml` to specify that it emits CycloneDX:

<!-- test:file=node-js-buildpack/buildpack.toml -->
```toml
# Buildpack API version
api = "0.8"

# Buildpack ID and metadata
[buildpack]
  id = "examples/node-js"
  version = "0.0.1"
  sbom-formats = [ "application/vnd.cyclonedx+json" ]

# Targets the buildpack will work with
[[targets]]
os = "linux"

# Stacks (deprecated) the buildpack will work with
[[stacks]]
  id = "*"
```

Then, in our buildpack implementation we will generate the necessary SBOM metadata:

```bash
# ...

# Append a Bill-of-Materials containing metadata about the provided node-js version
cat >> "${layersdir}/node-js.sbom.cdx.json" << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "node-js",
      "version": "$node-js_version"
    }
  ]
}
EOL
```

We can also add an SBOM entry for each dependency listed in `package.json`.  Here we use `jq` to add a new record to the `components` array in `bundler.sbom.cdx.json`:

```bash
cnode-jsbom="${layersdir}/node-js.sbom.cdx.json"
cat >> ${node-jsbom} << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "node-js",
      "version": "$node-js_version"
    }
  ]
}
EOL
if [[ -f package.json ]] ; then
  for gem in $(gem dep -q | grep ^Gem | sed 's/^Gem //')
  do
    version=${gem##*-}
    name=${gem%-${version}}
    DEP=$(jq --arg name "${name}" --arg version "${version}" \
      '.components[.components| length] |= . + {"type": "library", "name": $name, "version": $version}' \
      "${node-jsbom}")
    echo ${DEP} > "${node-jsbom}"
  done
fi
```

Your `node-js-buildpack/bin/build`<!--+"{{open}}"+--> script should look like the following:

<!-- test:file=node-js-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> NodeJS Buildpack"

# 1. GET ARGS
layersdir=$1
plan=$3

# 2. CREATE THE LAYER DIRECTORY
node-js_layer="${layersdir}"/node-js
mkdir -p "${node-js_layer}"

# 3. DOWNLOAD node-js
node-js_version=$(cat "$plan" | yj -t | jq -r '.entries[] | select(.name == "node-js") | .metadata.version')
echo "---> Downloading and extracting NodeJS"
node-js_url=https://nodejs.org/dist/v18.18.1/node-v18.18.1-linux-x64.tar.xz
wget -q -O - "$node-js_url" | tar -xxf - -C "${node-js_layer}"

# 4. MAKE node-js AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "${layersdir}/node-js.toml"

# 5. MAKE node-js AVAILABLE TO THIS SCRIPT
export PATH="${node-js_layer}"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"${node-js_layer}/lib"

# 6. SET DEFAULT START COMMAND
cat > "${layersdir}/launch.toml" << EOL
# our web process
[[processes]]
type = "web"
command = "node app.js"
default = true
EOL

# ========== ADDED ===========
# 7. ADD A SBOM
node-jsbom="${layersdir}/node-js.sbom.cdx.json"
cat >> ${node-jsbom} << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "node-js",
      "version": "$node-js_version"
    }
  ]
}
EOL
```

Then rebuild your app using the updated buildpack:

<!-- test:exec -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

Viewing your bill-of-materials requires extracting (or `download`ing) the bill-of-materials from your local image.  This command can take some time to return.

<!-- test:exec -->
```bash
pack sbom download test-node-js-app
```
<!--+- "{{execute}}"+-->

The SBOM information is now downloaded to the local file system:

<!-- test:exec -->
```bash
cat layers/sbom/launch/examples_node-js/node-js/sbom.cdx.json | jq -M
```

You should find that the included `node-js` version is `3.1.0` as expected.

<!-- test:assert=contains;ignore-lines=... -->
```text
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "node-js",
      "version": "3.1.0"
    },
...
  ]
}
```

Congratulations! You’ve created your first configurable Cloud Native Buildpack that uses detection, image layers, and caching to create an introspectable and runnable OCI image.

## Going further

Now that you've finished your buildpack, how about extending it? Try:

- Caching the downloaded NodeJS version
- [Packaging your buildpack for distribution][package-a-buildpack]

[package-a-buildpack]: /docs/buildpack-author-guide/package-a-buildpack/
