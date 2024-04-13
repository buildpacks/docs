+++
title="Basics of BuildPacks"
weight=2
getting-started=true
+++

## Basic Concepts

### What is a Buildpack?

A `buildpack` is software that transforms application source code into
executable files by analyzing the code and determining the best way to
build it.

![buildpacks](/images/what.svg)

### What is a Builder?

A builder is an image that contains all the components necessary to
execute a build (for example, an ordered combination of buildpacks, a build
image and other files and configurations).

![create-builder diagram](/images/create-builder.svg)

### What is a Lifecycle?

A lifecycle is a series of steps that are used to create and manage a
buildpack. `create` is used to analyze, detect, restore, build, and export
buildpack execution. Next, `launcher` can be used to launch the application.
Finally, `rebase` can be used to push the latest changes to an existing
buildpack. All of these steps are part of a lifecycle.

![lifecycle](/images/lifecycle.png)

### What is a Platform

A platform typically refers to an organization or service provider (e.g.,
kpack, Tekton, Fly.io, Digital Ocean, Google Cloud, Heroku, SalesForce, etc.)
that incorporates Buildpacks within their products to make buildpack
functionality available to their end-users (typically, application
developers). 

A platform can be a:

- A local CLI tool
- A plugin for a continuous integration service
- A cloud application platform

## Who uses Buildpacks (Personas)

### App Developers

Regular Application developers that utilize Buildpacks in their app packaging
workflows.

### Platform Operators

Operators of platforms (Google Cloud, Salesforce, etc.) that incorporate
Buildpacks within their platforms to simplify the end-user experience.

### Buildpack Authors

Buildpacks' internal developers working on Buildpack features.