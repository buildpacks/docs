+++
title="Installing `pack`"
weight=1
creatordisplayname="Andrew Meyer"
creatoremail="ameyer@gmail.com"
lastmodifierdisplayname="Andrew Meyer"
lastmodifieremail="ameyer@gmail.com"
+++

You can install the most recent version of `pack` (version **{{< latest >}}**) as an executable binary on the following operating systems:

* [macOS](#macos)
* [Linux](#linux)
* [Windows](#windows)

## macOS

To install `pack` on macOS, the easiest way is to use Homebrew:

```bash
$ brew tap buildpack/tap
$ brew install pack
```

To install manually instead, fetch and unpack the tarball:

```bash
$ wget https://github.com/buildpack/pack/releases/download/v{{< latest >}}/pack-{{< latest >}}-macos.tar.gz
$ tar xvf pack-{{< latest >}}-macos.tar.gz
$ rm pack-{{< latest >}}-macos.tar.gz
$ ./pack --help
```

From there, you can copy the executable to a directory like `/usr/local/bin` or add the current directory to your `PATH`.

## Linux

```bash
$ wget https://github.com/buildpack/pack/releases/download/v{{< latest >}}/pack-{{< latest >}}-linux.tar.gz
$ tar xvf pack-{{< latest >}}-linux.tar.gz
$ rm pack-{{< latest >}}-macos.tar.gz
$ ./pack --help
```

From there, you can copy the executable to a directory like `/usr/local/bin` or add the current directory to your `PATH`.

## Windows

You can install the Windows executable for `pack` by downloading the Windows [ZIP file](https://github.com/buildpack/pack/releases/download/v{{< latest >}}/pack-{{< latest >}}-windows.zip).

