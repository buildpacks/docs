+++
title="What are targets?"
weight=3
+++

The concept of `targets` is used to identify compatibility between buildpacks and base images.

<!--more-->

Target data includes:
* Operating system name (e.g., "linux")
* Architecture (e.g., "amd64", "arm64")
* Architecture variant
* Operating system distribution name (e.g., "ubuntu", "alpine")
* Operating system distribution version (e.g., "22.04", "3.18.3")

For Linux-based images, operating system distribution name and version should be the values in `/etc/os-release` (`$ID` and `$VERSION_ID`).
For Windows-based images, operating system distribution name is blank, and version should be the value of `os.version` in the image config (e.g., `10.0.14393.1066`).

Buildpacks may declare the targets they are compatible with in `buildpack.toml`.
This information will be used by `pack` (or other platforms) and the lifecycle to avoid running buildpacks on images they aren't designed to work with.

Additionally, during builds this information will be read by the lifecycle from the run image and exposed to buildpacks through `CNB_TARGET_` environment variables:
* `CNB_TARGET_OS`
* `CNB_TARGET_ARCH`
* `CNB_TARGET_ARCH_VARIANT`
* `CNB_TARGET_DISTRO_NAME`
* `CNB_TARGET_DISTRO_VERSION`

Buildpacks can use this information to modify their behavior depending on the target.
