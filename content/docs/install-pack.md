+++
title="Installing `pack`"
weight=1
creatordisplayname="Andrew Meyer"
creatoremail="ameyer@pivotal.io"
lastmodifierdisplayname="Andrew Meyer"
lastmodifieremail="ameyer@pivotal.io"

+++

## Prerequisites
<a href="https://store.docker.com/search?type=edition&offering=community" target="_blank" class="download-button button icon-button bg-blue">Install Docker</a>


## Supported operating systems
You can install the most recent version of `pack` (version **{{< latest >}}**) as an executable binary on the following operating systems:

* [macOS](#macos)
* [Linux](#linux)
* [Windows](#windows)

### macOS

To install `pack` on macOS, the easiest way is to use Homebrew:

```bash
brew tap buildpack/tap
brew install pack
```

> **Optional:** Enable [auto-completion](#auto-completion)

<hr/>

### Linux

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

You can install the Windows executable for `pack` by downloading the Windows [ZIP file](https://github.com/buildpacks/pack/releases/download/v{{< latest >}}/pack-v{{< latest >}}-windows.zip).

<hr/>

# Auto-completion

To configure your bash shell to load completions for each session, add the following to your `.bashrc` or `.bash_profile`:

```bash
. $(pack completion)
```