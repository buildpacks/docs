+++
title="What is the lifecycle?"
weight=1
+++

The lifecycle is a binary responsible for orchestrating buildpacks.

<!--more-->

There are five phases to a buildpacks build.

We work through a full example of building a "hello world" NodeJs web application.  

In the example we run `pack` on the NodeJS application to produce an application image.  We assume that we have a NodeJS buildpack, `registry.fake/buildpacks/nodejs:latest`, that is decomposed into buildpacks that help with the build.  We expand each of the buildpacks phases to explain the process.  Throughout the example we take a production-level view of their operation.  For example, our assumed NodeJS buildpack will be described to create different build, cache and launch layers in a manner similar to how a real NodeJS buildpack would operate.

## NodeJS buildpack

The example NodeJS buildpack is a meta-buildpack.  It is composed of

* `node-engine` buildpack that provides the `node` and `npm` binaries,
* `yarn` buildpack that provides the `yarn` binary,
* `yarn-install` and `npm-install` buildpacks that install dependencies using either `yarn` or `npm`,
* `yarn-start` and `npm-start` buildpacks that configure the entrypoint to the application image,
* `procfile` a buildpack that allows developers to provide a [Heroku-style](https://devcenter.heroku.com/articles/procfile#procfile-format) entrypoint for the image.

The `nodejs` buildpack itself is a meta-buildpack which defines two **order groups**.  Here we represent the order groups visually:

![nodejs order groups](/images/order-groups.svg)

The order group containing `yarn` logic has higher precedence in the `nodejs` buildpack than the order group containing `npm-install`.  In both order groups the `procfile` buildpack is optional.  The function of order groups will become more clear as we proceed through our example.

## Running `pack`

Our example NodeJS application is a "hello world" REST-like API.  Any request to the `/` URL results in the response `{"message": "Hello world"}`.  Our application contains the two source files

```command
$ tree .
.
├── index.js
└── package.json

0 directories, 2 files
```

The core logic is contained in `index.js`, our dependencies are declared in `package.json` and `package.json` also describes how to start our application.  The logic in `index.js` listens on a `PORT`, provided as an environment variable:

```js
const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send({'message': 'Hello World'})
})

var port = process.env.PORT || '8080';
app.listen(port)
```

The dependencies are provided using the mechanism an NodeJS developer expects.  In this example we depend upon `express` to provide a framework for our REST-like service.

```json
{
  "name": "hello-world",
  "version": "1.0.0",
  "description": "A hello-world nodejs example",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.1"
  }
}
```

Finally, we describe the container entrypoint using a script in the `package.json`.  The script must be named `start` according to NodeJS convention.   Here we see that the entrypoint should run the provided `node index.js` command.

We build our application using the default builder and specify to only use the `nodejs` meta-buildpack in the build.  The restriction to use only the `nodejs` meta-buildpack simplifies the explanation as that buildpack provides only two order groups.

<asciinema-player
  idle-time-limit="0.5s"
  font-size="medium"
  poster="data:text/plain,$ pack build example --verbose --buildpack docker://registry.fake/buildpacks/nodejs:latest" src="/images/pack-hello-world-nodejs.cast"></asciinema-player>

Now that we understand the example application we can step through each of the Buildpack phases.

## Phases

There are five phases to a buildpacks build.  These logic for each phase is provided by a binary within [`lifecycle`](https://github.com/buildpacks/lifecycle) and the orchestration of running each of the binaries is the responsibility of the Buildpacks platform.  In this case we are using `pack` as our Buildpacks platform.

At a high-level each layer:

* Analyze phase - Reads metadata from any previously built image and ensures we have access to the OCI registry to be able to write the image we will build.
* Detect phase - Chooses buildpacks (via /bin/detect) and produces a build plan.
* Restore phase - Restores layer metadata from the previous image and from the cache, and restores cached layers.
* Build phase - Executes buildpacks (via /bin/build).
* Export phase - Creates an image and caches layers.

We consider each of the buildpacks phases in the context of our invocation of `pack build example --buildpack docker://registry.fake/buildpacks/nodejs:latest`.

### Phase 1: Analyze

The analyze phase checks a registry for previous images called `example`.  It resolves the image metadata making it available to the subsequent restore phase.  In addition, analyze verifies that we have write access to the registry to create or update the image called `example`.

In our case `pack` tells us that there is no previous `example` image.  It provides the output.

```
Previous image with name "example" not found
Analyzing image "98070ee549c522cbc08d15683d134aa0af1817fcdc56f450b07e6b4a7903f9b
0"
```

The analyze phase writes to disk the metadata it has found.  The metadata is used by the restore phase when restoring cached image layers.

### Phase 2: Detect

The detect phase runs the `detect` binary of each buildpack in the order provided in the buildpack metadata.

The invocation of `pack build example --buildpack docker://registry.fake/buildpacks/nodejs:latest` explicitly defines a buildpack order.  The command line invocation includes a single `nodejs` buildpack.   In our example the detect phase runs the `detect` binary from each buildpack in the first order group.  The `yarn-install` `detect` binary will fail as no yarn lock file is present in our source project.  As the `detect` binary of a non-optional buildpack has failed, then detection of the entire build group containing `yarn-install` has failed.  The detect phase then proceeds to run the `detect` binary of each buildpack in the second order group.  As all non-optional buildpacks in this group have passed the detect phase, all the passing buildpacks are added to the build order.

![nodejs order groups](/images/order-groups-detect.svg)

<!-- ALERT-NOTE -->
> The [specification for order resolution](https://github.com/buildpacks/spec/blob/main/buildpack.md#order-resolution) shows each order group as a matrix and the resolution as an operation on matrices.

The above diagram shows that the `detect` binary of each required buildpack in the second order group passes.  The detect phase is summarized by pack as

```
===> DETECTING
======== Output: example/yarn-install@0.0.2 ========
failed
======== Output: example/yarn-start@0.0.3 ========
failed
======== Results ========
pass: example/node-engine@0.0.5
pass: example/yarn@0.0.3
fail: example/yarn-install@0.0.2
fail: example/yarn-start@0.0.3
skip: example/procfile@0.0.2
======== Results ========
pass: example/node-engine@0.0.5
pass: example/npm-install@0.0.2
pass: example/npm-start@0.0.2
skip: example/procfile@0.0.2
Resolving plan... (try #1)
fail: example/npm-install@0.0.2 requires npm
Resolving plan... (try #2)
3 of 4 buildpacks participating
example/node-engine 0.0.5
example/npm-install 0.0.2
example/npm-start   0.0.2
```

The output of the detect phase includes a **build plan**.

> The build plan is a toml file containing declarations of what each buildpack provides and what it requires.

For example, the `example/node-engine` buildpack will contribute metadata stating that it provides `node`.  In addition, it declares a requirement for the subsequent build phase to satisfy the `node` with some specific metadata.  That is to say, it requires that the build phase installs a node 14.17.5 runtime.

```toml
[[provides]]
    name = "node"

[[requires]]
    name = "node"
    [requires.metadata]
        version = "14.17.5"
        version-source = "14.17.5"
```

The `npm-install` `detect` binary contributes more metadata to the build plan. `npm-install` requires that a node runtime available.  We will find that the `example/node-engine` buildpack will satisfy that requirement.  `npm-install` also requires that the build phase satisfies the `npm` requirement.  It is interesting to note that the `npm-install` detect phase attaches additional `build = true` metadata to each of its requirements.  We will see that this is interpreted by the build phase as the `node` runtime and `npm` install process contributing **build layers** i.e. as layers that are available to subsequent buildpacks for the purposes of building the application.

```toml
[[provides]]
   name = "npm"

[[requires]]
    name = "node"
    [requires.metadata]
        build = true

[requires]
    name = "npm"
    [entries.requires.metadata]
        build = true
```

The `detect` binary of `npm-start` detects the existence of a `start` command within `package.json`.  If such a command exists it contributes requirements to the build plan that require `node` and `npm` to be available within a **launch layer** i.e. as layers in the output image.

```toml
[[requires]]
    name = "node"
    [requires.metadata]
        launch = true

[[requires]]
    name = "npm"
    [requires.metadata]
        launch = true
```

The build plans provided by each `detect` binary are resolved as an output of the detect phase.  The detect phase can fail if a buildpack requires a dependency that cannot be resolved.

We have provided a complete example of the detect phase for our "hello world" NodeJS application.  Given input application code and buildpacks, the output is largely a declarative TOML file passed to the build phase.  The detected order is written to a `group.toml` file which is used in the restore phase.

### Phase 3: Restore

The restore phase uses metadata provided by the analyze phase and `group.toml` from the detect phase.  It outputs cached layers to `$CNB_LAYERS_DIR/<buildpack-id>` in the application image.  If a layer is restored at the restore phase then we skip the build phase for that layer. 

In our running example there is no previous build.  The analyze phase returned no cached image.  Therefore the restore phase is similarly quiet and `pack` outputs the following:

```
===> RESTORING
Reading buildpack directory: /layers/example_node-engine
Not restoring "example/node-engine:node" from cache, marked as launch=true
Reading buildpack directory: /layers/example_npm-install
Not restoring "example/npm-install:modules" from cache, marked as launch=true
Not restoring "example/npm-install:npm-cache" from cache, marked as launch=true
Reading buildpack directory: /layers/example_npm-start
Reading buildpack directory: /layers/example_procfile
Reading buildpack directory: /layers/example_node-engine
Reading buildpack directory: /layers/example_npm-install
Reading buildpack directory: /layers/example_npm-start
Reading buildpack directory: /layers/example_procfile
```

Having resolved the build plan and any cached layers, the build phase can concentrate on creating layers.

### Phase 4: Build

The build phase is provided as input the order in which to run the buildpacks (`group.toml`) and the build plan (`plan.toml`).  The build phase runs the `build` binary of each buildpack.  The build binary for a buildpack outputs zero or more layers into `$(CNB_LAYERS_DIR)/<buildpack-id>` and writes metadata for each layer as TOML files in that directory.  Buildpacks should also provide Software Bill-of-Materials for each layer that they contribute to the build.

In our running NodeJS example the build phase runs the `build` binary from the

* `example/node-engine` buildpack, followed by
* `example/node-install`, followed by
* `example/node-start`, and finally
* `example/procfile`.

In this example, each buildpack contributes a single layer to the output image.

Each invocation of `build` is passed a **buildpack plan** specific to each buildpack.  The buildpack plan are those entries from the build plan that reference something provided by that buildpack.

#### `node-engine` build execution

The `example/node-engine` buildpack provides `node`.  Therefore all entries in the build plan that require `node` are passed in the buildpack plan for this buildpack.  The buildpack plan provided to `example/node-engine` in this example is

```toml
[[entries]]
    name = "node"

[entries.metadata]
    version = "14.17.5"
    version-source = "14.17.5"

[entries.metadata]
    build = true

[entries.metadata]
    launch = true
```

Given the metadata from the buildpack plan, an archive containing `node` version `14.17.5` is fetched from a network source and expanded as a layer contributed by this buildpack.

```
===> BUILDING
Starting build
Running build for buildpack example/node-engine@0.0.5
Looking up buildpack
Finding plan
Running build for buildpack node-engine 0.0.5
Creating plan directory
Preparing paths
Running build command
node-engine 0.0.5
  Resolving Node Engine version
    Candidate version sources (in priority order):
                -> ""
      <unknown> -> ""

    Selected Node Engine version (using ): 14.17.5

  Executing build process
    Installing Node Engine 14.17.5
      Completed in 31.715s

  Configuring build environment
    NODE_ENV     -> "production"
    NODE_HOME    -> "/layers/example_node-engine/node"
    NODE_VERBOSE -> "false"

  Configuring launch environment
    NODE_ENV     -> "production"
    NODE_HOME    -> "/layers/example_node-engine/node"
    NODE_VERBOSE -> "false"

    Writing profile.d/0_memory_available.sh
      Calculates available memory based on container limits at launch time.
      Made available in the MEMORY_AVAILABLE environment variable.

Processing layers
Updating environment
Reading output files
Updating buildpack processes
Updating process list
Finished running build for buildpack example/node-engine@0.0.5
```

The `node-engine` buildpack contributes a layer containing `bin/node`, the supporting libraries for `bin/node` and sets environment variables that are specific to the node binary.

#### `npm-install` build execution

The `npm-install` buildpack contributes at least two layers.  One layer is a cache-only layer and is never exported as part of the application image.  The cache layer holds `npm` metadata and the installed `node_modules`.  If `npm` is also required to provide a launch layer, as it is in our running example, then the `node_modules` of the cache layer are provided as a layer in the application image.  In addition, a script is provided to set up some symlinks.  The script executes on container startup ensuring that our `index.js` can resolve JavaScript modules installed in the layer.

```
Running build for buildpack example/npm-install@0.0.2
Looking up buildpack
Finding plan
Running build for buildpack npm-install 0.0.2
Creating plan directory
Preparing paths
Running build command
npm-install 0.0.2
  Resolving installation process
    Process inputs:
      node_modules      -> "Not found"
      npm-cache         -> "Not found"
      package-lock.json -> "Found"

    Selected NPM build process: 'npm ci'

  Executing build process
    Running 'npm ci --unsafe-perm --cache /layers/example_npm-install/npm-cache'
      Completed in 11.255s

  Configuring launch environment
    NPM_CONFIG_LOGLEVEL -> "error"

  Configuring environment shared by build and launch
    PATH -> "$PATH:/layers/example_npm-install/modules/node_modules/.bin"


Processing layers
Updating environment
Reading output files
Updating buildpack processes
Updating process list
Finished running build for buildpack example/npm-install@0.0.2
```

In the verbose output of an execution of `npm-install`'s `build` binary we can observe that the `NPM_CONFIG_LOGLEVEL` environment variable is set on the application image and the `PATH` environmental variable is extended so that binaries installed via `npm` can be found.

#### `npm-start` build execution

The `npm-start` build phase creates an entrypoint in the application image.

```
Running build for buildpack example/npm-start@0.0.2
Looking up buildpack
Finding plan
Running build for buildpack npm-start 0.0.2
Creating plan directory
Preparing paths
Running build command
npm-start 0.0.2
  Assigning launch processes
    web: node index.js

Processing layers
Updating environment
Reading output files
Updating buildpack processes
Updating process list
Finished running build for buildpack example/npm-start@0.0.2
```

The output layers contributed by each buildpack are then exported as an OCI image.

### Phase 5: Export

The export phase constructs a new OCI image using all the layers provided in the build phase.  In addition the application source is added as a layer to the output image and the image `ENTRYPOINT` is set.  The exported image, which we call `example`, contains only launch layers.  Cache layers are preserved on the local machine for subsequent builds.

Our NodeJS example image requires an entrypoint called `web`.  The `web` entrypoint is implemented on the application image as a symlink to the `launcher` binary.  As we have specified a single entrypoint, this then becomes the default entrypoint of the image.

## Summary

We have taken a detailed look at how buildpacks are used to build a sample application.  The meta-buildpack contains two order groups and we have seen examples of how an order group is resolved.  In addition we have looked at the contributions that a buildpack makes to the build plan and considered how these are resolved into a buildpack plan to be provided to the build phase of specific buildpacks.  Finally, we have briefly considered how the analyze and restore phases can allow advanced caching strategies.
