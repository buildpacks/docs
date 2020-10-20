+++
title="Pack"
include_summaries=false
expand=false
aliases=["/docs/install-pack/", "/docs/tools/pack/cli/install/"]
+++

Pack is a tool maintained by the Cloud Native Buildpacks project to support the use of buildpacks. It enables the following functionality:

1. [`build`][build] an application using buildpacks.
1. [`rebase`][rebase] application images created using buildpacks.
1. Creation of various [components][components] used within the ecosystem.

Pack works as both a [Command Line Interface (CLI)](#pack-cli) and a [Go library](#go-library).

---

## `pack` CLI

### Install

You can install the most recent version of the `pack` CLI (version **{{< pack-version >}}**) on the following operating systems:

{{< pack-install >}}


##### Auto-completion

If you are using `bash`, you can configure your `bash` shell to load completions for each session. 

Add the following to your `.bashrc` or `.bash_profile`:

```bash
. $(pack completion)
```

### References

- [Docs](/docs/tools/pack/cli/pack/)
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

[build]: /docs/concepts/operations/build/
[rebase]: /docs/concepts/operations/rebase/
[components]: /docs/concepts/components/