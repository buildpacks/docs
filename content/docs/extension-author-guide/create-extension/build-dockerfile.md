+++
title="Generating a build.Dockerfile"
weight=404
+++

### Examine `tree` extension

#### detect

`cat $workspace/samples/extensions/tree/bin/detect` - the extension always detects (because its exit code is `0`) and provides a dependency
  called `tree` by writing to the build plan

#### generate

`cat extensions/tree/bin/generate` - the extension generates a `build.Dockerfile` that installs `tree` on the builder
  image

### Re-create our builder with `hello-extensions` updated to require `tree`

1. Edit `$workspace/samples/buildpacks/hello-extensions/bin/detect` to uncomment the first set of lines that
  output `[[requires]]` to the build plan

2. Create the builder:

```
$workspace/pack/out/pack builder create $registry_namespace/extensions-builder \
  --config $workspace/samples/builders/alpine/builder.toml \
  --publish
```

### Build the application image

```
$workspace/pack/out/pack build hello-extensions \
  --builder $registry_namespace/extensions-builder \
  --lifecycle-image $LIFECYCLE_IMAGE \
  --verbose
```

You should see:

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

### See the image fail to run

`docker run hello-extensions`

You should see:

```
ERROR: failed to launch: path lookup: exec: "curl": executable file not found in $PATH
```

What happened: our builder uses run image `cnbs/sample-stack-run:alpine` which does not have `curl` installed, so our
  process failed to launch.

Let's take a look at how the `samples/curl` extension fixes the error by switching the run image to another image...

<!--+ if false+-->
---

<a href="/docs/extension-author-guide/create-extension/run-dockerfile" class="button bg-pink">Next Step</a>
<!--+ end +-->
