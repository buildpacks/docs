+++
title="Platform API 0.6 -> 0.7"
+++

<!--more-->

This guide is most relevant to platform operators.

See the [spec release](https://github.com/buildpacks/spec/releases/tag/platform%2Fv0.7) for platform API 0.7 for the full list of changes and further details.

## Platform Operator

### Run the analyzer before the detector

The order of the lifecycle phases has been changed starting from Platform API 0.7.\
The order before Platform API 0.7 was: detect, analyze, restore, build, and export.\
The order starting from Platform API 0.7 is: analyze, detect, restore, build, and export.\
The main reason for this change was to validate registry access for all images that are used during the build as early as possible. Starting from `Platform API 0.7`, it happens in the first lifecycle phase, as part of the `analyzer`, before running the `detector`. In this way it provides faster failures for end users.

As part of this change, a few flags were removed and others were added to some of the lifecycle phases.

The flags that were removed from the analyzer are:
* `-cache-dir`
* `-group`
* `-skip-layers`

The flags that were added to the analyzer are:
* `-previous-image`
* `-run-image`
* `-stack`
* `-tag`

The flags that were added to the restorer are:
* `-analyzed`
* `-skip-layers`

The flag that was removed from the exporter is:
* `-run-image`
