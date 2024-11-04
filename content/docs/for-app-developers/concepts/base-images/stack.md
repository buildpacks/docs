
+++
title="Stack"
aliases=[
  "/docs/concepts/components/stack",
  "/docs/using-pack/stacks/"
]
weight=99
+++

A stack (deprecated) is the grouping together of the build and run base images, represented by a unique ID.

<!--more-->

As of Platform API 0.12 and Buildpack API 0.10, stacks are deprecated in favor of existing constructs in the container image ecosystem such as operating system name, operating system distribution, and architecture.

For more information, see
* Platform API 0.12 [migration guide](/docs/for-platform-operators/how-to/migrate/platform-api-0.11-0.12/)
* Buildpack API 0.10 [migration guide](/docs/for-buildpack-authors/how-to/migrate/buildpack-api-0.9-0.10/)
* [Build image](/docs/for-app-developers/concepts/base-images/build/) concept
* [Run image](/docs/for-app-developers/concepts/base-images/run/) concept
* [Target data](/docs/for-buildpack-authors/concepts/targets/)

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
  build-image = "docker.io/example/build"
  run-image = "docker.io/example/run"
  run-image-mirrors = ["gcr.io/example/run", "registry.example.com/example/run"]
```

By providing the required `[stack]` section, a builder author can configure a stack's ID, build image, and run image
(including any mirrors).

## Resources

To learn how to create your own stack, see our [Operator's Guide][operator-guide].

[operator-guide]: /docs/for-platform-operators/
[builder]: /docs/for-platform-operators/concepts/builder/
[buildpack]: /docs/for-platform-operators/concepts/buildpack/
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
