+++
title="Generating a build.Dockerfile"
weight=404
+++

<!-- test:suite=dockerfiles;weight=4 -->

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

### Re-create our builder with `hello-extensions` updated to require `tree`

Edit `$PWD/samples/buildpacks/hello-extensions/bin/detect` to uncomment the first set of lines that output `[[requires]]` to the build plan:

<!-- test:exec -->
```bash
sed -i "10,11s/#//" $PWD/samples/buildpacks/hello-extensions/bin/detect
```

(On Mac, use `sed -i '' "10,11s/#//" $PWD/samples/buildpacks/hello-extensions/bin/detect`)

Re-create the builder:

<!-- test:exec -->
```
pack builder create localhost:5000/extensions-builder \
  --config $PWD/samples/builders/alpine/builder.toml \
  --publish
```

### Re-build the application image

<!-- test:exec -->
```
pack build hello-extensions \
  --builder localhost:5000/extensions-builder \
  --network host \
  --path $PWD/samples/apps/java-maven \
  --pull-policy always \
  --verbose
```

Note that `--network host` is necessary when publishing to a local registry.

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

```
docker run hello-extensions
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

<a href="/docs/extension-author-guide/create-extension/run-dockerfile" class="button bg-pink">Next Step</a>
<!--+ end +-->
