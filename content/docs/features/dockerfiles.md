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
dependencies that buildpacks "require" through a shared [build plan](TODO), by introducing the concept of image
extensions ([**experimental**](#risks)).

## What are image extensions?

Image extensions are somewhat like buildpacks, although there are important differences. Like buildpacks, extensions
participate in the `detect` phase - analyzing application source code to determine if they are needed. During `detect`
, extensions can contribute to the [build plan](TODO) - recording dependencies that they are able to "provide" (though
unlike buildpacks, they don't "require" anything). If the provided order contains extensions, the output of `detect`
will be an (optional) group of image extensions and a group of buildpacks that together produce a valid build plan.

The selected group of image extensions will be used to generate Dockerfiles that can be used to extend the build- or
run-time base images prior to the `build` and `export` phases (in the [initial implementation](#phased-approach), only
limited Dockerfiles for run-image customization are allowed).

An image extension could be defined with the following directory:

```
.
├── extension.toml <- similar to a buildpack extension.toml
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
```

* The `extension.toml` describes the extension, containing information such as its name, ID, and version.
* `./bin/detect` is invoked during the `detect` phase. It analyzes application source code to determine if the extension
  is needed and contributes build plan entries.
* `./bin/generate` is invoked during the `generate` phase. It outputs either or both of `build.Dockerfile` or
  `run.Dockerfile` for extending the build- or run-time base image, respectively (in
  the [initial implementation](#phased-approach), only limited `run.Dockerfile`s are allowed).

For more information, see [authoring an image extension](TODO).

## A platform's perspective

Platforms may wish to use image extensions if TODO.

To use image extensions, a platform should do the following:

* Include image extensions in the provided builder (see [packaging an image extension](TODO))
* When running the `detect` phase, include image extensions in the provided order
* After running the `detect` phase, but before running the `build` or `export` phases, apply the generated Dockerfiles
  to the build- or run-time base images (in the [initial implementation](#phased-approach), this is not needed)
* Invoke the `build` and `export` phases as usual

### Risks

Image extensions / Dockerfiles are considered experimental and susceptible to change in future API versions.
Additionally, platform operators should be mindful that:

* You can do anything with a Dockerfile TODO
* Mixins TODO

### Phased approach

Some limitations of the initial implementation of this feature have already been mentioned, and we'll expand on them
here. As this is a large and complicated feature, TODO.

## In action: a CNB build with extensions

Let's walk through a build that uses extensions, step by step.

* `workspace=<workspace>`
* Clone the lifecycle repo and build it (TODO: remove when lifecycle v0.15.0-rc.1 released)
  * `cd $workspace`
  * `git clone git@github.com:buildpacks/lifecycle.git`
  * `cd lifecycle`
  * `make clean build-linux-amd64 package-linux-amd64`
  * `LIFECYCLE_TARBALL=$(ls out/lifecycle-*.tgz)` - used for `pack builder create`
  * `LIFECYCLE_IMAGE=$(make build-image-linux-amd64 | grep 'tag lifecycle:' | cut -d ' ' -f 12)` - used for `pack build`
* Clone the pack repo and build it (TODO: remove when pack v0.28.0-rc.1 released)
  * `cd $workspace`
  * `git clone git@github.com:buildpacks/pack.git`
  * `cd pack`
  * `git checkout extensions-phase-1`
  * `make clean build`
* Clone the samples repo
  * `cd $workspace`
  * `git clone git@github.com:buildpacks/samples.git`
  * `cd samples`
  * `git checkout extensions-phase-1` (TODO: remove when `extensions-phase-1` merged)
* Create a builder with extensions
  * `echo LIFECYCLE_TARBALL: $LIFECYCLE_TARBALL`
  * Edit `./builders/alpine/builder.toml` to replace `replace-me` with the path to the lifecycle tarball
  * `$workspace/pack/out/pack builder create extensions-builder --config ./builders/alpine/builder.toml`
* See a build in action (failure case)
  * `cat ./buildpacks/hello-extensions/bin/detect`
    * This buildpack always detects but doesn't require any dependencies (as the output build plan is empty)
  * `cat ./buildpacks/hello-extensions/bin/build`
    * This buildpack defines a process called `curl` that runs `curl --version`; it will be the default process invoked
      when the application image is run
  * `$workspace/pack/out/pack build hello-extensions --builder extensions-builder --lifecycle-image $LIFECYCLE_IMAGE --verbose`
  * `docker run hello-extensions`
    * You should see the following output: `TODO`
  * What happened: TODO
* Build a run image that has `curl` installed
  * TODO
* Second build - success
  * Look at the curl extension
  * Look at the curl Dockerfile
  * Uncomment build plan
  * Run pack build - see the app start successfully

## What's next?

TODO

* This is a simple example, but we could do more
* Run image tailored to each language family (keeping the number of installed packages very small)
* In the future, we'll be able to extend the build and run images (not just switch them) - keep an eye out here
