+++
title="What is a builder?"
weight=2
+++

A `builder` is an [OCI image](https://github.com/opencontainers/image-spec) containing
an ordered combination of [buildpacks][buildpack] and
a [build-time base image], a [lifecycle] binary, and a reference to a [runtime base image].

<!--more-->

The [build-time base image] provides the base environment for the `builder`
(e.g., an Ubuntu Noble OS image with build tooling) and
a [runtime base image] provides the base environment for the `app image` during runtime.

![builder](/images/builder.svg)

Under the hood a builder uses the [lifecycle] to run the `detect` phase for all the `buildpacks` it contains, in order,
and then proceeds to run the `build` phase for all the `buildpacks` that passed detection.

This allows us to have a **single** `builder` that can detect and build various kinds of applications automatically.

For example, let's say `demo-builder` contains the `Python` and `Node` buildpack. Then -

- If your project just has a `requirements.txt`, `demo-builder` will only run the Python `build` steps.
- If your project just has a `package-lock.json`, `demo-builder` will only run the Node `build` steps.
- If your project has both `package-lock.json` and `requirements.txt`, `demo-builder` will run **both** the Python and Node `build` steps.
- If your project has no related files, `demo-builder` will fail to `detect` and exit.

[build-time base image]: /docs/for-app-developers/concepts/base-images/build/
[buildpack]: /docs/for-app-developers/concepts/buildpack/
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle/
[runtime base image]: /docs/for-app-developers/concepts/base-images/run/
