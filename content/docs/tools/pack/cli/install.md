+++
title="Install"
weight=1
aliases=["/docs/install-pack/"]
summary="How to install the `pack` CLI using various methods."
+++

## Supported operating systems
You can install the most recent version of `pack` (version **{{< latest >}}**) as an executable binary on the following operating systems:

* [Linux](#linux)
* [macOS](#macos)
* [Windows](#windows)

---

# Linux

## Distro-Specific

#### Arch Linux

- [pack-cli](https://aur.archlinux.org/packages/pack-cli/)
- [pack-cli-bin](https://aur.archlinux.org/packages/pack-cli-bin/)

## Homebrew

```bash
brew install buildpacks/tap/pack
```

## Command

`pack` is available on GitHub releases so you can directly get and install it.

```bash
(curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.13.1/pack-v{{< latest >}}-linux.tgz" | sudo tar -C /usr/local/bin/ --no-same-owner -xzv pack)
```

> **Optional:** Enable [auto-completion](#auto-completion)

---

# macOS

## Homebrew

To install `pack` on macOS, the easiest way is to use Homebrew:

```bash
brew install buildpacks/tap/pack
```

> **Optional:** Enable [auto-completion](#auto-completion)

---

## Windows
To install `pack` on Windows, we recommend using [Chocolatey](https://chocolatey.org/):
```
choco install pack --version={{< latest >}}
```
or [scoop](https://scoop.sh/):
```
scoop install pack
```

Alternatively, you can install the Windows executable for `pack` by downloading the Windows [ZIP file](https://github.com/buildpacks/pack/releases/download/v{{< latest >}}/pack-v{{< latest >}}-windows.zip).

---

## Ready-to-Run Container Images

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


# Auto-completion

To configure your bash shell to load completions for each session, add the following to your `.bashrc` or `.bash_profile`:

```bash
. $(pack completion)
```

# Reference

To learn how to use `pack`, just run:

```bash
pack help
```

or check out the [documentation](/docs/tools/pack/cli/) here.
