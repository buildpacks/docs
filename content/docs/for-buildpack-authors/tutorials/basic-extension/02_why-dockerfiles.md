
+++
title="Why this feature?"
aliases=[
  "/docs/extension-author-guide/create-extension/why-dockerfiles/",
  "/docs/extension-guide/create-extension/why-dockerfiles"
]
weight=2
+++

<!--more-->

<!-- test:suite=dockerfiles;weight=2 -->

Let's see a build that requires base image extension in order to succeed.

### Examine `hello-extensions` buildpack

#### detect

<!-- test:exec -->
```bash
cat $PWD/samples/buildpacks/hello-extensions/bin/detect
```

The buildpack opts-out of the build (exits with non-zero code) unless the `BP_EXT_DEMO` environment variable is set.

If the `BP_EXT_DEMO` environment variable is set, the buildpack detects (exits with code `0`), but doesn't require any dependencies through a build plan unless the `BP_REQUIRES` environment variable is set.

#### build

<!-- test:exec -->
```bash
cat $PWD/samples/buildpacks/hello-extensions/bin/build
```

The buildpack tries to use `vim` at build-time, and defines a launch process called `curl` that runs `curl --version` at runtime.

### Create a builder with extensions and publish it

For now, it is necessary for the builder image to be pushed to an OCI registry for builds with image extensions to succeed.

For demo purposes, we will launch a local unauthenticated registry:

<!-- test:exec -->
```bash
docker run -d --rm -p 5000:5000 registry:2
```

You can push the builder to any registry of your choice - just ensure that `docker login` succeeds and replace `localhost:5000` in the following examples with your registry namespace -
e.g., `index.docker.io/<username>`.

Create the builder:

<!-- test:exec -->
```bash
pack builder create localhost:5000/extensions-builder \
  --config $PWD/samples/builders/alpine/builder.toml \
  --target "linux/amd64" \
  --publish
```

### Build the application image

Run `pack build` (note that the "source" directory is effectively ignored in our example):

```
pack build hello-extensions \
  --builder localhost:5000/extensions-builder \
  --env BP_EXT_DEMO=1 \
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
[detector] pass: samples/vim@0.0.1
[detector] pass: samples/curl@0.0.1
[detector] pass: samples/cowsay@0.0.1
[detector] pass: samples/hello-extensions@0.0.1
[detector] Resolving plan... (try #1)
[detector] skip: samples/vim@0.0.1 provides unused vim
[detector] skip: samples/curl@0.0.1 provides unused curl
[detector] skip: samples/cowsay@0.0.1 provides unused cowsay
[detector] 1 of 4 buildpacks participating
[detector] samples/hello-extensions 0.0.1
...
[extender (build)] Running build command
[extender (build)] ---> Hello Extensions Buildpack
[extender (build)] /cnb/buildpacks/samples_hello-extensions/0.0.1/bin/build: line 6: vim: command not found
[extender (build)] ERROR: failed to build: exit status 127
```

What happened: our builder doesn't have `vim` installed, so the `hello-extensions` buildpack failed to build (as it
tries to run `vim --version` in its `./bin/build` script).

Even though there is a `samples/vim` extension that passed detection (`pass: samples/vim@0.0.1`), because
the `hello-extensions` buildpack didn't require `vim` in the build plan, the extension was omitted from the detected
group (`skip: samples/vim@0.0.1 provides unused vim`).

Let's take a look at how the `samples/vim` extension installs `vim` on the builder image...

<!--+ if false+-->
---

<a href="/docs/for-buildpack-authors/tutorials/basic-extension/03_building-blocks-extension" class="button bg-pink">Next Step</a>
<!--+ end +-->
