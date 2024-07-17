+++
title="Re-use dependency layers"
weight=99
+++

The [lifecycle](https://buildpacks.io/docs/for-buildpack-authors/concepts/lifecycle-phases/) provides a mechanism for buildpacks to explicitly opt into reusing any necessary dependency layers from a previous build. Buildpacks may modify cached build dependencies before reusing them.

<!--more-->

A buildpack usually reads metadata about layers it created during a previous build to ensure only changed layers are updated. For buildpack authors, this can aid in improving build performance by avoiding re-uploading unchanged layers and restoring any previously-cached dependencies.

To decide whether layer reuse is appropriate, a buildpack should consider:

* Whether files in the `<app>` directory have changed since the layer was created.
* Whether the environment has changed since the layer was created.
* Whether the buildpack version has changed since the layer was created.
* Whether new application dependency versions have been made available since the layer was created.

At the start of the `build` phase a buildpack MAY find:

* Partial `<layers>/<layer>.toml` files describing layers from the previous builds. The restored `Layer Content Metadata` SHALL NOT contain `launch`, `build`, or `cache` booleans even if those values were set on a previous build.
* `<layers>/<layer>.sbom.<ext>` files that were written previously.
* `<layers>/<layer>/` directories containing layer contents that have been restored from the cache.

A buildpack:

* MAY set `launch = true` under `[types]` in the restored `<layers>/<layer>.toml` file in order to include the layer in the final OCI image.
* MAY modify `metadata` in  `<layers>/<layer>.toml`
* MAY modify `metadata` in  `<layers>/<layer>.sbom.<ext>`
* **If** the layer contents have been restored to the `<layers>/<layer>/` directory
  * MAY set `build = true` under `[types]` in the restored `<layers>/<layer>.toml` to expose the layer to subsequent buildpacks.
    * MAY set `cache = true` under `[types]` in the restored `<layers>/<layer>.toml` to persist the layer to subsequent builds.
    * MAY modify the contents of `<layers>/<layer>/`.

If the buildpack does not set `launch`, `build`, or `cache` under `[types]` in the restored `<layers>/<layer>.toml` the layer SHALL be ignored.
