
+++
title="The building blocks of a CNB image extension"
aliases=[
  "/docs/extension-author-guide/building-blocks-extension/",
  "/docs/extension-guide/create-extension/building-blocks-extension"
]
weight=3
+++

<!--more-->

<!-- test:suite=dockerfiles;weight=3 -->

### Examine `vim` extension

<!-- test:exec -->
```bash
tree $PWD/samples/extensions/vim
```

You should see something akin to the following:

```
.
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
├── extension.toml <- similar to a buildpack buildpack.toml
```

* The `extension.toml` describes the extension, containing information such as its name, ID, and version, as well as the
  Buildpack API that it implements. Though extensions are not buildpacks, they are expected to conform to the Buildpack
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

We'll take a closer look at the executables for the `vim` extension in the next step.
For guidance around writing extensions and more advanced use cases, see [here](/docs/for-buildpack-authors/how-to/write-extensions).

<!--+ if false+-->
---

<a href="/docs/for-buildpack-authors/tutorials/basic-extension/04_build-dockerfile" class="button bg-pink">Next Step</a>
<!--+ end +-->
