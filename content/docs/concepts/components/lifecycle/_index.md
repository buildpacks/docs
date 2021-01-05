+++
title="Lifecycle"
weight=3
+++

## What is the lifecycle?

The lifecycle orchestrates buildpack execution, then assembles the resulting artifacts into a final app image.

<!--more-->

## Phases

* **Detection** -- Finds an ordered group of buildpacks to use during the build phase.
* **Analysis** -- Restores files that buildpacks may use to optimize the build and export phases. 
* **Build** -- Transforms application source code into runnable artifacts that can be packaged into a container.
* **Export** -- Creates the final OCI image.