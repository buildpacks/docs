+++
title="What is a buildpack dependency layer?"
weight=99
+++

`Dependency layers` are semantically meaningful layers that are contributed by one or more buildpacks during the `build` phase, one for each dependency.

<!--more-->

To better understand dependency layers and how they fit into the larger picture, it's helpful to understand the concept of an `OCI image layer`.

At a high level,  an `OCI image layer` can be seen as a [filesystem changeset](https://github.com/opencontainers/image-spec/blob/main/layer.md) and some accompanying metadata. The ordering of layers is usually important for OCI images; however this is not the case for buildpack contributed layers.

From a buildpack author's perspective, it is helpful to know that the directories created would be mapped to OCI image layers.That being said, the following are different types of layers created when building with buildpacks:

* Base image layers ([build](https://buildpacks.io/docs/for-app-developers/concepts/base-images/build/) and [run](https://buildpacks.io/docs/for-app-developers/concepts/base-images/run/)), which are the layers that make up the underlying OS for the `build-time` container and the `runtime` container, respectively.
* Buildpack-contributed dependency layers, which contain application dependencies, such as language runtime & libraries.
* Application layer(s), which can be thought of as transformation of the application source code into a compiled executable. It's possible to divide an application into several layers—[slices](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/create-slice-layers/)—in order to make updates faster.
* Finally, CNB-contributed layers, such as the `SBOM`, the `launcher` executable, and some configuration for the `launcher`.

Buildpack authors don’t usually have control over the first and last layers added above. However, an ultimate goal for most buildpack authors is keeping layers small, which creates reusable and composable layers. This reduces duplication in what buildpack authors need to maintain and minimizes data transfer to/from the `registry` when builds are rerun.

![builder](/images/builder.svg)

Going back to the concept of `dependency layers` and as seen in the image above, buildpacks read application source code and create dependency layers. Each buildpack can contribute a subset of an app's required dependencies, added as subdirectories under the `CNB_LAYERS_DIR` directory. These dependencies are then exported as layers in the final app image or build cache.

The `build` phase runs the `/bin/build` binary of each buildpack, which outputs zero or more layers into `$(CNB_LAYERS_DIR)/<buildpack-id>` and writes metadata for each layer as `toml` files in that directory. During the `export` phase, all layers created by the buildpacks are either cached or added to the output application image.

The following shows an example filesystem tree created after the `build` phase is complete:

```text

layers/
├── buildpack-1-id
│   ├── layer-1
│   ├── layer-1.toml
│   ├── layer-2
│   └── layer-2.toml
└── buildpack-2-id

```

> For more information about creating `dependency layers`, see [Create dependency layers](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/create-layer/)
