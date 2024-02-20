
+++
title="Switching the runtime base image with a run.Dockerfile"
aliases=[
  "/docs/extension-author-guide/run-dockerfile/",
  "/docs/extension-guide/create-extension/run-dockerfile-switch"
]
weight=5
+++

<!--more-->

<!-- test:suite=dockerfiles;weight=5 -->

Platforms can have several run images available, each tailored to a specific language family - thus limiting the number
of installed dependencies for each image to the minimum necessary to support the targeted language. Image extensions
can be used to switch the run image to that most appropriate for the current application.

### Examine `curl` extension

#### detect

<!-- test:exec -->
```bash
cat $PWD/samples/extensions/curl/bin/detect
```

The extension always detects (because its exit code is `0`) and provides a dependency called `curl`.

#### generate

<!-- test:exec -->
```bash
cat $PWD/samples/extensions/curl/bin/generate
```

The extension generates a `run.Dockerfile` that switches the run image to reference `localhost:5000/run-image-curl`.

### Build a run image for `curl` extension to use

<!-- test:exec -->
```bash
cat $PWD/samples/base-images/alpine/run/curl.Dockerfile
```

This is a simple Dockerfile that creates a CNB run image from the `curl` base image by adding the required CNB user configuration and labels.

The Dockerfile could come from anywhere, but we include it in the `base-images` directory for convenience.

Build the run image:

<!-- test:exec -->
```bash
docker build \
  --file $PWD/samples/base-images/alpine/run/curl.Dockerfile \
  --tag localhost:5000/run-image-curl .

docker push localhost:5000/run-image-curl
```

### Configure the `hello-extensions` buildpack to require `curl`

Set the `BP_REQUIRES` build-time environment variable to configure the `hello-extensions` buildpack to require both `vim` and `curl` (review the `./bin/detect` script to see why this works).

<!-- test:exec -->
```bash
pack build hello-extensions \
  --builder localhost:5000/extensions-builder \
  --env BP_EXT_DEMO=1 \
  --env BP_REQUIRES=vim,curl \
  --path $PWD/samples/apps/java-maven \
  --pull-policy always \
  --network host \
  --verbose
```

Note that `--network host` is necessary when publishing to a local registry.

You should see:

```
[detector] ======== Results ========
[detector] pass: samples/vim@0.0.1
[detector] pass: samples/curl@0.0.1
[detector] pass: samples/cowsay@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] skip: samples/cowsay@0.0.1 provides unused cowsay
[detector] 3 of 4 buildpacks participating
[detector] samples/vim             0.0.1
[detector] samples/curl             0.0.1
[detector] samples/hello-extensions 0.0.1
[detector] Running generate for extension samples/vim@0.0.1
...
[detector] Running generate for extension samples/curl@0.0.1
...
[detector] Checking for new run image
[detector] Found a run.Dockerfile from extension 'samples/curl' setting run image to 'localhost:5000/run-image-curl'
...
[extender (build)] Found build Dockerfile for extension 'samples/vim'
[extender (build)] Applying the Dockerfile at /layers/generated/build/samples_vim/Dockerfile...
...
[extender (build)] Running build command
[extender (build)] ---> Hello Extensions Buildpack
[extender (build)] VIM - Vi IMproved 9.0 (2022 Jun 28, compiled May 19 2023 16:28:36)
...
Successfully built image hello-extensions
```

### See the image run successfully

<!-- test:exec -->
```bash
docker run --rm hello-extensions
```

You should see something akin to:

```
curl 7.85.0-DEV (x86_64-pc-linux-musl) ... more stuff here ...
```

What happened: now that `hello-extensions` requires both `vim` and `curl` in its build plan, both extensions are
  included in the build and provide the needed dependencies for build and launch, respectively
* The `vim` extension installs `vim` at build time, as before
* The `curl` extension switches the run image to `localhost:5000/run-image-curl`, which has `curl` installed

Now our `curl` process can succeed!

### Next steps

Our `curl` process succeeded, but there is another process type defined on our image:

```
docker run --rm --entrypoint cowsay hello-extensions
```

You should see:

```
ERROR: failed to launch: path lookup: exec: "cowsay": executable file not found in $PATH
```

Our run image, `localhost:5000/run-image-curl`, has `curl` installed, but it doesn't have `cowsay`.

In general, we may not always have a preconfigured run image available with all the needed dependencies for the current application.
Luckily, we can also use image extensions to dynamically install runtime dependencies at build time. Let's look at that next.

<!--+ if false+-->
---

<a href="/docs/for-buildpack-authors/tutorials/basic-extension/06_run-dockerfile-extend" class="button bg-pink">Next Step</a>
<!--+ end +-->
