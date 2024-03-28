+++
title="Provide a Software Bill-of-Materials"
weight=5
+++

Buildpacks can provide a [Software `Bill-of-Materials`](https://en.wikipedia.org/wiki/Software_bill_of_materials) (SBOM)
to describe the dependencies that they provide.

<!--more-->

There are three supported ways to report SBOM data.
You'll need to choose to use one or more of [CycloneDX](https://cyclonedx.org/), [SPDX](https://spdx.dev/) or [Syft](https://github.com/anchore/syft).
The SBOM format you choose to use is likely to be the format accepted by the SBOM scanner (eg: [`syft cli`](https://github.com/anchore/syft)) you might choose to use.

The emitted SBOM files follow a naming convention based on the layer they describe and the format they contain.

For example, to provide SBOM information in CycloneDX json format for a `node-js` layer,
you'll need to create a `node-js.sbom.cdx.json` file in the buildpack layers directory containing the SBOM data.

Other supported file extensions are `spdx.json` or `syft.json`.

You'll also need to update your `buildpack.toml` file to declare that your buildpack emits SBOM files. For example:

<!-- test:file=node-js-buildpack/buildpack.toml -->
```toml
# Buildpack API version
api = "0.10"

# Buildpack ID and metadata
[buildpack]
  id = "examples/node-js"
  version = "0.0.1"
  sbom-formats = [ "application/vnd.cyclonedx+json" ]
```

Then, in our buildpack implementation we will generate the necessary SBOM metadata:

```bash
# ...

# Append a Bill-of-Materials containing metadata about the provided node-js version
cat >> "${CNB_LAYERS_DIR}/node-js.sbom.cdx.json" << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "node-js",
      "version": "${node_js_version}"
    }
  ]
}
EOL
```

We can also add an SBOM entry for each dependency listed in `package.json`.  Here we use `jq` to add a new record to the `components` array in `bundler.sbom.cdx.json`:

```bash
node-jsbom="${CNB_LAYERS_DIR}/node-js.sbom.cdx.json"
cat >> ${node-jsbom} << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "node-js",
      "version": "${node_js_version}"
    }
  ]
}
EOL
```

The bill-of-materials information will be available using `pack sbom download`.
