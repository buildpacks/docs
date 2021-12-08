+++
title="Platform"
weight=3
+++

## What is a Platform?

A `platform` uses a [lifecycle][lifecycle], [buildpacks][buildpack] (packaged in a [builder][builder]), and application source code to produce an OCI image.

<!--more-->

## Examples

Examples of a platform might include:

* A local CLI tool that uses buildpacks to create OCI images. One such tool is the [Pack CLI][pack]
* A plugin for a continuous integration service that uses buildpacks to create OCI images. One such plugin is the [buildpacks][buildpacks-tekton] plugin in [Tekton][tekton]
* A cloud application platform that uses buildpacks to build source code before deployment. One such platform is [kpack][kpack]

## API

The platform [specification][spec] details what a platform does, and how it interacts with lifecycles and builders.

For the latest version of the Platform API, see [releases][releases] on the spec repo.

[builder]: /docs/concepts/components/builder/
[buildpack]: /docs/concepts/components/buildpack/
[lifecycle]: /docs/concepts/components/lifecycle/
[spec]: https://github.com/buildpacks/spec/blob/main/platform.md
[pack]: https://github.com/buildpacks/pack
[buildpacks-tekton]: https://github.com/tektoncd/catalog/tree/master/task/buildpacks
[tekton]: https://tekton.dev/
[kpack]: https://github.com/pivotal/kpack
[api-version]: https://github.com/buildpacks/spec/blob/main/platform.md#platform-api-version
[releases]: https://github.com/buildpacks/spec/releases?q=platform
