+++
title="What is a buildpack?"
weight=1
+++

A `buildpack` is software that examines your source code and determines the best way to build it.

<!--more-->

![buildpacks](/docs/for-app-developers/concepts/what.svg)

## How do they work?

![how](/docs/for-app-developers/concepts/how.svg)

**Each buildpack has two phases**

### Detect phase

The `detect` phase runs against your source code to determine if the buildpack is applicable or not.
Once a buildpack is `detected` to be applicable, it proceeds to the `build` stage. If the project fails `detection` the `build` stage for a specific buildpack is skipped.

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
