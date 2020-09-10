+++
title="Installing `pack`"
weight=1
getting-started=true
+++

## Prerequisites
{{< download-button href="https://store.docker.com/search?type=edition&offering=community" color="blue" >}} Install Docker {{</>}}

## Supported operating systems
You can install the most recent version of `pack` (version **{{< latest >}}**) as an executable binary on the following operating systems:

* [macOS](#macos)
* [Linux](#linux)
* [Windows](#windows)

### Homebrew on macOS and Linux

To install `pack` on macOS and Linux, the easiest way is to use Homebrew:

```bash
brew install buildpacks/tap/pack
```

> **Optional:** Enable [auto-completion](#auto-completion)

<hr/>

### Alternative installation on Linux

`pack` is available on GitHub releases so you can directly get and install it.

```bash
wget https://github.com/buildpacks/pack/releases/download/v{{< latest >}}/pack-v{{< latest >}}-linux.tgz
tar xvf pack-v{{< latest >}}-linux.tgz
rm pack-v{{< latest >}}-linux.tgz
./pack --help
```

From there, you can copy the executable to a directory like `/usr/local/bin` or add the current directory to your `PATH`.

> **Optional:** Enable [auto-completion](#auto-completion)

---

### Ready-to-Run Container Images

`pack` is also available as container images on Docker Hub as [`buildpacksio/pack`](https://hub.docker.com/r/buildpacksio/pack)
([definition files](https://github.com/buildpacks/pack/blob/main/.github/workflows/delivery/docker/Dockerfile)).

#### Tags

* Use this tag to track the latest release:
    * `buildpacksio/pack:latest`
* Use a version tag to pin a specific release:
    * `buildpacksio/pack:{{< latest >}}`
    * [other versions](https://hub.docker.com/r/buildpacksio/pack/tags)

#### Usage

In some container environments you may be required to mount your local Docker daemon's socket.

For example, using the Docker CLI:

```shell
docker run \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD:/workspace -w /workspace \
  buildpacksio/pack build <my-image> --builder <builder-image>
```

---

### Windows
To install `pack` on Windows, the easiest way is to use Chocolatey:
```
choco install pack --version={{< latest >}}
```

Alternatively, you can install the Windows executable for `pack` by downloading the Windows [ZIP file](https://github.com/buildpacks/pack/releases/download/v{{< latest >}}/pack-v{{< latest >}}-windows.zip).

<hr/>

# Auto-completion

To configure your bash shell to load completions for each session, add the following to your `.bashrc` or `.bash_profile`:

```bash
. $(pack completion)
```
