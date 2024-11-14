+++
title="What are experimental features?"
weight=8
+++

Certain features are considered `experimental` and susceptible to change in future API versions.

<!--more-->

This means users will need to enable the `experimental` mode in order to use one of these features.

If using `pack`, run `pack config experimental true`, or add `experimental = true` to your `~/.pack/config.toml` file to enable experimental features.

If using the `lifecycle` directly, set the `CNB_EXPERIMENTAL_MODE` [environment variable](https://github.com/buildpacks/spec/blob/main/platform.md#experimental-features).

The following features are experimental for `pack`:

* building for [Windows containers][windows]
* exporting to [OCI layout][oci-layout] format on disk
* Interacting with the [buildpack registry][registry]
* `pack manifest` commands
* `pack buildpack --flatten`
* `pack build --interactive`
* When building, reading project metadata version & source URL from [project.toml][project-descriptor]

The following features are experimental for `lifecycle`:

* Building for [Windows containers][windows]
* Exporting to [OCI layout][oci-layout] format on disk

For more information and to look at an example of how this might be valuable, see [Export to OCI layout format on disk][oci-layout].

[oci-layout]: https://buildpacks.io/docs/for-app-developers/how-to/special-cases/export-to-oci-layout/
[project-descriptor]: https://buildpacks.io/docs/reference/config/project-descriptor/
[registry]: https://buildpacks.io/docs/for-buildpack-authors/how-to/distribute-buildpacks/publish-buildpack/
[windows]: https://buildpacks.io/docs/for-app-developers/how-to/special-cases/build-for-windows/
