+++ title="Dockerfiles"
summary="Dockerfiles can be used to define the runtime base image for buildpacks builds"
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

* Include image extensions in the provided builder (see [packaging an image extension][TODO])
* When invoking the `detector` binary, include image extensions in the provided order
  * Note that the new `generate` phase is a responsibility of the `detector` and thus happens automatically after (and
    in the same container as) `detect`
  * Note also that extensions workflows are not currently supported when using the `creator` binary - support may be
    added in the future, but with a lower priority
* After invoking the `detector`, and before invoking the `builder` or `exporter`, apply the generated Dockerfiles to the
  builder or run images (in the [initial implementation](#phased-approach), this is not needed as only run image
  switching is permitted)
* Invoke the `builder` and `exporter` binaries as usual

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

* Phase 1: one or more `run.Dockerfile` can be used to switch (only) the run image; no image modifications are allowed (
  this eliminates the need for an `extend` lifecycle phase)
* Phase 2: one or more `build.Dockerfile` can be used to extend the builder image
  * A new `extend` lifecycle phase is introduced to apply `build.Dockerfile`s from `generate` to the builder image
* Phase 3: one or more `run.Dockerfile` can be used to extend the run image
  * The `extend` lifecycle phase can be run in parallel for the builder and run images

The final ordering of lifecycle phases will look something like the following:

* `analyze`
* `detect` - after standard detection, `detect` will also run extensions' `./bin/generate`; output Dockerfiles are
  written to a volume
* `extend` - applies one or more `build.Dockerfile` to the builder image
* `extend` - applies one or more `run.Dockerfile` to the run image (could run in parallel with builder image extension)
* `restore`
* `build`
* `export`

The [pack cli](https://github.com/buildpacks/pack)
and [Tekton task](https://github.com/tektoncd/catalog/tree/main/task/buildpacks-phases/0.2) have or will eventually have
support for builds using image extensions. However, [kpack](https://github.com/pivotal/kpack) - while able to use image
extensions in builds - will need additional updating to propagate changes such as a switched run image back to the
appropriate resource to avoid breaking rebase.

Note that the method of applying Dockerfiles is left up to the platform, but could utilize the Docker daemon if
available, or [`kaniko`](https://github.com/GoogleContainerTools/kaniko) for containerized workflows. The CNB lifecycle
will have an `extender` binary to cover one or possibly both cases.

## In action: a CNB build with extensions

Let's walk through a build that uses extensions, step by step. We will see an image extension that switches the run
image from an image that does not have `curl` installed to an image that does have `curl` installed.

### 0. Setup workspace directory

* `workspace=<preferred workspace directory>`

### 1. Clone the lifecycle repo and build it (TODO: remove when lifecycle v0.15.0-rc.1 released)

* `cd $workspace`
* `git clone git@github.com:buildpacks/lifecycle.git`
* `cd lifecycle`
* `make clean build-linux-amd64 package-linux-amd64`
* `LIFECYCLE_TARBALL=$(ls out/lifecycle-*.tgz)` - used for `pack builder create`
* `LIFECYCLE_IMAGE=$(make build-image-linux-amd64 | grep 'tag lifecycle:' | cut -d ' ' -f 12)` - used for `pack build`

### 2. Clone the pack repo and build it (TODO: remove when pack v0.28.0-rc.1 released)

* `cd $workspace`
* `git clone git@github.com:buildpacks/pack.git`
* `cd pack`
* `git checkout extensions-phase-1`
* `make clean build`

### 3. Clone the samples repo

* `cd $workspace`
* `git clone git@github.com:buildpacks/samples.git`
* `cd samples`
* `git checkout extensions-phase-1` (TODO: remove when `extensions-phase-1` merged)

### 4. Create a builder with extensions

* `echo LIFECYCLE_TARBALL: $workspace/lifecycle/$LIFECYCLE_TARBALL`
* Edit `$workspace/samples/builders/alpine/builder.toml` to add the following at the end of the file:

```
[lifecycle]
uri = <path to lifecycle tarball>
```

* `$workspace/pack/out/pack builder create extensions-builder --config $workspace/samples/builders/alpine/builder.toml`

### 5. Examine `hello-extensions` buildpack

* `cat $workspace/samples/buildpacks/hello-extensions/bin/detect` - the buildpack always detects but doesn't require any
  dependencies (as the output build plan is empty)
* `cat $workspace/samples/buildpacks/hello-extensions/bin/build` - the buildpack defines a process called `curl` that
  runs `curl --version`; it will be the default process invoked when the application image is run

### 6. See a build in action (failure case)

* `$workspace/pack/out/pack build hello-extensions --builder extensions-builder --lifecycle-image $LIFECYCLE_IMAGE --verbose`
  - build the application image (note that the "source" directory is effectively ignored in our example); you should
    see:

```
[detector] ======== Results ========
[detector] pass: samples/curl@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] skip: samples/curl@0.0.1 provides unused curl
[detector] 1 of 2 buildpacks participating
[detector] samples/hello-extensions 0.0.1
...
Successfully built image hello-extensions
```

* `docker run hello-extensions` - run the application image; you should
  see: `ERROR: failed to launch: path lookup: exec: "curl": executable file not found in $PATH`
* What happened: the default run image for our builder (`cnbs/sample-stack-run:alpine`) doesn't have curl installed.
  Even though there is a `samples/curl` extension that passed detection (`pass: samples/curl@0.0.1`), because
  the `hello-extensions` buildpack didn't require `curl` in the build plan, the extension was omitted from the detected
  group (`skip: samples/curl@0.0.1 provides unused curl`). Let's take a look at what the `samples/curl` extension
  does...

### 7. Examine `curl` extension

* `cat $workspace/samples/extensions/curl/bin/detect` - the extension always detects and provides a dependency
  called `curl`
* `cat extensions/curl/bin/generate` - the extension generates a Dockerfile that switches the runtime base image
  reference to `run-image-curl`

### 8. Build a run image for `curl` extension to use

* `cat $workspace/samples/stacks/alpine/run/curl.Dockerfile` - this is a simple Dockerfile that creates a CNB run image
  by adding the required user configuration and `io.buildpacks.stack.id` label; the Dockerfile could come from anywhere
  - we include it in the `stacks` directory for convenience
* `docker build --tag run-image-curl --file $workspace/samples/stacks/alpine/run/curl.Dockerfile .`

### 9. Re-create our builder with `hello-extensions` updated to require `curl`

* Edit `$workspace/samples/buildpacks/hello-extensions/bin/detect` to uncomment the lines that output `[[requires]]`
  to the build plan
* `$workspace/pack/out/pack builder create extensions-builder --config $workspace/samples/builders/alpine/builder.toml`

### 10. See a build in action (success case)

* `$workspace/pack/out/pack build hello-extensions --builder extensions-builder --lifecycle-image $LIFECYCLE_IMAGE --verbose`
  - build the application image; you should see:

```
[detector] ======== Results ========
[detector] pass: samples/curl@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] samples/curl             0.0.1
[detector] samples/hello-extensions 0.0.1
[detector] Running generate for extension samples/curl@0.0.1
...
Successfully built image hello-extensions
```

* `docker run hello-extensions` - run the application image; you should see something akin to: `curl 7.84.0-DEV`
* What happened: the `samples/curl` extension switched the run image to `run-image-curl` which has `curl` installed, so
  our process succeeded!

## What's next?

The `curl` example is very simple, but we could do more just with the ability to switch the run image. Platforms could
have several run images available, each tailored to a specific language family, thus limiting the number of installed
dependencies for each image to the minimum necessary to support the targeted language. Image extensions could be used to
switch the run image to that most appropriate for the current application.

In the future, both run image switching and image modification will be supported, opening the door to other use cases.
Consult the [RFC](https://github.com/buildpacks/rfcs/pull/173) for further information.

Your feedback is appreciated! As the feature evolves, we want to hear from you - what's going well, what's challenging,
and anything else you'd like to see. Please reach out in [Slack](https://cncf.slack.io) (#buildpacks channel)
or [GitHub](https://github.com/buildpacks).

[TODO]: /docs/index.html