+++
title="What is a buildpack group?"
aliases=[
  "/docs/concepts/components/buildpack-group"
]
weight=2
+++

A buildpack group is a list of individual buildpacks that are designed to work together to build an application.

<!--more-->

Buildpack groups allow you to connect multiple modular buildpacks together, making buildpacks modular and re-usable.

For example, you might have a buildpack that installs Java and a buildpack that uses Maven to build your application. These two buildpacks can be combined into a group to implement higher-level functionality, specifically that the first one will install Java and the second will use Java to run Maven, which is a Java build tool.

Because you can have many buildpack groups in a [builder][builder] or [composite buildpack][composite buildpack] (sometimes referred to as a "meta buildpack"),
and you can reuse buildpacks, you could have a second buildpack group that reuses the buildpack to provide Java but uses a third buildpack that provides Gradle to build your application. By doing this, you can create additional high-level functionality without having duplication.

## Anatomy of a buildpack group

A [buildpack group][buildpack-group] is a list of buildpack entries defined in the order in which they will run.

A buildpack entry is identified by an id and a version. It may also be marked as optional. While you may have one or more buildpacks in a buildpack group, you may have one or more buildpack groups in a builder or composite buildpack.

## Detection with buildpack groups

A [builder][builder] or [composite buildpack][composite buildpack] may contain multiple buildpack groups. When the lifecycle executes the detection process, it will process each buildpack group it finds in the order that the groups are specified. For each buildpack group, the lifecycle will execute the detect phase of all buildpacks in that group (these can be executed in parallel) and aggregate the results. The lifecycle will select the first buildpack group by order where all of the non-optional buildpacks in that group pass detection.

For example, if a builder has buildpack groups A, B and C. The lifecycle will run detection against A. If all of the non-optional buildpacks in that group pass detection, then it will select A. In that case, B and C will not be processed. If A has any failing non-optional buildpacks, then the lifecycle will move on to process buildpack group B. If B has any failing non-optional buildpacks, then the lifecycle will move on to process buildpack group C. If C fails, then the entire detection process will fail.

If a buildpack group contains composite buildpacks, which in turn may contain more buildpack groups those are expanded using [the order resolution rules][order-resolution] such that each buildpack group in the composite buildpack is tried with the other buildpacks in the containing buildpack group.

For example:

- the builder has a buildpack group A that contains buildpacks X, Y and Z
- Y is a composite buildpack containing buildpack groups B and C
- buildpack group B contains buildpacks T and U
- buildpack group C contains buildpacks V and W

The lifecycle will expand this into the following buildpack groups:

- X, T, U, Z
- X, V, W, Z

Y is not included because composite buildpacks only provide groups, they do not participate in the build process or contain build/detect binaries.

The [order resolution rules in the buildpacks spec][order-resolution] contains additional examples that illustrate more complex scenarios.

After the buildpack groups are expanded they are processed in the same way and have the same requirements for selection that are defined above.

### Resources

The [Operator's Guide][operator-guide] has more information on creating builders and defining order groups in builders.

[buildpack-group]: /docs/reference/config/builder-config/#order-_list-required_
[order-resolution]: https://github.com/buildpacks/spec/blob/main/buildpack.md#order-resolution
[operator-guide]: /docs/for-platform-operators/
[builder]: /docs/for-platform-operators/concepts/builder/
[composite buildpack]: /docs/for-buildpack-authors/concepts/composite-buildpack
