+++
title="Inspect your application image"
weight=2
+++

Buildpacks-built images contain metadata that allow you to audit both the image itself and the build process.

<!--more-->

Information includes:

* The process types that are available and the commands associated with them
* The run-image the app image was based on
* The buildpacks were used to create the app image
* Whether the run-image can be rebased with a new version through the `Rebasable` label or not
* And more...!

`Pack` offers a built-in command to help you inspect the resultant image and view some of its contents as shown below:

```bash
pack inspect-image test-node-js-app
```

You should see the following:

```text
Run Images:
  cnbs/sample-base-run:noble
...

Buildpacks:
  ID                   VERSION        HOMEPAGE
  examples/node-js        0.0.1          -

Processes:
  TYPE                 SHELL        COMMAND                           ARGS        WORK DIR
  web (default)        bash         node-js app.js                                   /workspace
```

Apart from the above standard metadata, buildpacks can also populate information about the dependencies they have provided in form of a `Software Bill-of-Materials` or [SBOM].

As already mentioned, buildpacks help you get an `OCI` images that are constructed in a way that’s easy to understand and update with each of the layers being meaningful and independent of all other layers. You can get more details about each layer and how it was created to better understand how the [Build] actually worked.

There are some available tools that help you achieve this and understand what is contained in your `OCI` image; a popular one is [Dive].

Dive can help you inspect `OCI` images, view their layers and each layer's details. If you were to build an `OCI` image following the [multi process app] example and run `Dive` on the generated image, you'll be presented with some detailed information about all of the image layers and understand what is in each layer.

You can use `Dive` as follows:

```bash
dive multi-process-app
```

The output should look similar to the following:

PLACEHOLDER

As seen in the output above, you're presented with `Layers`, `Layer Details`, `Image Details`, and `Current Layer Contents`. To view the contents or explore the file tree of any layer, you need to select the layer on the left using the arrow keys.

[SBOM]: /docs/for-app-developers/how-to/build-outputs/download-sbom
[build]: https://buildpacks.io/docs/for-app-developers/concepts/build/
[Dive]: https://github.com/wagoodman/dive
[multi process app]: https://buildpacks.io/docs/for-app-developers/how-to/build-outputs/specify-launch-process/#build-a-multi-process-app
