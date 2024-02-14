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

```bash
pack inspect-image test-node-js-app
```
You should see the following:

```text
Run Images:
  cnbs/sample-base-run:jammy
...

Buildpacks:
  ID                   VERSION        HOMEPAGE
  examples/node-js        0.0.1          -

Processes:
  TYPE                 SHELL        COMMAND                           ARGS        WORK DIR
  web (default)        bash         node-js app.js                                   /workspace
```

Apart from the above standard metadata, buildpacks can also populate information about the dependencies they have provided in form of a `Software Bill-of-Materials` or [SBOM].

[SBOM]: /docs/for-app-developers/how-to/build-outputs/download-sbom
