
+++
title="Build for ARM architecture"
aliases=[
  "/docs/app-developer-guide/build-an-arm-app"
]
weight=1
+++

<!--more-->

Building for the ARM architecture is now easier than ever! The `heroku/builder:24` builder supports both AMD64 and ARM64 architectures, and includes
multi-arch Go, Java, Node.js, PHP, Python, Ruby and Scala buildpacks. You can read more about Heroku's [Cloud Native Buildpacks here][heroku-buildpacks].

### 1. Clone the [samples][samples] repository

```
# clone the repo
git clone https://github.com/buildpacks/samples
```
<!--+- "{{execute}}"+-->

### 2. Build the app

If you're using an ARM64 computer (such as an Apple Silicon Mac, or an AWS Graviton instance), you can build an ARM64 OCI image with [pack][pack] simply by setting your builder to `heroku/builder:24`:
```
pack build java-maven-sample --path samples/apps/java-maven/ --builder heroku/builder:24
```
<!--+- "{{execute}}"+-->

By default, `pack` uses the current architecture for multi-arch builders like `heroku/builder:24`, so an AMD64 image will be built on AMD64 systems.

If you want to build an ARM64 image from a different host architecture, use the `--platform` parameter:
```
pack build java-maven-sample --path samples/apps/java-maven/ --builder heroku/builder:24 --platform linux/arm64
```
<!--+- "{{execute}}"+-->

> **TIP:** If you don't want to keep specifying a builder every time you build, you can set it as your default
> builder by running `pack config default-builder <BUILDER>` for example `pack config default-builder heroku/builder:24`
<!--+- "{{execute}}"+-->

### 3. Run it

```
docker run --rm -p 8080:8080 java-maven-sample
```
<!--+- "{{execute}}"+-->

**Congratulations!**

<!--+- if false+-->
The app should now be running and accessible via [localhost:8080](http://localhost:8080).
<!--+end+-->

[pack]: https://github.com/buildpacks/pack
[docker]: https://docs.docker.com
[samples]: https://github.com/buildpacks/samples
[heroku-buildpacks]: https://github.com/heroku/buildpacks
