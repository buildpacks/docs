+++
title="Build a Windows app"
weight=2
summary="The basics of taking your Windows app from source code to runnable image."
+++

> **EXPERIMENTAL** Windows support is experiment!
>
> Enable experimental mode by running: `pack config experimental true`

### Precursor

#### Recommended reading

Before trying out builds for Windows images, we recommend following the [Linux image tutorial][app-journey] under [Getting Started][getting-started]. Don't worry, you can still run it on a Windows OS if you need to -- just make sure to [enable Linux containers][container-mode] for Docker first.

When you're done, head back here.

#### Enable Windows container mode

In order to produce Windows container images, ensure [Windows container mode][container-mode] is enabled in your Docker settings (available only in Docker for Windows).

Then, building a Windows app using Cloud Native Buildpacks is nearly identical to [building for Linux][build-linux]:

> **Not using Windows?**
>
> `pack` can build Windows apps using a remote Windows Docker by setting a `DOCKER_HOST`. [Learn more](#using-remote-docker-hosts)

---

### 0. Determine Windows Version

Before we can start, we'll want to match your Windows environment.

Type the following command in PowerShell:

```powershell
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" | Format-Table -Property ReleaseId, CurrentBuild
```

Select the output that best matches your environment:
{{< page-replace-toggle >}}
{{< page-replace-toggle-option search="1809|2004|2022" replace="1809" >}} Release ID: 1809, Build: <i>any</i> {{< /page-replace-toggle-option >}}
{{< page-replace-toggle-option search="1809|2004|2022" replace="2004" >}} Release ID: 2009, Build: 1904<i>x</i> {{< /page-replace-toggle-option >}}
{{< page-replace-toggle-option search="1809|2004|2022" replace="2022" >}} Release ID: 2009, Build: 2200<i>x</i> {{< /page-replace-toggle-option >}}
{{< /page-replace-toggle >}}

<small>[Learn more about compatibility][compatibility].</small>

[compatibility]: https://docs.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/version-compatibility?tabs=windows-server-2019%2Cwindows-10-20H2#windows-client-host-os-compatibility

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

# change directory to samples
cd samples

# build the app
pack build sample-app --path apps/aspnet --builder cnbs/sample-builder:dotnet-framework-1809 --trust-builder
```

> **TIP:** The builder may take a few minutes to download on the first use.

> **TIP:** If you don't want to keep specifying a builder every time you build, you can set it as your default
> builder by running `pack config default-builder <BUILDER>`.

### 3. Run it

```bash
docker run --rm -it -p 8080:80 sample-app
```

**Congratulations!**

The app should now be running and accessible via [localhost:8080](http://localhost:8080)

---

## Using remote Docker hosts

`pack` and your source code don't need to be on the same machine as your Docker daemon, thanks to support for the [`DOCKER_HOST`][docker-env-vars] environment variable. 

Essentially, this points your local Docker client (e.g. `docker` or `pack` CLI) to a remote Docker daemon. For instance, if the IP address of your host is `10.0.0.1` and its daemon is listening on port `2375`, you can set `DOCKER_HOST` to `tcp://10.0.0.1:2375`. Any subsequent `pack` or `docker` commands would communicate with the daemon on that machine instead of a local daemon.

This can be used to make `pack` build Windows container images, as long as your remote Docker host is configured to support them (i.e. the host runs a Windows OS, has [Windows container mode enabled][container-mode]).

Here's an example where `pack` on a Linux/MacOS machine can access a Windows 10 machine with Docker Desktop, using the [localhost:2375 listener][docker-general-settings] and the built-in [OpenSSH Server][windows-openssh-server].  
```
# ssh port-forward for localhost:2375 to remote daemon
ssh -f -N -L 2375:127.0.0.1:2375 10.0.0.1

# set to your local forwarded port
export DOCKER_HOST=tcp://localhost:2375

# build the app
pack build sample-app --path samples/apps/aspnet --builder cnbs/sample-builder:dotnet-framework-1809 --trust-builder

# run it
docker run --rm -it -p 8080:80 sample-app

# access your app on your remote docker host
curl http://10.0.0.1:8080
```

> **NOTE**: When setting `DOCKER_HOST`, keep in mind:
>
> - never expose an insecure Docker daemon to an untrusted network. Use SSH port forwarding or [mTLS][protect-the-daemon-socket] instead.
> - any volumes mounted via `pack build --volume <volume> ...` or `docker run --volume <volume> ...` must exist on the _docker host_, not the client machine.
> - any ports published via `docker run --publish <host-port>:<container-port> ...` will be published on the _docker host_, not the client machine.

[pack-issues]: https://github.com/buildpacks/pack/issues
[lifecycle-issues]: https://github.com/buildpacks/lifecycle/issues
[app-journey]: /docs/app-journey
[getting-started]: /docs
[container-mode]: https://docs.docker.com/desktop/windows/#switch-between-windows-and-linux-containers
[docker-env-vars]: https://docs.docker.com/engine/reference/commandline/cli/#environment-variables
[docker-hosts]: #understanding-docker-hosts
[build-linux]: /docs/app-developer-guide/build-an-app
[build]: /docs/concepts/operations/build
[builder]: /docs/concepts/components/builder
[buildpack]: /docs/concepts/components/buildpack
[samples]: https://github.com/buildpacks/samples
[docker-general-settings]: https://docs.docker.com/docker-for-windows/#general
[windows-openssh-server]: https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse
[protect-the-daemon-socket]: https://docs.docker.com/engine/security/https/
