+++
title="Installing `pack`"
weight=2
creatordisplayname="Luc Perkins"
creatoremail="lucperkins@gmail.com"
lastmodifierdisplayname="Luc Perkins"
lastmodifieremail="lucperkins@gmail.com"
+++

You can install the most recent version of `pack` (version **{{< latest >}}**) as an executable binary on the following operating systems:

* [macOS](#macos)
* [Linux](#linux)
* [Windows](#windows)

## macOS

You can install `pack` on macOS via [Homebrew](#homebrew) or [tarball](#tarball).

### Homebrew

The easiest way to install `pack` on macOS is to use [Homebrew](https://brew.sh):

```shell
brew install pack
```

If you don't have Homebrew installed, you can install it by running:

```shell
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### Tarball

You can also install `pack` on macOS by fetching and unpacking the `pack` tarball from the [releases](https://github.com/buildpack/pack/releases) page on GitHub:

```shell
wget https://github.com/buildpack/pack/releases/download/v{{< latest >}}/pack-{{< latest >}}-macos.tar.gz
tar xvf pack-{{< latest >}}-macos.tar.gz
rm pack-{{< latest >}}-macos.tar.gz
./pack --help
```

From there, you can copy the executable to a directory like `/usr/local/bin` or add the current directory to your `PATH`.

## Linux

```shell
wget https://github.com/buildpack/pack/releases/download/v{{< latest >}}/pack-{{< latest >}}-linux.tar.gz
tar xvf pack-{{< latest >}}-linux.tar.gz
rm pack-{{< latest >}}-macos.tar.gz
./pack --help
```

From there, you can copy the executable to a directory like `/usr/local/bin` or add the current directory to your `PATH`.

## Windows

You can install the Windows executable for `pack` by downloading the Windows [ZIP file](https://github.com/buildpack/pack/releases/download/v{{< latest >}}/pack-{{< latest >}}-windows.zip).

