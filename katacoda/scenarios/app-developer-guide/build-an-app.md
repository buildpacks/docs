# Build an app
# Build an app


Building an app using Cloud Native Buildpacks is as easy as `1`, `2`, `3`...

{{< contenttabs >}}
{{< contenttab name="amd64" >}}

### 1. Select a builder

To [build][build] an app you must first decide which [builder][builder] you're going to use. A builder
includes the [buildpacks][buildpack] that will be used as well as the environment for building your
app.

When using `pack`, you can run `pack builder suggest` for a list of suggested builders.

```
pack builder suggest
```{{execute}}

For this guide we're actually going to use a sample builder, `cnbs/sample-builder:bionic`, which is not listed
as a suggested builder for good reason. It's a sample.

### 2. Build your app

Now that you've decided on what builder to use, we can build our app. For this example we'll use our [samples][samples]
repo for simplicity.

1. Check that the samples repo exists and if not - we clone it
```
ls samples || git clone https://github.com/buildpacks/samples
```{{execute}}

2. Build the app
```
pack build sample-app --path samples/apps/java-maven --builder cnbs/sample-builder:bionic
```{{execute}}

> **TIP:** If you don't want to keep specifying a builder every time you build, you can set it as your default
> builder by running `pack config default-builder <BUILDER>` for example `pack config default-builder cnbs/sample-builder:bionic`{{execute}}

### 3. Run it

```
docker run --rm -p 8080:8080 sample-app
```{{execute}}

[build]: https://buildpacks.io/docs/concepts/operations/build
[builder]: https://buildpacks.io/docs/concepts/components/builder
[buildpack]: https://buildpacks.io/docs/concepts/components/buildpack
[samples]: https://github.com/buildpacks/samples


{{< /contenttab >}}
{{< contenttab name="arm64" >}}


As of today, there are no known released CNB builder images that support building ARM application images. Users can create their own ARM64 builder image by following [this guide][this guide].

In the following tutorial, we will be performing a build "manually", in that we will be performing a build by invoking the lifecycle directly.

### 1. Prepare your working directory

On your Linux ARM machine with a [docker][docker] daemon installed, prepare the following directory tree structure.

```bash
tree ~/workspace/
~/workspace/
├── buildpacks
│   └── samples_hello-world
└── platform
```

In addition, clone the [samples][samples] repository which will contain the application source code.


```bash
# clone the repo
git clone https://github.com/buildpacks/samples ~/workspace/samples
```

### 2. Prepare the assets

Now we need to prepare assets that will be used during the build process.

First we download and extract the [lifecycle][lifecycle] release, compiled for ARM. Make sure to replace `<RELEASE-VERSION>` with a valid release version.

```bash
# change to destination directory
cd ~/workspace

# download and extract lifecycle
curl -L https://github.com/buildpacks/lifecycle/releases/download/v<RELEASE-VERSION>/lifecycle-v<RELEASE-VERSION>+linux.arm64.tgz | tar xf -
```

Next we make sure that our buildpack directory is structured in a way that the lifecycle will expect.

```bash
# copy hello-world buildpack
cp -R ~/workspace/samples/buildpacks/hello-world ~/workspace/buildpacks/samples_hello-world/0.0.1
```

And finally we write the `order.toml` file that references the hello-world buildpack.

```console
$ cat > ~/workspace/order.toml &lt;EOF
[[order]]
[[order.group]]
id = "samples/hello-world"
version = "0.0.1"
optional = false
EOF
```

### 3. Build your app

Now we can build our app. For this example we will be using the docker CLI to invoke the lifecycle directly.

```bash
# invoke the lifecycle
docker run --rm \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
  --volume ~/workspace/lifecycle:/cnb/lifecycle \
  --volume ~/workspace/buildpacks:/cnb/buildpacks \
  --volume ~/workspace/samples/apps/bash-script:/workspace \
  --volume ~/workspace/platform:/platform \
  --mount type=bind,source=~/workspace/order.toml,target=/cnb/order.toml \
  --env CNB_PLATFORM_API=0.7 \
  ubuntu:bionic \
  /cnb/lifecycle/creator -log-level debug -daemon -run-image ubuntu:bionic hello-arm64
```

### 4. Run it

```bash
docker run --rm hello-arm64
```

{{< /contenttab >}}
{{< contenttab name="Windows" >}}


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

### Using remote Docker hosts

`pack` and your source code don't need to be on the same machine as your Docker daemon, thanks to support for the [`DOCKER_HOST`][docker-env-vars] environment variable. 

Essentially, this points your local Docker client (e.g. `docker` or `pack` CLI) to a remote Docker daemon. For instance, if the IP address of your host is `10.0.0.1` and its daemon is listening on port `2375`, you can set `DOCKER_HOST` to `tcp://10.0.0.1:2375`. Any subsequent `pack` or `docker` commands would communicate with the daemon on that machine instead of a local daemon.

This can be used to make `pack` build Windows container images, as long as your remote Docker host is configured to support them (i.e. the host runs a Windows OS, has [Windows container mode enabled][container-mode]).

Here's an example where `pack` on a Linux/MacOS machine can access a Windows 10 machine with Docker Desktop, using the [localhost:2375 listener][docker-general-settings] and the built-in [OpenSSH Server][windows-openssh-server].  

```console
$ ssh port-forward for localhost:2375 to remote daemon
ssh -f -N -L 2375:127.0.0.1:2375 10.0.0.1

$ set to your local forwarded port
export DOCKER_HOST=tcp://localhost:2375

$ build the app
pack build sample-app --path samples/apps/aspnet --builder cnbs/sample-builder:dotnet-framework-1809 --trust-builder

$ run it
docker run --rm -it -p 8080:80 sample-app

$ access your app on your remote docker host
curl http://10.0.0.1:8080
```

> **NOTE**: When setting `DOCKER_HOST`, keep in mind:
>
> - never expose an insecure Docker daemon to an untrusted network. Use SSH port forwarding or [mTLS][protect-the-daemon-socket] instead.
> - any volumes mounted via `pack build --volume <volume> ...` or `docker run --volume <volume> ...` must exist on the _docker host_, not the client machine.
> - any ports published via `docker run --publish <host-port>:<container-port> ...` will be published on the _docker host_, not the client machine.

[pack-issues]: https://github.com/buildpacks/pack/issues
[lifecycle-issues]: https://github.com/buildpacks/lifecycle/issues
[app-journey]: https://buildpacks.io/docs/app-journey
[getting-started]: /docs
[container-mode]: https://docs.docker.com/desktop/windows/#switch-between-windows-and-linux-containers
[docker-env-vars]: https://docs.docker.com/engine/reference/commandline/cli/#environment-variables
[docker-hosts]: #understanding-docker-hosts
[build-linux]: https://buildpacks.io/docs/app-developer-guide/build-an-app
[build]: https://buildpacks.io/docs/concepts/operations/build
[builder]: https://buildpacks.io/docs/concepts/components/builder
[buildpack]: https://buildpacks.io/docs/concepts/components/buildpack
[samples]: https://github.com/buildpacks/samples
[docker-general-settings]: https://docs.docker.com/docker-for-windows/#general
[windows-openssh-server]: https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse
[protect-the-daemon-socket]: https://docs.docker.com/engine/security/https/


{{< /contenttab >}}
{{< /contenttabs >}}

**Congratulations!**


Now open your favorite browser and point it to port "8080" of your host and take a minute to enjoy the view.

On Katacoda you can do this by [clicking here](https://[[HOST_SUBDOMAIN]]-8080-[[KATACODA_HOST]].environments.katacoda.com)
