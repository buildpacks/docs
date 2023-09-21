+++
title="Set up your local environment"
weight=401
aliases = [
  "/docs/extension-author-guide/create-extension/setup-local-environment/",
  ]
+++

<!-- test:suite=dockerfiles;weight=1 -->

Let's walk through a build that uses extensions, step by step. We will see an image extension that installs `curl` on
the builder image, and switches the run image to an image that has `curl` installed.

### Ensure Docker is running

<!-- test:exec -->
```bash
docker version
```

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

```bash
cd <your preferred workspace directory>
```

### Ensure pack version supports image extensions

<!-- test:exec -->
```bash
pack version
```

The version should be at least `0.31.0-rc.1`

### Update pack configuration

<!-- test:exec -->
```bash
pack config experimental true
pack config lifecycle-image --unset
```

As base image extension with Dockerfiles is currently an experimental feature, we must enable it in `pack`.
We unset any custom lifecycle image that may have been provided to ensure that the latest version is used.

### Clone the samples repo

<!-- test:exec -->
```bash
git clone https://github.com/buildpacks/samples.git
```

<!--+ if false +-->
---

<a href="/docs/extension-guide/create-extension/why-dockerfiles" class="button bg-pink">Next Step</a>
<!--+ end+-->
