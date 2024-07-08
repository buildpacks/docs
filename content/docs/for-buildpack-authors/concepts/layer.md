+++
title="What is a buildpack dependency layer?"
weight=99
+++

`Dependency layers` are semantically meaningful layers that are contributed by one or more buildpacks during the `build` phase, one for each dependency.

<!--more-->

![builder](/images/builder.svg)

As seen in the image above, buildpacks read application source code and create dependency layers. Each buildpack can contribute a subset of an app's required dependencies; added as subdirectories under the `CNB_LAYERS_DIR` directory. These dependencies are then exported as layers in the final app image or build cache.

The `build` phase runs the build binary of each buildpack that outputs zero or more layers into `$(CNB_LAYERS_DIR)/<buildpack-id>` and writes metadata for each layer as `toml` files in that directory. During the `export` phase, all layers created by the buildpacks are either cached or added to the output application image.
