+++
title="Building blocks of a CNB Image Extension"
weight=403
aliases = [
  "/docs/extension-author-guide/building-blocks-extension/"
  ]
+++

<!-- test:suite=dockerfiles;weight=3 -->

### Examine `tree` extension

<!-- test:exec -->
```bash
tree $PWD/samples/extensions/tree
```

(That's right, we're using the very tool we will later be installing!) You should see something akin to the following:

```
.
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
├── extension.toml <- similar to a buildpack buildpack.toml
```

* The `extension.toml` describes the extension, containing information such as its name, ID, and version, as well as the
  buildpack API that it implements. Though extensions are not buildpacks, they are expected to conform to the buildpack
  API except where noted. Consult the [spec](https://github.com/buildpacks/spec/blob/main/image_extension.md)
  for further details.
* `./bin/detect` is invoked during the `detect` phase. It analyzes application source code to determine if the extension
  is needed and contributes [build plan](/docs/reference/spec/buildpack-api/#build-plan) entries (much like a
  buildpack `./bin/detect`). Just like for buildpacks, a `./bin/detect` that exits with code `0` is considered to have
  passed detection, and fails otherwise.
* `./bin/generate` is invoked during the `generate` phase (a new lifecycle phase that happens after `detect`). It
  outputs either or both of `build.Dockerfile` or `run.Dockerfile` for extending the builder or run image, respectively.
  * Only a limited set of Dockerfile instructions is supported - consult
    the [spec](https://github.com/buildpacks/spec/blob/main/image_extension.md)
    for further details.
  * In the [initial implementation](/docs/features/dockerfiles#phased-approach), `run.Dockerfile` instructions are
    limited to a single `FROM` instruction (effectively, it is only possible to switch the run-time base image to a
    pre-created image i.e., no dynamic image modification is allowed). Consult
    the [spec](https://github.com/buildpacks/spec/blob/main/image_extension.md)
    for further details.

We'll take a closer look at the executables for the `tree` extension in the next step.

<!--+ if false+-->
---

<a href="/docs/extension-guide/create-extension/build-dockerfile" class="button bg-pink">Next Step</a>
<!--+ end +-->
