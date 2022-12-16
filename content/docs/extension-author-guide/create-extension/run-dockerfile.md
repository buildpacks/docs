+++
title="Generating a run.Dockerfile"
weight=405
+++

### Examine `curl` extension

#### detect

`cat $workspace/samples/extensions/curl/bin/detect` - the extension always detects and provides a dependency
  called `curl`

#### generate

`cat $workspace/samples/extensions/curl/bin/generate` - the extension generates a `run.Dockerfile` that switches the run image to
  reference `run-image-curl`

### Build a run image for `curl` extension to use

1. `cat $workspace/samples/stacks/alpine/run/curl.Dockerfile` - this is a simple Dockerfile that creates a CNB run image
  from the `curl` base image by adding the required CNB user configuration and `io.buildpacks.stack.id` label
   * The Dockerfile could come from anywhere, but we include it in the `stacks` directory for convenience

2. Build the image:

```
docker build \
  --file $workspace/samples/stacks/alpine/run/curl.Dockerfile \
  --tag run-image-curl .
```

### Re-create our builder with `hello-extensions` updated to require `curl`

1. Edit `$workspace/samples/buildpacks/hello-extensions/bin/detect` to uncomment the second set of lines that
  output `[[requires]]` to the build plan

2. Create the builder:

```
pack builder create $registry_namespace/extensions-builder \
  --config $workspace/samples/builders/alpine/builder.toml \
  --publish
```

### Build the application image

```
pack build hello-extensions \
  --builder $registry_namespace/extensions-builder \
  --lifecycle-image $LIFECYCLE_IMAGE \
  --verbose
```

You should see:

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

### See the image run successfully

`docker run hello-extensions`

You should see something akin to:

```
curl 7.85.0-DEV (x86_64-pc-linux-musl)
```

What happened: now that `hello-extensions` requires both `tree` and `curl` in its build plan, both extensions are
  included in the build and provide the needed dependencies for build and launch, respectively
* The `tree` extension installs `tree` at build time, as before
* The `curl` extension switches the run image to `run-image-curl`, which has `curl` installed

Now our `curl` process can succeed!

## What's next?

The `tree` and `curl` examples are very simple, but we can unlock powerful new features with this functionality.

Platforms could have several run images available, each tailored to a specific language family, thus limiting the number
of installed dependencies for each image to the minimum necessary to support the targeted language. Image extensions
could be used to switch the run image to that most appropriate for the current application.

Similarly, builder images could be kept lean if image extensions are used to dynamically install the needed dependencies
for each application.

In the future, both run image switching and run image modification will be supported, opening the door to other use
cases. Consult the [RFC](https://github.com/buildpacks/rfcs/pull/173) for further information.
