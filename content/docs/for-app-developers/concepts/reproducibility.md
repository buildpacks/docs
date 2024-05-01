
+++
title="What is build reproducibility?"
aliases=[
  "/docs/features/reproducibility",
  "/docs/reference/reproducibility"
]
weight=6
+++

Given the same inputs, two builds should produce the same outputs.

<!--more-->

## Summary

The Cloud Native Buildpacks project aims to create "Reproducible Builds" of container images.

For image creation commands (`builder create`, `buildpack package`, `build`) `pack` creates container images in a reproducible fashion.

"Reproducible" is hard to define, but we'll do so by example and with a few caveats:

## Examples
---
Running `pack build sample-hello-moon:test` multiple times produces a container image with the same image ID (*local* case)

**Given**:
- The same source code
- The same builder image
- The same set of buildpacks (see caveat below).

---
Running `pack build registry.example.com/example/sample-hello-world:test --publish` multiple times produces a container image with the same image digest (*remote* case)

**Given**:
- The same source code
- The same builder image
- The same set of buildpacks (see caveat below).

Inspecting the results of the above command, we see the following output:

```bash
$ docker pull registry.example.com/example/sample-hello-world:test && docker images --digests # Pull remotely created image and view IDs and Digests
REPOSITORY                                        TAG    DIGEST                                                                    IMAGE ID       CREATED         SIZE
registry.example.com/example/sample-hello-world   test   sha256:9e3cfea3f90fb4fbbe855a2cc9ce505087ae10d6805cfcb44bd67a4b72628641   597c49cae461   40 years ago    95.2MB
sample-hello-moon                                 test   <none>                                                                    86aab15e22b8   40 years ago    43MB
```

### Consequences and Caveats

There are a couple of things to note about the above output:
- We achieve reproducible builds by "zeroing" various timestamps of the layers of the output image. When images are inspected they may have confusing creation times (eg. "40 years ago").
- The `sample-hello-moon:test` image does not have an entry for the "DIGEST" column. This is because the digest is produced from the image's manifest and a manifest is only created when an image is stored in a remote registry.

The CNB lifecycle cannot fix non-reproducible buildpack layer file contents. This means that the underlying buildpack and language ecosystem have to implement reproducible output (for example `go` binaries are reproducible by default). Buildpacks that produce identical layers given the same input could be said to be reproducible buildpacks.

Even with the same inputs, running two commands below will not produce the same image digest.

```bash
# pack build and docker push
$ pack build registry.example.com/example/test-image:test && docker push registry.example.com/example/test-image:test

# pack build with "--publish" flag
$ pack build registry.example.com/example/test-image:test --publish
```

This is because: 
- The remote image will have an image digest reference in the `runImage.reference` field in the `io.buildpacks.lifecycle.metadata` label
- The local image will have an image ID in the `runImage.reference` field in the `io.buildpacks.lifecycle.metadata` label if it was created locally
