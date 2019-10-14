+++
title="Build an app"
weight=1
summary="The basics of taking your app from source code to runnable image."
aliases=[
    "/docs/using-pack/building-app/"
]
+++

<div class="quote mb-4">
    {{< summary "docs/concepts/operations/build.md" >}}
    <div class="author"><a href="/docs/concepts/operations/build">build</a></div>
</div>

Building an app using Cloud Native Buildpacks is as easy as `1`, `2`, `3`...

### 1. Select a builder

To [build][build] an app you must first decide what [builder][builder] you are going to use. A builder
includes the [buildpacks][buildpack] that will be used as well as the environment for building and running your 
app.

When using `pack`, you can run `pack suggest-builders` for a list of suggested builders.

```bash
pack suggest-builders
```

For this turorial we're actually going to use a sample builder, `cnbs/sample-builder:bionic`, which is not listed
as a suggested builder for good reason. It's a sample.

### 2. Build your app

Now that you've decided on what builder to use, we can build our app. For this example we will use our [samples][samples]
repo for simplicity.

```bash
# clone the repo
git clone https://github.com/buildpack/samples

# build the app
pack build sample-app --path samples/apps/java-maven/ --builder cnbs/sample-builder:bionic
```

> **Tip:** If you didn't want to keep specifying a builder every time you build, you could set it as your default 
> builder by running `pack set-default-builder <BUILDER>`.

### 3. Run it

```bash
docker run --rm -p 8080:8080 sample-app
```

**Congratulations!** 

The app should now be running and accessible via [localhost:8080](http://localhost:8080).

[build]: /docs/concepts/operations/build
[builder]: /docs/concepts/components/builder
[buildpack]: /docs/concepts/components/buildpack
[samples]: https://github.com/buildpack/samples