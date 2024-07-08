+++
title="What is the build plan?"
weight=99
+++

A **build plan** is a `toml` file that is the output of the [detect](https://buildpacks.io/docs/for-buildpack-authors/concepts/lifecycle-phases/#phase-2-detect) phase, in which each component buildpack or image extension may express the dependencies it requires and the dependencies it provides.

<!--more-->

## Example Build Plan (toml)

In order to make contributions to the `Build Plan`, a `/bin/detect` executable MUST write entries to `<plan>` in two sections: `requires` and `provides`. The generated `plan.toml` file is usually added under the `<layers>`directory.
The `requires` and `provides` sections MAY be repeated together inside of an `or` array at the top-level.  
Each `requires` and `provides` section MUST be a list of entries formatted as shown below:

```toml
[[provides]]
name = "<dependency name>"

[[requires]]
name = "<dependency name>"

[requires.metadata]
# buildpack-specific data

[[or]]

[[or.provides]]
name = "<dependency name>"

[[or.requires]]
name = "<dependency name>"

[or.requires.metadata]
# buildpack-specific data

```  

## Key Points
  
* A valid `build plan` is a plan where all required dependencies are provided in the necessary order, meaning that during the `build` phase, each component buildpack will have its required dependencies provided by component buildpack or an image extension that runs before it.
* Each pairing of `requires` and `provides` sections (at the top level, or inside of an `or` array) is a potential Build Plan.
* A group will only pass detection if a valid build plan can be produced from the dependencies that all elements in the group require and provide.
* The `detect` phase could fail if a buildpack requires a dependency that it does not itself provide, or is not provided by another buildpack.
* The `detect` phase could also fail when the buildpacks order is incorrect, i.e, the buildpacks providing dependencies run `after` the buildpacks requiring them.
* The resulting `build plan` is passed as one of the inputs to the `build` phase.
