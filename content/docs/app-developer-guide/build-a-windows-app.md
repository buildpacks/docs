+++
title="Build a Windows app"
weight=2
summary="The basics of taking your Windows app from source code to runnable image."
+++

> **EXPERIMENTAL:**
>
> - Please note that **Windows container support is currently experimental**. You may be asked to enable experimental features  in `pack` when running the following commands. Simply follow the on-screen instructions to do so.
> - If you encounter any problems while experimenting, we'd love for you to let us know by filing an issue on the [pack][pack-issues] or [lifecycle][lifecycle-issues] repo.

### Recommended reading

Before trying out builds for Windows images, we recommend following the [Linux image tutorial][app-journey] under [Getting Started][getting-started]. Don't worry, you can still run it on a Windows OS if you need to -- just make sure to [enable Linux containers][container-mode] for Docker first.

When you're done, head back here.

### Understanding Docker hosts

The `pack` CLI supports using the [`DOCKER_HOST`][docker-env-vars] environment variable. Essentially, this points your local Docker client (e.g. `docker` or `pack` CLI) to a remote Docker daemon. For instance, if the IP address of your host is `192.168.2.100`, you can set `DOCKER_HOST` to `tcp://192.168.2.100`. Any subsequent `pack` or `docker` commands would communicate with the daemon on that machine instead of a local daemon.

By setting `DOCKER_HOST`, you can use `pack` on any OS to build Windows container images, as long as your remote Docker host is configured to support them (i.e. the host runs a Windows OS and has [Windows container mode enabled][container-mode]).

> **NOTE**: When setting `DOCKER_HOST`, keep in mind that:
>
> - any volumes mounted via `pack build --volume <volume> ...` or `docker run --volume <volume> ...` must exist on the _docker host_, not the client machine.
> - any ports published via `docker run --publish <host-port>:<container-port> ...` will be published on the _docker host_, not the client machine.

### Enable Windows container mode

In order to produce Windows container images, ensure [Windows container mode][container-mode] is enabled in your Docker settings (available only in Docker for Windows). See [Understanding Docker hosts][docker-hosts] above if you're using a remote Docker host.

Then, building a Windows app using Cloud Native Buildpacks is nearly identical to [building for Linux][build-linux]:

### 1. Select a builder

To [build][build] an app you must first decide which [builder][builder] you're going to use. A builder
includes the [buildpacks][buildpack] that will be used as well as the environment for building your
app.

For this guide we're going to use a sample builder, `cnbs/sample-builder:dotnet-framework-1809`.

### 2. Build your app

Now we can build our app. For this example we'll use our [samples][samples] repo for simplicity.

```bash
# clone the repo
git clone https://github.com/buildpacks/samples

# build the app
pack build sample-app --path samples/apps/aspnet --builder cnbs/sample-builder:dotnet-framework-1809 --trust-builder
```

> **TIP:** If you don't want to keep specifying a builder every time you build, you can set it as your default
> builder by running `pack set-default-builder <BUILDER>`.

### 3. Run it

```bash
docker run --rm -it -p 8080:80 sample-app
```

**Congratulations!**

The app should now be running and accessible via [localhost:8080](http://localhost:8080)

> **NOTE:** If [`DOCKER_HOST` is set][docker-hosts], visit `<docker-host-ip>:8080` instead.

[pack-issues]: https://github.com/buildpacks/pack/issues
[lifecycle-issues]: https://github.com/buildpacks/lifecycle/issues
[app-journey]: /docs/app-journey
[getting-started]: /docs
[container-mode]: https://docs.docker.com/docker-for-windows/#switch-between-windows-and-linux-containers
[docker-env-vars]: https://docs.docker.com/engine/reference/commandline/cli/#environment-variables
[docker-hosts]: #understanding-docker-hosts
[build-linux]: /docs/app-developer-guide/build-an-app
[build]: /docs/concepts/operations/build
[builder]: /docs/concepts/components/builder
[buildpack]: /docs/concepts/components/buildpack
[samples]: https://github.com/buildpacks/samples