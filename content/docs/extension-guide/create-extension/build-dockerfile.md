+++
title="Generating a build.Dockerfile"
weight=404
aliases = [
  "/docs/extension-author-guide/create-extension/build-dockerfile/",
  ]
+++

<!-- test:suite=dockerfiles;weight=4 -->

Builder images can be kept lean if image extensions are used to dynamically install the needed dependencies
for the current application.

### Examine `tree` extension

#### detect

<!-- test:exec -->
```bash
cat $PWD/samples/extensions/tree/bin/detect
```

The extension always detects (because its exit code is `0`) and provides a dependency called `tree` by writing to the build plan.

#### generate

<!-- test:exec -->
```bash
cat $PWD/samples/extensions/tree/bin/generate
```

The extension generates a `build.Dockerfile` that installs `tree` on the builder image.

### Configure the `hello-extensions` buildpack to require `tree`

Set the `BP_REQUIRES` build-time environment variable to configure the `hello-extensions` buildpack to require `tree` (review the `./bin/detect` script to see why this works).

<!-- test:exec -->
```
pack build hello-extensions \
  --builder localhost:5000/extensions-builder \
  --env BP_EXT_DEMO=1 \
  --env BP_REQUIRES=tree \
  --network host \
  --path $PWD/samples/apps/java-maven \
  --pull-policy always \
  --verbose
```

Note that `--network host` is necessary when publishing to a local registry.

You should see:

```
...
[detector] ======== Results ========
[detector] pass: samples/tree@0.0.1
[detector] pass: samples/curl@0.0.1
[detector] pass: samples/cowsay@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] skip: samples/curl@0.0.1 provides unused curl
[detector] skip: samples/cowsay@0.0.1 provides unused cowsay
[detector] 2 of 4 buildpacks participating
[detector] samples/tree             0.0.1
[detector] samples/hello-extensions 0.0.1
[detector] Running generate for extension samples/tree@0.0.1
...
[extender (build)] Found build Dockerfile for extension 'samples/tree'
[extender (build)] Applying the Dockerfile at /layers/generated/build/samples_tree/Dockerfile...
...
[extender (build)] Running build command
[extender (build)] ---> Hello Extensions Buildpack
[extender (build)] tree v1.8.0 (c) 1996 - 2018 by Steve Baker, Thomas Moore, Francesc Rocher, Florian Sesser, Kyosuke Tokoro
...
Successfully built image hello-extensions
```

### See the image fail to run

```
docker run --rm hello-extensions
```

You should see:

```
ERROR: failed to launch: path lookup: exec: "curl": executable file not found in $PATH
```

What happened: our builder uses run image `cnbs/sample-stack-run:alpine`, which does not have `curl` installed, so our
  process failed to launch.

Let's take a look at how the `samples/curl` extension fixes the error by switching the run image to another image...

<!--+ if false+-->
---

<a href="/docs/extension-guide/create-extension/run-dockerfile-switch" class="button bg-pink">Next Step</a>
