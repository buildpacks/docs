+++
title="Using report.toml"
weight=7
summary="Learn how to access the report.toml file to get metadata about a build."
+++

When building an app, the lifecycle will produce a report.toml file containing metadata about the build, such as the exported tag and image identifier (to see exactly what is contained in this file, see the [spec](https://github.com/buildpacks/spec/blob/main/platform.md#reporttoml-toml)).

By default, this file will be created in the working directory of the lifecycle in the build container, which by default is `/layers`. Note that this file is not present in the exported app image.

Currently, there isn't a way to obtain this file when building with `pack`. Kubernetes based platforms can utilize the [pod termination message](https://kubernetes.io/docs/tasks/debug-application-cluster/determine-reason-pod-failure/#customizing-the-termination-message) to retrieve the reports on build completion.
