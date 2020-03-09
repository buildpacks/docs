+++
title="Reproducible Builds"
weight=9
+++

## Summary
The Cloud Native Buildpacks project aims to create "Reproducible Builds" of container images. For image creation commands (`create-builder`, `package-buildpackag`, `build`) `pack` aims to create in a reproducible fashion. "Reproducible" is hard to define but we'll do so by example:

---
Running `pack build` produce a container image with the same image ID (*local* case)

**Given**:
- A workspace directory containing the same source code
- A builder image with a *given*  
- One or more buildpacks that produce identical layers given their input*

---
Running `pack build --publish` produce a container image with the same image digest (*remote* case)

**Given**:
- A workspace directory containing the same source code
- A builder image with a *given*  
- One or more buildpacks that produce identical layers given their input

### Consequences and Caveats

We achieve reproducible builds by "zeroing" various timestamps of the layers that `pack` creates. When images are inspected (via something like `docker inspect`) they may have confusing creation times:

```bash
REPOSITORY                                   TAG                 IMAGE ID            CREATED             SIZE
cnbs/sample-builder                          <none>              def52b23918d        40 years ago        234MB
sample-kotlin-app                            alpine              45dc2d2681a1        40 years ago        18.9MB
```

All that said, the CNB lifecycle cannot fix non-reproducible buildpack layer file contents. This means that the underlying buildpack and language ecosystem have to implement reproducible output (for example `go` binaries are reproducible by default).

A local and remote build will not produce the same image digest because:
- The remote image will have an image digest reference in the `runImage.reference` field in the `io.buildpacks.lifecycle.metadata` label
- The local image will have an image ID in the `runImage.reference` field in the `io.buildpacks.lifecycle.metadata` label

This occurs because, in the daemon case, the run-image may not have a repository digest reference (if it was created locally). 
