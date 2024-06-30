+++
title="Use the build plan"
weight=2
+++

The [Build Plan](https://github.com/buildpacks/spec/blob/main/buildpack.md#build-plan-toml) is a document that buildpacks can use to pass information between the `detect` and `build` phases, and between each other.
The build plan is passed (by the lifecycle) as a parameter to the `detect` and `build` binaries of each buildpack.

<!--more-->

During the `detect` phase, each buildpack may write something it `requires` or `provides` (or both) into the Build Plan.
A buildpack can `require` or `provide` multiple dependencies, and even multiple groupings of dependencies (using `or` lists).
Additionally, multiple buildpacks may `require` or `provide` the same dependency.
For detailed information, consult the [spec](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpack-plan-toml).

The lifecycle uses the Build Plan to determine whether a particular list of buildpacks can work together,
by seeing whether all dependencies required can be provided by that list.

Later, during the `build` phase, each buildpack may read the Buildpack Plan (a condensed version of the Build Plan, composed by the lifecycle) to determine what it should do.

Let's see how this works with an example.

### Example: `node-engine` buildpack

Let's walk through some possible cases a `node-engine` buildpack may consider:

1. Nothing in the app explicitly calls out that it is needed
2. It is explicitly referred to in some configuration file

We will also consider what an `NPM` and a `JVM` buildpack may do.

#### Scenario 1: No Explicit Request

A `node-engine` buildpack is always happy to `provide` the `node` dependency. The build plan it will write may look something like:

```toml
[[provides]]
name = "node"
```

> **NOTE:** If this was the only buildpack running, this would fail the `detect` phase. In order to pass, every `provides` must be matched up with a `requires`, whether in the same buildpack or in another buildpack.
> See the [spec](https://github.com/buildpacks/spec/blob/main/buildpack.md#phase-1-detection) for particulars on how ordering buildpacks can adjust detection results.

#### Scenario 2: One Version Requested

During the `detect` phase, the `node-engine` buildpack sees in one configuration file (e.g. a `.nvmrc` file in the app directory) that `node v10.x` is explicitly requested by the application. Seeing that, it may write the below text to the build plan:

```toml
[[provides]]
name = "node"

[[requires]]
name = "node"
version = "10.x"

[requires.metadata]
version-source = ".nvmrc"
```

As always, the buildpack `provides` `node`. In this particular case, a version of `node` (`10.x`) is being requested in a configuration file (`.nvmrc`). The buildpack chooses to add an additional piece of metadata (`version-source`), so that it can understand where that request came from.

#### NPM Buildpack

`NPM` is the default package manager for `node`. A NPM Buildpack may ensure that all the packages for the application are present (by running `npm install`), and perhaps cache those packages as well, to optimize future builds.

NPM is typically distributed together with node. As a result, a NPM buildpack may require `node`, but not want to `provide` it, trusting that the `node-engine` buildpack will be in charge of `providing` `node`.

The NPM buildpack could write the following to the build plan, if the buildpack sees that `npm` is necessary (e.g., it sees a `package.json` file in the app directory):

```toml
[[requires]]
name = "node"
```

If, looking in the `package.json` file, the NPM buildpack sees a specific version of `node` requested in the [engines](https://docs.npmjs.com/files/package.json#engines) field (e.g. `14.1`), it may write the following to the build plan:

```toml
[[requires]]
name = "node"
version = "14.1"

[requires.metadata]
version-source = "package.json"
```

> **NOTE:** As above, if this was the only buildpack running, this would fail the `detect` phase. In order to pass, every `provides` must be matched up with a `requires`, whether in the same buildpack or in another buildpack.
> See the [spec](https://github.com/buildpacks/spec/blob/main/buildpack.md#phase-1-detection) for particulars on how ordering buildpacks can adjust detection results.

However, if the NPM Buildpack was run together with the Node Engine buildpack (which `provides` `node`), the lifecycle will see that all requirements are fulfilled, and select that group as the correct set of buildpacks.

### Example: JVM buildpack

Java is distributed in two formats - the `jdk` (Java Development Kit), which allows for compilation and running of Java programs, and the `jre` (Java Runtime Environment,  which allows for running compiled Java programs).
A very naive implementation of the buildpack may have it write several `provides` options to the build plan, detailing everything that it can provide,
while later buildpacks would figure out based on the application which options it requires, and would `require` those.
In this particular case, we can use the `or` operator to present different possible build plans the buildpack can follow:

```toml
# option 1 (`jre` and `jdk`)
[[provides]]
name = "jre"

[[provides]]
name = "jdk"

# option 2 (or just `jdk`)
[[or]]
[[or.provides]]
name = "jdk"

# option 3 (or just `jre`)
[[or]]
[[or.provides]]
name = "jre"
```

The buildpack gives three options to the lifecycle:

* It can provide a standalone `jre`
* It can provide a standalone `jdk`
* It can provide both the `jdk` and `jre`

As with the other buildpacks, this alone will not be sufficient for the lifecycle. However, other buildpacks that follow may `require` certain things.

For example, another buildpack may look into the application and, seeing that it is a Java executable, `require` the `jre` in order to run it.
When the lifecycle analyzes the results of the `detect` phase, it will see that there is a buildpack which provides `jre`, and a buildpack that requires `jre`,
and will therefore conclude that those options represent a valid set of buildpacks.
