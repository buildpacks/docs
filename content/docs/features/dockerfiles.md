+++ title="Dockerfiles"
summary="Dockerfiles can be used to extend base images for buildpacks builds"
+++

## Why Dockerfiles?

Buildpacks can do a lot, but there are some things buildpacks can't do. They can't install operating system packages,
for example. Why not? Buildpacks run unprivileged and cannot make arbitrary changes to the filesystem. This enhances
security, enables buildpack interoperability, and preserves the ability to rebase - but it comes at a cost. Base image
authors must anticipate the OS-level dependencies that will be needed at build- and run-time ahead of time, and this
isn't always possible. This has been a longstanding source of [discussion](https://github.com/buildpacks/rfcs/pull/173)
within the CNB project: how can we preserve the benefits of buildpacks while enabling more powerful capabilities?

## Buildpacks and Dockerfiles can work together

Buildpacks are often presented as an alternative to Dockerfiles, but we think buildpacks and Dockerfiles can work
together. Whereas buildpacks are optimized for creating layers that are efficient and logically mapped to the
dependencies that they provide, Dockerfiles are the most-used and best-understood mechanism for constructing base images
and installing OS-level dependencies for containers. The CNB Dockerfiles feature allows Dockerfiles to "provide"
dependencies that buildpacks "require" through a shared [build plan][TODO], by introducing the concept of image
extensions.

## What are image extensions?

