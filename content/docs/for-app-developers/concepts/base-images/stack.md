
+++
title="Stack (deprecated)"
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

> `pack stack suggest` is also deprecated. Use `pack builder suggest` to find
> recommended builders that use current base images.

## What replaces stacks for app developers?

As an app developer you never needed to specify a stack ID directly; the builder you chose implied a stack. That relationship still holds: choose a builder and the run image it provides determines your app's base environment. The difference is that run images are now described by standard OCI properties (OS, architecture, and Linux distribution) rather than an opaque stack ID.

### Choosing a builder

Use `pack builder suggest` for a list of recommended builders, or `pack builder inspect` to examine a specific builder. The **Run Images** section shows the run image your app image will be based on:

```text
$ pack builder inspect cnbs/sample-builder:alpine

Run Images:
  cnbs/sample-base-run:alpine
```

The run image tag identifies the OS distribution the builder targets. `cnbs/sample-base-run:alpine` is an Alpine Linux image; the sample builder declares both `linux/amd64` and `linux/arm64` as supported targets.

### Building for a specific architecture

When a builder supports multiple architectures, `pack` defaults to the architecture of the host machine. To target a different architecture explicitly, use the `--platform` flag:

```bash
pack build my-app --builder cnbs/sample-builder:alpine --platform linux/arm64
```

See the [Linux ARM build guide](/docs/for-app-developers/how-to/special-cases/build-for-arm/) for a worked example.

### Rebasing

Rebasing an app image used to require that the old and new run images shared the same stack ID. It now requires that they share the same OS, architecture, and Linux distribution. This is enforced automatically by `pack rebase`; no action is needed on your part unless a rebase that previously succeeded now fails, in which case the run images are genuinely incompatible targets.
