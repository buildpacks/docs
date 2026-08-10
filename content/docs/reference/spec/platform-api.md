+++
title="Platform API"
aliases=[
  "/docs/reference/platform-api/"
]
+++

The Platform API specifies the interface between a [lifecycle] program
and a [platform] that runs it.

<!--more-->

## API Compatibility

A [platform] may implement more than one Platform API version at a time, although it is not required to do so.
Platforms can control the Platform API version expected by the lifecycle by setting the `CNB_PLATFORM_API` environment variable.

A [lifecycle] may (and usually does) support more than one Platform API version at a time.
The supported Platform API version(s) can be found in the `lifecycle.toml` file in a lifecycle tarball,
or in a label on the [lifecycle image](https://hub.docker.com/r/buildpacksio/lifecycle).

A lifecycle "supports" a platform (and vice versa) if they both declare support for the same Platform API version in format: `<major>.<minor>`.

## Further Reading

You can read the complete [Platform API specification on Github](https://github.com/buildpacks/spec/blob/main/platform.md).

[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
[platform]: /docs/for-app-developers/concepts/platform/
