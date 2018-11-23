+++
title="Getting Started with pack"
weight=2
type="page"
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
+++

## `pack` makes it easy for

- **application developers** to use [buildpacks](https://buildpacks.io/) to convert code into runnable images
- **buildpack authors** to develop and package buildpacks for distribution

## Contents
- [Building app images using `build`](#building-app-images-using-build)
  - [Example: Building using the default builder image](#example-building-using-the-default-builder-image)
  - [Example: Building using a specified buildpack](#example-building-using-a-specified-buildpack)
  - [Building explained](#building-explained)
- [Updating app images using `rebase`](#updating-app-images-using-rebase)
  - [Example: Rebasing an app image](#example-rebasing-an-app-image)
  - [Rebasing explained](#rebasing-explained)
- [Working with builders using `create-builder`](#working-with-builders-using-create-builder)
  - [Example: Creating a builder from buildpacks](#example-creating-a-builder-from-buildpacks)
  - [Builders explained](#builders-explained)
- [Managing stacks](#managing-stacks)
  - [Example: Adding a stack](#example-adding-a-stack)
  - [Example: Updating a stack](#example-updating-a-stack)
  - [Example: Deleting a stack](#example-deleting-a-stack)
  - [Example: Setting the default stack](#example-setting-the-default-stack)
  - [Listing stacks](#listing-stacks)
- [Resources](#resources)
- [Development](#development)

----


## Resources

- [Buildpack & Platform Specifications](https://github.com/buildpack/spec)

----

