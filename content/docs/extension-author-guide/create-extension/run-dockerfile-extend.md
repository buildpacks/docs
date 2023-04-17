+++
title="Generating a run.Dockerfile that extends the runtime base image"
weight=406
+++

<!-- test:suite=dockerfiles;weight=6 -->

Run images can be kept lean if image extensions are used to dynamically install the needed dependencies
for the current application.

### Examine `cowsay` extension

#### detect

<!-- test:exec -->
```bash
cat $PWD/samples/extensions/cowsay/bin/detect
```

The extension always detects (because its exit code is `0`) and provides a dependency called `cowsay`.

#### generate

<!-- test:exec -->
```bash
cat $PWD/samples/extensions/cowsay/bin/generate
```

The extension generates a `run.Dockerfile` that installs `cowsay` on the current run image.

### Push run image to test registry

Now that we are extending the run image (vs switching it, as in the previous example) it must reside in a registry
so that we can pull its manifest (necessary for the extension process).

<!-- test:exec -->
```bash
docker push localhost:5000/run-image-curl
```

### Configure the `hello-extensions` buildpack to require `cowsay`

Set the `BP_REQUIRES` build-time environment variable to configure the `hello-extensions` buildpack to require both `tree` and `curl` (review the `./bin/detect` script to see why this works).

<!-- test:exec -->
```bash
pack build hello-extensions \
  --builder localhost:5000/extensions-builder \
  --env BP_EXT_DEMO=1 \
  --env BP_REQUIRES=tree,curl,cowsay \
  --path $PWD/samples/apps/java-maven \
  --pull-policy always \
  --network host \
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
[detector] samples/tree             0.0.1
[detector] samples/curl             0.0.1
[detector] samples/cowsay           0.0.1
[detector] samples/hello-extensions 0.0.1
[detector] Running generate for extension samples/tree@0.0.1
...
[detector] Running generate for extension samples/curl@0.0.1
...
[detector] Running generate for extension samples/cowsay@0.0.1
...
[detector] Found a run.Dockerfile from extension 'samples/curl' setting run image to 'run-image-curl'
...
[extender (build)] Found build Dockerfile for extension 'samples/tree'
[extender (build)] Applying Dockerfile at /layers/generated/build/samples_tree/Dockerfile...
[extender (run)] Found run Dockerfile for extension 'samples/curl'
[extender (run)] Found run Dockerfile for extension 'samples/cowsay'
[extender (run)] Applying Dockerfile at /layers/generated/run/samples_curl/Dockerfile...
...
[extender (run)] Applying Dockerfile at /layers/generated/run/samples_cowsay/Dockerfile
...
[extender (build)] Running build command
[extender (build)] ---> Hello Extensions Buildpack
[extender (build)] tree v1.8.0 (c) 1996 - 2018 by Steve Baker, Thomas Moore, Francesc Rocher, Florian Sesser, Kyosuke Tokoro
...
Successfully built image hello-extensions
```

Note: build image extension and run image extension are done in parallel,
so the log lines for those phases may print in a different order from that shown above.

### See the image run successfully

<!-- test:exec -->
```bash
docker run --rm --entrypoint cowsay hello-extensions
```

You should see something akin to:

```
 ________
< MOOOO! >
 --------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```
