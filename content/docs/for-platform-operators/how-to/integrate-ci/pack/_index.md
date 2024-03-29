
+++
title="Pack"
aliases=[
  "/docs/install-pack/",
  "/docs/tools/pack/",
  "/docs/tools/pack/cli/install/"
]
weight=1
+++

Pack is a CLI tool maintained by the CNB project to support the use of buildpacks.

<!--more-->

It enables the following functionality:

1. [`build`][build] an application using buildpacks.
1. [`rebase`][rebase] application images created using buildpacks.
1. Creation of various [components][components] used within the ecosystem.

Pack works as both a [Command Line Interface (CLI)](#pack-cli) and a [Go library](#go-library).

---

## `pack` CLI

### Install

You can install the most recent version of the `pack` CLI (version **{{< pack-version >}}**) on the following operating systems:

{{< pack-install >}}

#### RCs
Prior to publishing releases, we publish RC (release candidate) builds of `pack`. You can install those by downloading the releases from the [releases page on GitHub][github-releases].

#### Auto-completion

`pack` supports shell completions for the following shells -

* `bash`
* `fish`
* `zsh`

To configure your `bash` shell to load completions for each session, add the following to your `.bashrc` or `.bash_profile`:

```bash
. $(pack completion)
```

To configure your `fish` shell to load completions for each session, add the following to your `~/.config/fish/config.fish`:

```bash
source (pack completion --shell fish)
```

To configure your `zsh` shell to load completions for each session, add the following to your `.zshrc`:

```bash
. $(pack completion --shell zsh)
```

### References

- [Docs](/docs/for-platform-operators/how-to/integrate-ci/pack/cli/pack/)
- [Source](https://github.com/buildpacks/pack/)

---

## Go library

### Install

```shell
go get -u github.com/buildpacks/pack    
```

### References

- [Docs](https://pkg.go.dev/github.com/buildpacks/pack)
- [Source](https://github.com/buildpacks/pack/)

[build]: /docs/for-app-developers/concepts/build/
[rebase]: /docs/for-app-developers/concepts/rebase/
[components]: /docs/for-platform-operators/concepts/
[github-releases]: https://github.com/buildpacks/pack/releases
