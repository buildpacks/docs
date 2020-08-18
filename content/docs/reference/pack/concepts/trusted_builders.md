+++
title="Trusted Builders"
+++

From version [0.11.0](https://github.com/buildpacks/pack/releases/tag/v0.11.0) onward, `pack` can be used to identify builders that should be considered trusted. `pack build` will operate slightly differently under the hood based on whether it considers the specified builder to be trusted.

Read the [announcement](https://medium.com/buildpacks/faster-more-secure-builds-with-pack-0-11-0-4d0c633ca619).

## What is a Trusted Builder?

When `pack` considers a builder to be trusted, `pack build` operations will use a single lifecycle binary called the `creator`. If `pack` doesn't trust a builder it will continue to execute five separate lifecycle binaries: `detect`, `analyze`, `restore`, `build` and `export`.

This choice strikes a balance between security and performance. The `analyze`, `restore` and `export` phases of the lifecycle require higher levels of privilege or access to sensitive data that is not required by the `detect` and `build` phases.

When `pack` doesn't trust a builder `pack build` will run the more privileged phases using a published lifecycle image, if one is available. If `pack` were to use the `creator` lifecycle phase with an untrusted builder, each of the buildpack's `bin/detect` and `bin/build` processes would run within a container that has heightened privileges or access to registry credentials. The buildpacks distributed with the untrusted builder could be constructed to act maliciously with these privileges or credentials.

When `pack` trusts a builder `pack build` will run a single lifecycle binary which will flow through the five lifecycle steps in a single container. This is more efficient than running five separate containers.

## Which buildpacks are trusted?

By default, any builder suggested by  [`pack suggest-builders`](/docs/reference/pack/pack_suggest-builders) is considered trusted.

Any other builder can be trusted using  [`pack trust-builder <builder-name>`](/docs/reference/pack/pack_trust-builder/).

View which builders are trusted with  [`pack list-trusted-builders`](/docs/reference/pack/pack_list-trusted-builders/).

Stop trusting a builder using [`pack untrust-builder <builder-name`](/docs/reference/pack/pack_untrust-builder/).

[`pack build`](/docs/reference/pack/pack_build/) will consider any builder as trusted for the duration of a single build if configured with the `--trust-builder` flag.

### Using an untrusted builder with an older lifecycle version

A published lifecycle image is available for lifecycle versions 0.7.5+ and 0.6.1. If your builder has been created with an earlier version of the lifecycle `pack build` will **fail** due to this security related change.
