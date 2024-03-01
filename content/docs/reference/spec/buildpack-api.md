+++ title="Buildpack API"
aliases=[
"/docs/reference/buildpack-api/"
]
+++

The Buildpack API specifies the interface between a [lifecycle] program and one or more [buildpacks][buildpack].

<!--more-->

## API Compatibility

A [buildpack] only ever implements one Buildpack API version at a time.
The implemented Buildpack API version can be found in the `buildpack.toml` file in the buildpack's root directory,
or in a label on a buildpack package.

A [lifecycle] may (and usually does) support more than one Buildpack API version at a time.
The supported Buildpack API version(s) can be found in the `lifecycle.toml` file in a lifecycle tarball,
or in a label on the [lifecycle image](https://hub.docker.com/r/buildpacksio/lifecycle).

A lifecycle "supports" a buildpack if they both declare support for the same Buildpack API version in format: `<major>.<minor>`.

Two buildpacks of different Buildpack API versions can participate in the same build,
provided they are both supported by the lifecycle.

## Further Reading

You can read the complete [Buildpack API specification on Github](https://github.com/buildpacks/spec/blob/main/buildpack.md).

[buildpack]: /docs/for-platform-operators/concepts/buildpack/
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
