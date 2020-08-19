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

<hr/>

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
