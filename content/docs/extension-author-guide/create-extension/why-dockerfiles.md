+++
title="Why Dockerfiles"
weight=402
+++

Let's see a build that requires base image extension in order to succeed.

### Examine `hello-extensions` buildpack

#### detect

* `cat $workspace/samples/buildpacks/hello-extensions/bin/detect` - the buildpack always detects but doesn't require any
  dependencies (as the output build plan is empty)

#### build

* `cat $workspace/samples/buildpacks/hello-extensions/bin/build` - the buildpack tries to use `tree` during the build
  phase, and defines a launch process called `curl` that runs `curl --version` at runtime

### Create a builder with extensions and publish it

* Ensure experimental features are enabled: `$workspace/pack/out/pack config experimental true`
* Download the latest lifecycle tarball from the GitHub release
  page: https://github.com/buildpacks/lifecycle/releases/tag/v0.15.0-rc.1 (FIXME: update to 0.15.0 when released)
* Edit `$workspace/samples/builders/alpine/builder.toml` to add the following at the end of the file:

```
[lifecycle]
uri = <path to lifecycle tarball in previous step>
```

* Ensure you are authenticated with an OCI registry: `docker login` should succeed
* Set your preferred registry namespace: `registry_namespace=<your preferred registry namespace>`
  * For now, it is necessary for the builder to be pushed to a registry for `pack build` with image extensions to
    succeed
* `$workspace/pack/out/pack builder create $registry_namespace/extensions-builder --config $workspace/samples/builders/alpine/builder.toml --publish`

### See a build in action (build failure case)

* Ensure experimental features are enabled: `$workspace/pack/out/pack config experimental true`
* Set the lifecycle image for `pack` to use in the untrusted builder workflow (as the trusted workflow that uses
  the `creator` is not currently supported): `LIFECYCLE_IMAGE=buildpacksio/lifecycle:0.15.0-rc.1` (FIXME: update to
  0.15.0 when released)
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

* What happened: our builder doesn't have `tree` installed, so the `hello-extensions` buildpack failed to build (as it
  tries to run `tree --version` in its `./bin/build` script). Even though there is a `samples/tree` extension that
  passed detection (`pass: samples/tree@0.0.1`), because the `hello-extensions` buildpack didn't require `tree` in the
  build plan, the extension was omitted from the detected group (`skip: samples/tree@0.0.1 provides unused tree`). Let's
  take a look at what the `samples/tree` extension does...

<!--+ if false+-->
---

<a href="/docs/extension-author-guide/create-extension/building-blocks-extension" class="button bg-pink">Next Step</a>
<!--+ end +-->
