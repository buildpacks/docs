+++
title="Set up your local environment"
weight=401
+++

Let's walk through a build that uses extensions, step by step. We will see an image extension that installs `curl` on
the builder image, and switches the run image to an image that has `curl` installed.

### Ensure Docker is running

`docker version`

If you see output similar to the following, you're good to go! Otherwise, start Docker and check again.

```
Client: Docker Engine - Community
 Version:           20.10.9
 API version:       1.41
 Go version:        go1.16.8
 Git commit:        c2ea9bc
 Built:             Mon Oct  4 16:08:29 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server: Docker Engine - Community
 Engine:
  Version:          20.10.9
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.16.8
  Git commit:       79ea9d3
  Built:            Mon Oct  4 16:06:34 2021
  OS/Arch:          linux/amd64
  Experimental:     false
```

### Setup workspace directory

`workspace=<your preferred workspace directory>`

### Clone the pack repo and build it (FIXME: remove when pack with extensions-phase-2 support is released)

`cd $workspace`

`git clone git@github.com:buildpacks/pack.git`

`cd pack`

`git checkout extensions-phase-2-rc2`

`make clean build`

### Clone the samples repo

`cd $workspace`

`git clone https://github.com/buildpacks/samples.git`

`cd samples`

`git checkout extensions-phase-2` (FIXME: remove when `extensions-phase-2` merged)

<!--+ if false +-->
---

<a href="/docs/extension-author-guide/create-extension/why-dockerfiles" class="button bg-pink">Next Step</a>
<!--+ end+-->
