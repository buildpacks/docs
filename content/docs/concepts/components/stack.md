+++
title="Stack"
weight=4
aliases=[
    "/docs/using-pack/stacks/"
]
+++

## What is a stack?

A stack (deprecated) is the grouping together of the build and run base images, represented by a unique ID.

As of Platform API 0.12 and Buildpack API 0.10, stacks are deprecated in favor of existing constructs in the container image ecosystem such as operating system name, operating system distribution, and architecture.

For more information, see
* Platform API 0.12 [migration guide](/docs/for-platform-operators/how-to/migrate/platform-api-0.11-0.12/)
* Buildpack API 0.10 [migration guide](/docs/for-buildpack-authors/how-to/migrate/buildpack-api-0.9-0.10/)
* [Build image](/docs/concepts/components/base-images/build/) concept
* [Run image](/docs/concepts/components/base-images/run/) concept
* [Target data](/docs/concepts/components/targets/)

For older API versions, see below on using stacks.

<!--more-->

## Using stacks

> If you're using the `pack` CLI, running `pack stack suggest` will display a list of recommended
stacks that can be used when running `pack builder create`, along with each stack's associated build and run images.

Stacks are used by [builders][builder] and are configured through a builder's
[configuration file](/docs/reference/config/builder-config/):

```toml
[[buildpacks]]
  # ...

[[order]]
  # ...

[stack]
  id = "com.example.stack"
  build-image = "example/build"
  run-image = "example/run"
  run-image-mirrors = ["gcr.io/example/run", "registry.example.com/example/run"]
```

By providing the required `[stack]` section, a builder author can configure a stack's ID, build image, and run image
(including any mirrors).

## Resources

To learn how to create your own stack, see our [Operator's Guide][operator-guide].

[operator-guide]: /docs/for-platform-operators/
[builder]: /docs/concepts/components/builder/
[buildpack]: /docs/concepts/components/buildpack/
[lifecycle]: /docs/concepts/components/lifecycle/
