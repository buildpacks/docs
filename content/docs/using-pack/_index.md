+++
title="Using `pack`"
weight=3
creatordisplayname = "Andrew Meyer"
creatoremail = "ameyer@pivotal.io"
lastmodifierdisplayname = "Andrew Meyer"
lastmodifieremail = "ameyer@pivotal.io"
+++

**`pack`** makes it easy for

- **Application developers** to use [Cloud Native Buildpacks](https://buildpacks.io/) to convert code into runnable images
- **Buildpack authors** to develop and package buildpacks for distribution

Ready to embark on your adventure with `pack` but not sure where to start? Try out our tutorial,
[**An App's Brief Journey from Source to Image**](/docs/app-journey).

Otherwise, read the rest of this document for detailed explanations and examples of `pack`'s most important commands.

---
## Contents

- [Building app images using `build`](/docs/using-pack/building-app)
  - [Example: Building using the default builder image](/docs/using-pack/building-app/#example-building-using-the-default-builder-image)
  - [Example: Building using a specified buildpack](/docs/using-pack/building-app/#example-building-using-a-specified-buildpack)
  - [Example: Building with user-provided environment variables](/docs/using-pack/building-app/#example-building-with-user-provided-environment-variables)
  - [Building explained](/docs/using-pack/building-app/#building-explained)
- [Updating app images using `rebase`](/docs/using-pack/update-app-rebase/)
  - [Example: Rebasing an app image](/docs/using-pack/update-app-rebase/#example-rebasing-an-app-image)
  - [Rebasing explained](/docs/using-pack/update-app-rebase/#rebasing-explained)
- [Working with builders using `create-builder`](/docs/using-pack/working-with-builders)
  - [Example: Creating a builder from buildpacks](/docs/using-pack/working-with-builders/#example-creating-a-builder-from-buildpacks)
  - [Builders explained](/docs/using-pack/working-with-builders/#builders-explained)
  - [Builder configuration](/docs/using-pack/working-with-builders/#builder-configuration)
- [Managing stacks](/docs/using-pack/managing-stacks)
  - [Run image mirrors](/docs/using-pack/managing-stacks/#run-image-mirrors)

---


## Other resources

- [Buildpack & Platform Specifications](https://github.com/buildpack/spec)