Image extensions are somewhat like buildpacks, although they are also very different. Their purpose is to generate
Dockerfiles that can be used to extend the builder or run images prior to buildpacks builds. Like buildpacks, extensions
participate in the `detect` phase - analyzing application source code to determine if they are needed. During `detect`,
extensions can contribute to the [build plan][TODO] - recording dependencies that they are able to "provide" (though
unlike buildpacks, they can't "require" anything). If the provided order contains extensions, the output of `detect`
will be a group of image extensions and a group of buildpacks that together produce a valid build plan. Image extensions
only generate Dockerfiles - they don't create layers or participate in the `build` phase.

An image extension could be defined with the following directory:

```
.
├── extension.toml <- similar to a buildpack buildpack.toml
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
```

* The `extension.toml` describes the extension, containing information such as its name, ID, and version.
* `./bin/detect` is invoked during the `detect` phase. It analyzes application source code to determine if the extension
  is needed and contributes build plan entries.
* `./bin/generate` is invoked during the `generate` phase (a new lifecycle phase that happens after `detect`). It
  outputs either or both of `build.Dockerfile` or `run.Dockerfile` for extending the builder or run image,
  respectively (in the [initial implementation](#phased-approach), only limited `run.Dockerfile`s are allowed).

For more information, see [authoring an image extension][TODO].

## A platform's perspective

Platforms may wish to use image extensions if they wish to provide the flexibility of modifying base images dynamically
at build time.

To use image extensions, a platform should do the following:

* Ensure the platform API in use is at least `0.10`
* Include image extensions in the provided builder (see [packaging an image extension][TODO])
* When invoking the `detector` binary, include image extensions in `order.toml`
  * Note that the new `generate` phase is a sub-task of the `detector` and thus happens automatically after (and in the
    same container as) `detect`
* Invoke the `restorer` with the `-build-image` flag and cache volume mounted at `/kaniko`
  * The `restorer` will gather data from the registry that is necessary for builder image extension
* Invoke the `extender` binary with the builder image digest reference as the first argument and cache volume mounted
  at `/kaniko`
  * Note that when extending the builder image, there is no need to invoke the `builder` binary as the `build` phase is
    a sub-task of the `extender` and thus happens automatically after (and in the same container as) `extend`
* Invoke the `exporter` as usual

Extensions workflows are not currently supported when using the `creator` binary - support may be added in the future,
but with a lower priority.

### Risks

Image extensions are considered experimental and susceptible to change in future API versions. Additionally, platform
operators should be mindful that:

* Dockerfiles are very powerful - in fact, you can do anything with a Dockerfile! Introducing image extensions into your
  CNB builds can eliminate the security and compatibility guarantees that buildpacks provide if not done with great
  care. Consult the [guidelines and best practices][TODO] for more information.
* When Dockerfiles are used to switch the run image from that defined on the provided builder, the resulting run image
  may not have all the mixins required by buildpacks that detected. Platforms may wish to optionally re-validate mixins
  prior to `build` when using extensions.

### Phased approach

Some limitations of the initial implementation of the Dockerfiles feature have already been mentioned, and we'll expand
on them here. As this is a large and complicated feature, the implementation has been split into phases in order to
deliver incremental value and gather feedback.

* Phase 1 (supported in lifecycle `0.15.0` or greater): one or more `run.Dockerfile`s each containing a single `FROM`
  instruction can be used to switch the original run image to a new image (as no image modifications are permitted,
  there is no need to run `extend` on the run image)
* Phase 2 (supported in lifecycle `0.15.0` or greater): one or more `build.Dockerfile`s can be used to extend the
  builder image
  * A new `extend` lifecycle phase is introduced to apply `build.Dockerfile`s from `generate` to the builder image
* Phase 3 (future): one or more `run.Dockerfile`s can be used to extend the run image
  * The `extend` lifecycle phase can be run in parallel for the builder and run images

The final ordering of lifecycle phases will look something like the following:

* `analyze`
* `detect` - after standard detection, `detect` will also run extensions' `./bin/generate`; output Dockerfiles are
  written to a volume
* `restore`
* `extend` - applies one or more `build.Dockerfile`s to the builder image
* `extend` - applies one or more `run.Dockerfile`s to the run image (could run in parallel with builder image extension)
* `build`
* `export`

The [pack cli](https://github.com/buildpacks/pack)
and [Tekton task](https://github.com/tektoncd/catalog/tree/main/task/buildpacks-phases/0.2) have or will eventually have
support for builds using image extensions. However, [kpack](https://github.com/pivotal/kpack) - while able to use image
extensions in builds - will need additional updating to propagate changes such as a switched run image back to the
appropriate resource to avoid breaking rebase.

## In action: a CNB build with extensions

Let's walk through a build that uses extensions, step by step. We will see an image extension that installs `curl` on
the builder image, and switches the run image to an image that has `curl` installed.

### 0. Setup workspace directory

* `workspace=<your preferred workspace directory>`

### 1. Clone the pack repo and build it (TODO: remove when pack with extensions-phase-2 support is released)

* `cd $workspace`
* `git clone git@github.com:buildpacks/pack.git`
* `cd pack`
* `git checkout extensions-phase-2`
* `make clean build`

### 2. Clone the samples repo

* `cd $workspace`
* `git clone git@github.com:buildpacks/samples.git`
* `cd samples`
* `git checkout extensions-phase-2` (TODO: remove when `extensions-phase-2` merged)

### 3. Create a builder with extensions and publish it

* Download the latest lifecycle tarball from the GitHub release
  page: https://github.com/buildpacks/lifecycle/releases/tag/v0.15.0-rc.1 (TODO: update to 0.15.0 when released)
* Edit `$workspace/samples/builders/alpine/builder.toml` to add the following at the end of the file:

```
[lifecycle]
uri = <path to lifecycle tarball>
```

* Ensure you are authenticated with an OCI registry: `docker login` should succeed
* Set your preferred registry namespace: `registry_namespace=<your preferred registry namespace>`
  * For now, it is necessary for the builder to be pushed to a remote registry for `pack build` with image extensions to
    succeed
* `$workspace/pack/out/pack builder create $registry_namespace/extensions-builder --config $workspace/samples/builders/alpine/builder.toml --publish`

### 4. Examine `hello-extensions` buildpack

* `cat $workspace/samples/buildpacks/hello-extensions/bin/detect` - the buildpack always detects but doesn't require any
  dependencies (as the output build plan is empty)
* `cat $workspace/samples/buildpacks/hello-extensions/bin/build` - the buildpack tries to use `tree` during the build
  phase, and defines a launch process called `curl` that runs `curl --version` at runtime

### 5. See a build in action (build failure case)

* Ensure experimental features are enabled: `$workspace/pack/out/pack config experimental true`
* Set the lifecycle image for `pack` to use in the untrusted builder workflow (as the trusted workflow that uses
  the `creator` is not currently supported): `LIFECYCLE_IMAGE=buildpacksio/lifecycle:0.15.0-rc.1`
* Build the application image (note that the "source" directory is effectively ignored in our
  example): `$workspace/pack/out/pack build hello-extensions --builder $registry_namespace/extensions-builder --lifecycle-image $LIFECYCLE_IMAGE --verbose --pull-policy always`
  - you should see:

```
[detector] ======== Results ========
[detector] pass: samples/tree@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] skip: samples/tree@0.0.1 provides unused tree
[detector] 1 of 2 buildpacks participating
[detector] samples/hello-extensions 0.0.1
...
[extender] Running build command
[extender] ---> Hello Extensions Buildpack
[extender] /cnb/buildpacks/samples_hello-extensions/0.0.1/bin/build: line 6: tree: command not found
[extender] ERROR: failed to build: exit status 127
```

* What happened: our builder doesn't have tree installed, so the `hello-extensions` buildpack failed to build (as it
  tries to run `tree --version` in its `./bin/build` script). Even though there is a `samples/tree` extension that
  passed detection (`pass: samples/tree@0.0.1`), because the `hello-extensions` buildpack didn't require `tree` in the
  build plan, the extension was omitted from the detected group (`skip: samples/tree@0.0.1 provides unused tree`). Let's
  take a look at what the `samples/tree` extension does...

### 6. Examine `tree` extension

* `cat $workspace/samples/extensions/tree/bin/detect` - the extension always detects and provides a dependency
  called `tree`
* `cat extensions/tree/bin/generate` - the extension generates a `build.Dockerfile` that installs `tree` on the builder
  image

### 7. Re-create our builder with `hello-extensions` updated to require `tree`

* Edit `$workspace/samples/buildpacks/hello-extensions/bin/detect` to uncomment the first set of lines that
  output `[[requires]]` to the build plan
* `$workspace/pack/out/pack builder create $registry_namespace/extensions-builder --config $workspace/samples/builders/alpine/builder.toml --publish`

### 8. See a build in action (run failure case)

* Build the application
  image: `$workspace/pack/out/pack build hello-extensions --builder $registry_namespace/extensions-builder --lifecycle-image $LIFECYCLE_IMAGE --verbose`
  - you should see:

```
[detector] ======== Results ========
[detector] pass: samples/tree@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] samples/tree             0.0.1
[detector] samples/hello-extensions 0.0.1
[detector] Running generate for extension samples/tree@0.0.1
...
[extender] Found build Dockerfile for extension 'samples/tree'
[extender] Applying the Dockerfile at /layers/generated/build/samples_tree/Dockerfile...
...
[extender] Running build command
[extender] ---> Hello Extensions Buildpack
[extender] tree v1.8.0 (c) 1996 - 2018 by Steve Baker, Thomas Moore, Francesc Rocher, Florian Sesser, Kyosuke Tokoro
...
Successfully built image hello-extensions
```

* See the image fail to run: `docker run hello-extensions` - you should
  see `ERROR: failed to launch: path lookup: exec: "curl": executable file not found in $PATH`.
* What happened: our builder uses run image `cnbs/sample-stack-run:alpine` which does not have `curl` installed, so our
  process failed to launch

### 9. Examine `curl` extension

* `cat $workspace/samples/extensions/curl/bin/detect` - the extension always detects and provides a dependency
  called `curl`
* `cat extensions/curl/bin/generate` - the extension generates a `run.Dockerfile` that switches the run image to
  reference `run-image-curl`

### 10. Build a run image for `curl` extension to use

* `cat $workspace/samples/stacks/alpine/run/curl.Dockerfile` - this is a simple Dockerfile that creates a CNB run image
  from the `curl` base image by adding the required CNB user configuration and `io.buildpacks.stack.id` label; the
  Dockerfile could come from anywhere, but we include it in the `stacks` directory for convenience
* `docker build --tag run-image-curl --file $workspace/samples/stacks/alpine/run/curl.Dockerfile .`

### 11. Re-create our builder with `hello-extensions` updated to require `curl`

* Edit `$workspace/samples/buildpacks/hello-extensions/bin/detect` to uncomment the second set of lines that
  output `[[requires]]` to the build plan
* `$workspace/pack/out/pack builder create $registry_namespace/extensions-builder --config $workspace/samples/builders/alpine/builder.toml --publish`

### 12. See a build in action (success case)

* Build the application
  image: `$workspace/pack/out/pack build hello-extensions --builder $registry_namespace/extensions-builder --lifecycle-image $LIFECYCLE_IMAGE --verbose`
  - you should see:

```
[detector] ======== Results ========
[detector] pass: samples/tree@0.0.1
[detector] pass: samples/curl@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] samples/tree             0.0.1
[detector] samples/curl             0.0.1
[detector] samples/hello-extensions 0.0.1
[detector] Running generate for extension samples/tree@0.0.1
...
[detector] Running generate for extension samples/curl@0.0.1
...
[detector] Checking for new run image
[detector] Found a run.Dockerfile configuring image 'run-image-curl' from extension with id 'samples/curl'
...
[extender] Found build Dockerfile for extension 'samples/tree'
[extender] Applying the Dockerfile at /layers/generated/build/samples_tree/Dockerfile...
...
[extender] Running build command
[extender] ---> Hello Extensions Buildpack
[extender] tree v1.8.0 (c) 1996 - 2018 by Steve Baker, Thomas Moore, Francesc Rocher, Florian Sesser, Kyosuke Tokoro
...
Successfully built image hello-extensions
```

* See the image run successfully: `docker run hello-extensions` - you should see something akin
  to `curl 7.85.0-DEV (x86_64-pc-linux-musl)`
* What happened: now that `hello-extensions` requires both `tree` and `curl` in its build plan, both extensions run and
  provide the needed dependencies for build and launch, respectively.
  * The `tree` extension installs `tree` at build time, as before
  * The `curl` extension switches the run image to `run-image-curl`, which has `curl` installed. Now our `curl` process
    can succeed!

## What's next?

The `tree` and `curl` examples are very simple, but we can unlock powerful new features with this functionality.
Platforms could have several run images available, each tailored to a specific language family, thus limiting the number
of installed dependencies for each image to the minimum necessary to support the targeted language. Image extensions
could be used to switch the run image to that most appropriate for the current application. Similarly, builder images
could be kept lean if image extensions are used to dynamically install the needed dependencies depending on the
requirements of each application.

In the future, both run image switching and run image modification will be supported, opening the door to other use
cases. Consult the [RFC](https://github.com/buildpacks/rfcs/pull/173) for further information.

Your feedback is appreciated! As the feature evolves, we want to hear from you - what's going well, what's challenging,
and anything else you'd like to see. Please reach out in [Slack](https://cncf.slack.io) (#buildpacks channel)
or [GitHub](https://github.com/buildpacks).

[TODO]: /docs/index.html