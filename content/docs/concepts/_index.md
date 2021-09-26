+++
title="Concepts"
weight=3
expand=false
+++

<p class="lead">
Buildpacks allow you to convert your source code into a secure, efficient, production ready container image.
</p>

## What are buildpacks?

![buildpacks](/docs/concepts/what.svg)

**[Buildpacks](/docs/concepts/components/buildpack) provide framework and runtime support for applications.** Buildpacks examine your apps to determine all the dependencies it needs and configure them appropriately to run on any cloud.


## How do they work?

![how](/docs/concepts/how.svg)

**Each buildpack comprises of two phases -**

### Detect phase

The `detect` phase runs against your source code to determine if the buildpack is applicable or not. Once a buildpack is `detected` to be applicable, it proceeds to the `build` stage. If the project fails `detection` the `build` stage for a specific buildpack is skipped.

For example:

- A Python buildpack may look for a `requirements.txt` or a `setup.py` file pass
- A Node buildpack may look for a `package-lock.json` file to pass

### Build phase

The `build` phase runs against your source code to - 

- Set up the build-time and run-time environment
- Download dependencies and compile your source code (if needed)
- Set appropriate entry point and startup scripts

For example:

- A Python buildpack may run `pip install -r requirements.txt` if it detected a `requirements.txt` file
- A Node buildpack may run `npm install` if it detected a `package-lock.json` file

## What is a builder?

![builder](/docs/concepts/builder.svg)

[`Builders`](/docs/concepts/components/builder) are an ordered combination of [`buildpacks`](/docs/concepts/components/buildpack) with a base `build` image, a lifecycle, and reference to a `run image`. They take in your `app` source code and build the output `app image`. The `build` image provides the base environment for the `builder` (for eg. an Ubuntu Bionic OS image with build tooling) and a `run` image provides the base environment for the `app image` during runtime. A combination of a `build` image and a `run` image is called a [`stack`](/docs/concepts/components/stack).

Under the hood a builder uses the [`lifecycle`](/docs/concepts/components/lifecycle) to run the `detect` phase for all the `buildpacks` it contains in order and then proceeds to run the `build` phase of all the `buildpacks` that passed detection.

This allows us to have a **single** `builder` that can detect and build various kinds of applications automatically.

For example, let's say `demo-builder` contains the `Python` and `Node` buildpack. Then - 

- If your project just has a `requirements.txt`, `demo-builder` will only run the Python `build` steps.
- If your project just has a `package-lock.json`, `demo-builder` will only run the Node `build` steps.
- If your project has both `package-lock.json` and `requirements.txt`, `demo-builder` will run **both** the Python and Node `build` steps.
- If your project has no related files, `demo-builder` will fail to `detect` and exit.
