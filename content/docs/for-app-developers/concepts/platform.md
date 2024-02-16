
+++
title="What is a platform?"
aliases=[
  "/docs/concepts/components/platform"
]
weight=4
+++

A `platform` orchestrates [builds][build] by invoking the [lifecycle] binary together with [buildpacks][buildpack] and
application source code to produce a runnable OCI image.

<!--more-->

## Examples

Examples of a platform might include:

* A local CLI tool that uses buildpacks to create OCI images. One such tool is the [Pack CLI][pack]
* A plugin for a continuous integration service that uses buildpacks to create OCI images. One such plugin is the [buildpacks][buildpacks-tekton] plugin in [Tekton]
* A cloud application platform that uses buildpacks to build source code before deployment. One such platform is [kpack][kpack]

## API

The platform [specification][spec] details what a platform does, and how it interacts with lifecycles and builders.

For the latest version of the Platform API, see [releases][releases] on the spec repo.

[api-version]: https://github.com/buildpacks/spec/blob/main/platform.md#platform-api-version
[build]: /docs/for-platform-operators/concepts/lifecycle/
[builder]: /docs/for-app-developers/concepts/builder/
[buildpack]: /docs/for-app-developers/concepts/buildpack/
[buildpacks-tekton]: https://github.com/tektoncd/catalog/tree/master/task/buildpacks
[kpack]: https://github.com/pivotal/kpack
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
[pack]: https://github.com/buildpacks/pack
[releases]: https://github.com/buildpacks/spec/releases?q=platform
[spec]: https://github.com/buildpacks/spec/blob/main/platform.md
[tekton]: https://tekton.dev/
