+++
title="What is a buildpack?"
weight=1
+++

A `buildpack` is software that transforms application source code into runnable artifacts
by analyzing the code and determining the best way to build it.

<!--more-->

![buildpacks](/images/what.svg)

## Why buildpacks?

Buildpacks allow application developers to focus on what they do best - writing code, without having to worry about image security, optimizing container images, or container build strategy.

How much time have you spent struggling to wrangle yet another Dockerfile? Copying and pasting random Dockerfile snippets into every project? Buildpacks can help! They are a better approach to building container images for applications.

## What do they look like?

Typical buildpacks consist of at least three files:

* `buildpack.toml` -- provides metadata about the buildpack, containing information such as its name, ID, and version.
* `bin/detect` -- performs [detect](#detect).
* `bin/build` -- performs [build](#build).

## How do they work?

![how](/images/how.svg)

**Each buildpack has two jobs to do**

### Detect

The buildpack determines if it is needed or not.

For example:

- A Python buildpack may look for a `requirements.txt` or a `setup.py` file.
- A Node buildpack may look for a `package-lock.json` file.

### Build

The buildpack transforms application source code in some way, for example by

- Setting build-time and run-time environment variables.
- Downloading dependencies.
- Running source code compilation (if needed).
- Configuring the application entrypoint and any startup scripts.

For example:

- A Python buildpack may run `pip install -r requirements.txt` if it detected a `requirements.txt` file.
- A Node buildpack may run `npm install` if it detected a `package-lock.json` file.
