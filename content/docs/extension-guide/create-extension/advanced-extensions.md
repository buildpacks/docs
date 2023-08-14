+++
title="The finer points of image extensions"
weight=406
+++

# Guidance for extension authors

## During detect

### Expressing provided dependencies through the build plan

The [build plan](/docs/reference/spec/buildpack-api#build-plan) is a mechanism for inter-buildpack communication.
Through the build plan, buildpacks may express the dependencies they require, as well as those they provide.
The lifecycle uses information from the build plan to determine whether a group of buildpacks is compatible - that is, whether for every buildpack in the group, its required dependencies are provided by a buildpack that comes before it.

Extensions can use the build plan too - but they are only allowed to provide dependencies, they cannot require any.
Note that because there is a separate order for extensions that is prepended to each buildpack group during the `detect` phase,
all extension "provides" come before all buildpack "requires" in the build plan.

During the `detect` phase, the lifecycle sets a `CNB_OUTPUT_DIR` environment variable when executing each `./bin/detect`.
If using a build plan, extensions should write the plan to `$CNB_OUTPUT_DIR/plan.toml`.

## During generate

### Configuring build args

During the `generate` phase, extensions may output (in addition to Dockerfiles) an `extend-config.toml`
containing build-time arguments for Dockerfiles.
(Not to be confused with the `build` phase, "build" here refers to the application of Dockerfiles to a base image,
similar to a `docker build`).

Arguments may be configured for builder image extension or runtime base image extension or both,
according to the schema defined in the [spec](https://github.com/buildpacks/spec/blob/main/image_extension.md#extend-configtoml-toml).

During the `generate` phase, the lifecycle sets a `CNB_OUTPUT_DIR` environment variable when executing each `./bin/generate`.
If using an `extend-config.toml`, extensions should write the config to `$CNB_OUTPUT_DIR/extend-config.toml`.

### Invalidating the build cache with the UUID build arg

Whenever possible, the application of Dockerfiles to a base image will use a caching mechanism
similar to that of a `docker build`.
The lifecycle, for example, uses [`kaniko`](https://github.com/GoogleContainerTools/kaniko) to implement the `extender`.

However, there may be times when caching is not desired - for example, when fetching the "latest" available version of a package.
In such cases, Dockerfiles can use the `build_id` build argument to invalidate the cache for all instructions that follow.

As an example:

```bash
RUN echo "this instruction may be found in the cache"

ARG build_id=0
RUN echo ${build_id}

RUN echo "this instruction should never be found in the cache, as the value above will change"
```

Note that `build_id` is defaulted to `0` as a best practice.

### Re-setting the user/group with build args

Dockerfiles from image extensions may contain `USER root` instructions in order to perform actions that would not be possible
when running as a non-root user.

However, for security reasons, the final user after all Dockerfiles have been applied should _not_ be root.
To reset the user to its original value (before the application of the current Dockerfile),
Dockerfiles should make use of `user_id` and `group_id` build arguments, as seen below:

```bash
ARG user_id=1000
ARG group_id=1000
USER ${user_id}:${group_id}
```

### Making 'rebasable' changes

Image layers generated from extensions are "above the rebasable seam" - that is,
after swapping the runtime image to an updated version through a `rebase` operation,
the extension layers will be persisted in the rebased application image.

Unlike buildpack layers, extension layers are _not_ always safe to rebase.
Extension layers _may_ be safe to rebase if:
* the changes they introduce are purely additive (no modification of pre-existing files from the base image), or
* any modified pre-existing files are safe to exclude from rebase (the file from the extension layer will override any updated version of the file from the new runtime base image)

By default, the lifecycle will assume that any extension layers are _not_ rebasable.
To indicate otherwise, `run.Dockerfile`s should include:

```bash
LABEL io.buildpacks.rebasable=true
```

If all `run.Dockerfile`s set this label to `true`, the application image will contain the label `io.buildpacks.rebasable=true`.
Otherwise, the application image will contain the label `io.buildpacks.rebasable=false`.
`pack rebase` requires a `--force` flag if the application image contains `io.buildpacks.rebasable=false`.

Extension authors should take great care (and perform testing) to ensure that any layers marked as rebasable are in fact rebasable.

## In general

### Choosing an extension ID

Extension IDs must be globally unique to extensions, but extensions and buildpacks can share the same ID.

### Expressing information in extension.toml

Just like `buildpack.toml`, an `extension.toml` can contain additional metadata to describe its behavior.
See the [spec](https://github.com/buildpacks/spec/blob/main/image_extension.md#extensiontoml-toml) for more information.

### Pre-populating output

The root directory for a typical extension might look like the following:

```
.
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
├── extension.toml <- similar to a buildpack buildpack.toml
```

But it could also look like any of the following:

#### ./bin/detect is optional!

```
.
├── bin
│   ├── generate
├── detect
│   ├── plan.toml
├── extension.toml
```

#### ./bin/generate is optional!

```
├── bin
│   ├── detect
├── generate
│   ├── build.Dockerfile
│   ├── run.Dockerfile
├── extension.toml
```

#### It's all optional!

```
├── detect
│   ├── plan.toml
├── generate
│   ├── build.Dockerfile
│   ├── run.Dockerfile
├── extension.toml
```
