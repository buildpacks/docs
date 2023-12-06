+++
title="Build an app"
weight=1
summary="The basics of taking your app from source code to runnable image."
aliases=[
    "/docs/using-pack/building-app/"
]
+++
<!--+- `
# Build an app
`+-->

<!-- test:suite=create-app;weight=1 -->

<!-- test:setup:exec;exit-code=-1 -->
<!--
```bash
docker rmi sample-app
pack config trusted-builders add cnbs/sample-builder:jammy
```
-->

<!-- test:teardown:exec -->
<!--
```bash
docker rmi sample-app
```
-->

Building an app using Cloud Native Buildpacks is as easy as `1`, `2`, `3`...

## Prerequisites

A lot of the examples used within this guide will require the following: 

{{< download-button href="https://store.docker.com/search?type=edition&offering=community" color="blue" >}} Install Docker {{</>}}
{{< download-button href="/docs/install-pack" color="pink" >}} Install pack {{</>}}

### 1. Select a builder

To [build][build] an app you must first decide which [builder][builder] you're going to use. A builder
includes the [buildpacks][buildpack] that will be used as well as the environment for building your
app.

When using `pack`, you can run `pack builder suggest` for a list of suggested builders.

```
pack builder suggest
```
<!--+- "{{execute}}"+-->

For this guide we're actually going to use a sample builder, `cnbs/sample-builder:jammy`, which is not listed
as a suggested builder for good reason. It's a sample.

> **TIP:**  If you want to try production grade buildpacks, instead of our sample, use the `paketobuildpacks/builder:full` builder.  Alternatively, if you intend to deploy your application on Google Cloud Run, use try the `Google` builder.  If your intended platform is Heroku, use the `Heroku` builder.

### 2. Build your app

Now that you've decided on what builder to use, we can build our app. For this example we'll use our [samples][samples]
repo for simplicity.

1. Check that the samples repo exists and if not - we clone it
<!-- test:exec -->
```
ls samples || git clone https://github.com/buildpacks/samples
```
<!--+- "{{execute}}"+-->

2. Build the app
<!-- test:exec -->
```
pack build sample-app --path samples/apps/java-maven --builder cnbs/sample-builder:jammy
```
<!--+- "{{execute}}"+-->

> **TIP:** If you don't want to keep specifying a builder every time you build, you can set it as your default
> builder by running `pack config default-builder <BUILDER>` for example `pack config default-builder cnbs/sample-builder:jammy`
<!--+- "{{execute}}"+-->

### 3. Run it

Here we `--name` the running container so that we can clean up after it:

<!-- test:exec -->
```
docker run --rm -p 8080:8080 --name sample-app sample-app
```
<!--+- "{{execute}}"+-->

**Congratulations!**

<!--+- if false+-->
The app should now be running and accessible via [localhost:8080](http://localhost:8080).
<!--+end+-->

Now open your favorite browser and point it to port "8080" of your host and take a minute to enjoy the view.

### 4. Verify it

Executing

<!-- test:exec -->
```
curl http://localhost:8080
```

should contain the `<title>`
<!-- test:assert=contains -->
```text
Buildpacks.io Java Sample
```

### 5. Clean it up

<!-- test:exec -->
```
docker kill sample-app
```

## What about ARM apps?

Linux ARM image builds are now supported!

<!--+- if false+-->
<a href="/docs/app-developer-guide/how-to/build-an-arm-app" class="button bg-blue">Linux ARM build guide</a>
<!--+end+-->

<!--+ `
Check out the [Linux ARM build guide](https://buildpacks.io//docs/app-developer-guide/build-an-arm-app).
` +-->
## What about Windows apps?

Windows image builds are now supported!

<!--+- if false+-->
<a href="/docs/app-developer-guide/how-to/build-a-windows-app" class="button bg-blue">Windows build guide</a>
<!--+end+-->
<!--+ `
Check out the [Windows build guide](https://buildpacks.io/docs/app-developer-guide/build-a-windows-app/).
` +-->

[build]: /docs/concepts/operations/build
[builder]: /docs/concepts/components/builder
[buildpack]: /docs/concepts/components/buildpack
[samples]: https://github.com/buildpacks/samples
