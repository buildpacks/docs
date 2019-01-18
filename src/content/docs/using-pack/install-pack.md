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

To install `pack` on macOS, fetch and unpack the tarball:

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
pack-{{< latest >}}-linux.tar.gz
rm pack-{{< latest >}}-macos.tar.gz
./pack --help
```

From there, you can copy the executable to a directory like `/usr/local/bin` or add the current directory to your `PATH`.

## Windows

You can install the Windows executable for `pack` by downloading the Windows [ZIP file](https://github.com/buildpack/pack/releases/download/v{{< latest >}}/pack-{{< latest >}}-windows.zip).