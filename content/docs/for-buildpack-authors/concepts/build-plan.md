+++
title="What is the build plan?"
weight=99
+++

A **build plan** is a `toml` file that is the output of the [detect](https://buildpacks.io/docs/for-buildpack-authors/concepts/lifecycle-phases/#phase-2-detect) phase, in which each component buildpack or image extension may express the dependencies it requires and the dependencies it provides.

<!--more-->

Before we dive into more details, let's explain the difference between three terms relevant to the concept of `build plan`.

* First, the [build plan](https://github.com/buildpacks/spec/blob/main/buildpack.md#build-plan-toml) piece that is contributed by the buildpack during the `detect` phase. This piece is seen as the `build plan` from buildpack's perspective and is written to a temporary directory by the buildpack.

* Second, the concatenation of all buildpacks contributions that passed `detect`, which is considered the true [build plan](https://github.com/buildpacks/spec/blob/main/platform.md#plantoml-toml) from the platform's perspective. This file usually gets written to the `<layers>` directory—unless the platform provided another path for it.

* Finally, the build plan piece that is shown to the buildpack during the `build` phase that is referred to as the [buildpack plan](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpack-plan-toml). This file only contains dependencies that a buildpack is responsible for providing; however a buildpack may choose NOT to provide any of these dependencies, leaving that work for a future buildpack. The `buildpack plan` file is usually written to a temporary directory by the `lifecycle`.

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
* Each pairing of `requires` and `provides` sections (at the top level, or inside of an `or` array) is a potential build plan. For more details, see the [JVM buildpack](https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/use-build-plan/#example-jvm-buildpack) example.
* A group will only pass detection if a valid build plan can be produced from the dependencies that all elements in the group require and provide.
* The `detect` phase could fail if a buildpack requires a dependency that it does not itself provide, or is not provided by another buildpack.
* The `detect` phase could also fail when the buildpacks order is incorrect, i.e, the buildpacks providing dependencies run `after` the buildpacks requiring them.
* The resulting `build plan` is passed as one of the inputs to the `build` phase.

## Resources

For further examples and guidance on using the build plan, see the [how-to page]( https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/use-build-plan/).
