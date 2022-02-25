# An App's Brief Journey from Source to Image

## Pack for the journey

In this tutorial, we'll explain how to use `pack` and **buildpacks** to create a runnable app image from source code.

> **NOTE:** `pack` is only one implementation of the [Cloud Native Buildpacks Platform Specification][cnb-platform-spec]. Additionally, not all Cloud Native Buildpacks Platforms require Docker.

[cnb-platform-spec]: https://github.com/buildpacks/spec/blob/main/platform.md

## Buildpack base camp

Before we set out, you'll need to know the basics of **buildpacks** and how they work.

### What is a [buildpack][buildpack]?

A buildpack is something you've probably leveraged without knowing, as they're currently
being used in many cloud platforms. A buildpack's job is to gather everything your app needs to build and run,
and it often does this job quickly and quietly.

That said, while buildpacks are often a behind-the-scenes detail, they are at the heart of transforming your source
code into a runnable app image.

##### Auto-detection

What enables buildpacks to go unnoticed is auto-detection. This happens when a platform sequentially
tests groups of buildpacks against your app's source code. The first group that deems itself fit for your source code
will become the selected set of buildpacks for your app. Detection criteria is specific to each buildpack -- for
instance, an **NPM buildpack** might look for a `package.json`, and a **Go buildpack** might look for Go source files.

### What is a [builder][builder]?

A builder is an image that contains all the components necessary to execute a build. A builder image is created by taking a build image and adding a lifecycle, buildpacks, and files that configure aspects of the build including the buildpack detection order and the location(s) of the run image.

## Next stop, the end

Let's see all this in action using `pack build`.

Run the following commands in a shell to clone and build this [simple Java app][samples-java-maven].

1. Clone the samples repo.
```
git clone https://github.com/buildpacks/samples
```{{execute}}

2. Go to the Java apps sub-directory
```
cd samples/apps/java-maven
```{{execute}}

3. Build the app using [`pack`][pack-docs]
```
pack build myapp --builder cnbs/sample-builder:bionic
```{{execute}}


> **NOTE:** This is your first time running `pack build` for `myapp`, so you'll notice that
> **the build might take longer than usual.** Subsequent builds will take advantage of various forms of caching.
> If you're curious, try running `pack build myapp` a second time to see the difference in build time.

**That's it!** You've now got a runnable app image called `myapp` available on your local Docker daemon.
We did say this was a *brief* journey after all. Take note that your app was built without needing to install
a JDK, run Maven, or otherwise configure a build environment. `pack` and **buildpacks** took care of that for you.


## Beyond the journey

To test out your new app image locally, you can run it with Docker:

```bash
docker run --rm -p 8080:8080 myapp
```{{execute}}

Now open your favorite browser and point it to port "8080" of your host and take a minute to enjoy the view.

On Katacoda you can do this by [clicking here](https://[[HOST_SUBDOMAIN]]-8080-[[KATACODA_HOST]].environments.katacoda.com)


### Take your image to the skies

`pack` uses **buildpacks** to help you easily create OCI images that you can run just about anywhere. Try
deploying your new image to your favorite cloud!

> In case you need it, `pack build` has a handy flag called `--publish` that will build your image directly onto a Docker
> registry. You can learn more about `pack` features in the [documentation][pack-docs].

## What about Windows apps?

Windows image builds are now supported!

[builder]: https://buildpacks.io/docs/concepts/components/builder/
[buildpack]: https://buildpacks.io/docs/concepts/components/buildpack/
[samples-java-maven]: https://github.com/buildpacks/samples/tree/main/apps/java-maven
[pack-docs]: https://buildpacks.io/docs/tools/pack/