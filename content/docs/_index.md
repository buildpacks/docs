+++
title="Getting Started"
weight=1
summary="Get started with Cloud Native Buildpacks."
+++

## Overview

Cloud Native Buildpacks (CNBs) transform your application source code into [container images](https://github.com/opencontainers/image-spec/blob/main/spec.md) that can run on any cloud. With buildpacks, organizations can concentrate the knowledge of container build best practices within a specialized team, instead of having application developers across the organization individually maintain their own Dockerfiles. This makes it easier to know what is inside application images, enforce security and compliance requirements, and perform upgrades with minimal effort and intervention. The CNB project was initiated by Pivotal and Heroku in January 2018 and joined the Cloud Native Computing Foundation (CNCF) as an Apache-2.0 licensed project in October 2018. It is currently an incubating project within the CNCF.

---

## Tutorials

* [An App’s Brief Journey from Source to Image](/docs/app-journey/) - An easy-to-follow introduction to Cloud Native Buildpacks using `pack`, a command line tool for Cloud Native Buildpacks.
* [Creating a Cloud Native Buildpack](/docs/for-buildpack-authors/tutorials/basic-buildpack) - Tutorial walking through the creation of a simple Ruby buildpack.

## Going deeper

See how-to guides, concepts, and tutorials tailored to specific personas:

* [App Developers](/docs/for-app-developers/)
* [Buildpack Authors](/docs/for-buildpack-authors/)
* [Operators](/docs/for-platform-operators/)

## [Tools](/docs/for-platform-operators/)

* **[CircleCI](/docs/for-platform-operators/how-to/integrate-ci/circleci)** - {{< summary "/docs/for-platform-operators/how-to/integrate-ci/circleci" >}}
* **[GitLab](/docs/for-platform-operators/how-to/integrate-ci/gitlab)** - {{< summary "/docs/for-platform-operators/how-to/integrate-ci/gitlab" >}}
* **[kpack](/docs/for-platform-operators/how-to/integrate-ci/kpack)** - {{< summary "/docs/for-platform-operators/how-to/integrate-ci/kpack" >}}
* **[Pack](/docs/for-platform-operators/how-to/integrate-ci/pack)** - {{< summary "/docs/for-platform-operators/how-to/integrate-ci/pack" >}}
* **[Tekton](/docs/for-platform-operators/how-to/integrate-ci/tekton)** - {{< summary "/docs/for-platform-operators/how-to/integrate-ci/tekton" >}}

## [Reference](/docs/reference/)

Reference documents for various key aspects of the project.

* [Configuration](/docs/reference/config/) - Schema definitions for configuration files.
* [Specification](/docs/reference/spec/) - An overview of the Cloud Native Buildpacks API specification.

---

## Community and Support

Cloud Native Buildpacks is an incubating project in the CNCF. We welcome contribution from the community. Here you will find helpful information for interacting with the core team and contributing to the project.

### Community

The best place to contact the Cloud Native Buildpack team is on the [CNCF Slack](https://slack.cncf.io/) in the #buildpacks or [mailing list](https://lists.cncf.io/g/cncf-buildpacks).

### Contributor's Guide

Find out the various ways that _you_ can contribute to the Cloud Native Buildpacks project using our [contributor's guide](https://github.com/buildpacks/community/blob/main/contributors/guide.md).

### Project Roadmap

This is a community driven project and our roadmap is publicly available on our [Github page](https://github.com/buildpacks/community/blob/main/ROADMAP.md). We encourage you to contribute with feature requests.
