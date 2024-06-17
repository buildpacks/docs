+++
title="What is the lifecycle?"
weight=3
include_summaries=true
+++

The `lifecycle` orchestrates buildpacks, then assembles the resulting artifacts into an [OCI image](https://github.com/opencontainers/image-spec).
It does its work in a series of distinct "phases".

<!--more-->

## Build Phases

An **image build** requires 5 lifecycle phases, as shown below:

![lifecycle phases](/images/lifecycle-phases.png)

> **Note**: when talking about lifecycle phases you'll sometimes see nouns like `analyzer` or `/cnb/lifecycle/analyzer`
> and you'll sometimes see verbs like `analyze` or `analyze phase`.<br><br>
> These are all more-or-less interchangeable: the nouns refer to the lifecycle binary and the verbs refer to the work that the lifecycle performs.

The lifecycle must be run in a containerized environment (such as a Docker container or CI/CD system).

The [`analyzer`][analyzer], [`restorer`][restorer], and [`exporter`][exporter] (shown in pink above)
require access to an image repository - either an **OCI registry** or Docker-compliant **daemon** (such as Docker or Podman)
in order to do their work.

This means that either registry credentials or a Docker socket must be available in the container where the lifecycle phase is running.
For security hardening, these phases run in separate containers to avoid exposing sensitive data to **buildpacks**.

The [`detector`][detector] and [`builder`][builder] (shown in purple above)
invoke buildpacks to do the work of determining which buildpacks are needed and
transforming application source code into runnable artifacts (the real work of buildpacks!).
For security hardening, both the lifecycle and buildpacks run as non-root users when doing this work.

When a builder is [trusted][trusted builder], all 5 lifecycle phases can be run in the same container,
and in this case the [`creator`][creator] binary is used to run all 5 lifecycle phases with a single command invocation.

To coordinate between phases, the lifecycle outputs a series of configuration files which are part of the [Platform API specification][platform api].
For the most part, platform operators do not need to be concerned with these files unless they are designing their own platform.

## Diving Deeper

Read on to learn more about each lifecycle phase, including phases not shown above.
These include phases relating to [starting][launcher] or [rebasing][rebaser] the application, or [extending][extender] base images used during the build.

[trusted builder]: /docs/for-platform-operators/how-to/integrate-ci/pack/concepts/trusted_builders
[creator]: /docs/for-platform-operators/concepts/lifecycle/create
[analyzer]: /docs/for-platform-operators/concepts/lifecycle/analyze
[detector]: /docs/for-platform-operators/concepts/lifecycle/detect
[restorer]: /docs/for-platform-operators/concepts/lifecycle/restore
[builder]: /docs/for-platform-operators/concepts/lifecycle/build
[exporter]: /docs/for-platform-operators/concepts/lifecycle/export
[launcher]: /docs/for-platform-operators/concepts/lifecycle/launch
[rebaser]: /docs/for-platform-operators/concepts/lifecycle/rebase
[extender]: /docs/for-platform-operators/concepts/lifecycle/extend
[platform api]: /docs/reference/spec/platform-api