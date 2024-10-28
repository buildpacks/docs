+++
title="What are experimental features?"
weight=8
+++

Certain features are considered `experimental` and susceptible to change in a future API version.

<!--more-->

This means users will need to enable the `experimental` mode in order to use one of these feature.

To enable these features, run `pack config experimental true`, or add `experimental = true` to the `~/.pack/config.toml` file.

For example, exporting your application to disk in `OCI` layout format is an experimental feature available on `pack` since version `v0.30.0`

For more information and to look at an example of how this might be valuable, see [Export to OCI layout format on disk][exp-feature].

[exp-feature]: https://buildpacks.io/docs/for-app-developers/how-to/special-cases/export-to-oci-layout/
