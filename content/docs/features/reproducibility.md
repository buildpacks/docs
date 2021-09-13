+++
title="Reproducibility"
aliases=["/docs/reference/reproducibility"]
+++

## Summary
The Cloud Native Buildpacks project aims to create "Reproducible Builds" of container images. For image creation commands (`builder create`, `buildpack package`, `build`) `pack` creates container images in a reproducible fashion. "Reproducible" is hard to define but we'll do so by example and with a few caveats:

<!--more-->

## Examples
---
Running `pack build sample-hello-moon:test` multiple times produces a container image with the same image ID (*local* case)

**Given**:
- The same source code
- The same builder image
- The same set of buildpacks (see caveat below).

---
Running `pack build cnbs/sample-hello-world:test --publish` multiple times produces a container image with the same image digest (*remote* case)

**Given**:
- The same source code
- The same builder image
- The same set of buildpacks (see caveat below).

Inspecting the results of the above command, we see the following output:

```bash
$ docker pull cnbs/sample-hello-world:test && docker images --digest # Pull remotely created image and view IDs and Digests
REPOSITORY                                   TAG                 DIGEST                                                                    IMAGE ID            CREATED             SIZE
sample-hello-world                           test                sha256:9e3cfea3f90fb4fbbe855a2cc9ce505087ae10d6805cfcb44bd67a4b72628641   597c49cae461        40 years ago        95.2MB
sample-hello-moon-app                        test                <none>                                                                    86aab15e22b8        40 years ago        43MB
```

### Consequences and Caveats

There are a couple things to note about the above output:
- We achieve reproducible builds by "zeroing" various timestamps of the layers of the output image. When images are inspected they may have confusing creation times (eg. "40 years ago").
- The `cnbs/sample-hello-moon:test` image does not have an entry for the "DIGEST" column. This is because the digest is produced from the image's manifest and a manifest is only created when an image is stored in a remote registry.

The CNB lifecycle cannot fix non-reproducible buildpack layer file contents. This means that the underlying buildpack and language ecosystem have to implement reproducible output (for example `go` binaries are reproducible by default). Buildpacks that produce identical layers given the same input could be said to be reproducible buildpacks.

Running `pack build cnbs/test-image:test && docker push cnbs/test-image:test` and `pack build cnbs/test-image:test --publish` with the same inputs will not produce the same image digest because:
- The remote image will have an image digest reference in the `runImage.reference` field in the `io.buildpacks.lifecycle.metadata` label
- The local image will have an image ID in the `runImage.reference` field in the `io.buildpacks.lifecycle.metadata` label if it was created locally

