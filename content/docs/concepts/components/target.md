+++
title="Targets"
weight=4
aliases=[
    "/docs/using-pack/targets/"
]
+++

## What is a Target?

A target is the essential information about an operating system and architecture necessary to ensure that binaries will be placed in environments where they can execute successfully.
A buildpack may specify one or several targets. A build image or run image must specific one target. 


For full documentation see the (RFC where targets are introduced)[https://github.com/buildpacks/rfcs/blob/main/text/0096-remove-stacks-mixins.md].

### Example
```
[[targets]]
os = "linux"
arch = "amd64"
[[targets.distributions]]
name = "ubuntu"
versions = ["18.04", "20.04"]
```

