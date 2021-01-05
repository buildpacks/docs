+++
title="Detector"
weight=3
+++

## What is the detector?

Detection is the first phase of the Lifecycle. It’s done by the detector.
In this phase, the detector is looking for an ordered group of buildpacks that will be used during the build phase.
Detector is invoked in the build environment without any arguments (`/cnb/lifecycle/detector`) and it cannot run with root privileges.
One of the [input files][inputs] is [`order.toml`][order] and two of its [output files][outputs] are [`group.toml`][group] and [`plan.toml`][plan].

Unless some flags are passed in, the detector will use the following defaults:
* OrderPath: `/cnb/order.toml`
* GroupPath: `<layers>/group.toml`
* PlanPath: `<layers>/plan.toml`
The full list of flags and their defaults can be found [here][detector].

#### `order.toml`
`order.toml` contains a list of groups. Each group contains a list of buildpacks.
The detector reads `order.toml` and looks for the first group that passes the detection process.
If all of the groups fail, the detection process fails.
Each buildpack in each group is marked as either optional or as required.
In order to pass the detection process, two conditions should be satisfied:
The detect scripts of all required buildpacks should pass successfully (the exit code is zero).
The detector should be able to create a build plan with all of the requirements of the group’s buildpacks.
The first group that passes both steps is written to `group.toml` and its build plan is written to `plan.toml`.
Note: if the detect script of an optional buildpack failed, the group can still pass the detection process and be the “chosen”  group. In order for that to happen, there should be at least one (required or optional) buildpack in this group that passes the detect script successfully.

#### `group.toml`
The buildpacks of the “chosen” group will be written to `group.toml` if they pass the step of creating `plan.toml`. They are written in the same order as they appear in `order.toml` after filtering out all of the (optional) buildpacks whose detect script failed.

#### `plan.toml`
Each buildpack can define two lists with provided and required dependencies (or several pairs of lists separated by `or`). These lists (if they aren’t empty) are called a [build plan][buildPlan] and they are part of the [output of each buildpack’s detect script][detectScriptOutput].
The detector reads the build plans of the buildpacks of the “chosen” group (after filtering out the buildpacks whose detect script failed). It goes over all of the options and tries to create a file with a list of entries, each with provides and requires lists, that fulfills all of the buildpacks requirements. This file is called `plan.toml`.
What do these lists need to accomplish:
A dependency that is provided by a buildpack, must be required by either the buildpack itself or a later buildpack in the group.
A dependency that is required by a buildpack, must be provided by the buildpack itself or a previous buildpack in the group.
If at least one of the above failed on a required buildpack, the trial fails and the detector will look for the next trial. If at least one of the above failed on an optional buildpack, this buildpack should be excluded from the final plan. If all of the trials fail, the group fails (and the detector moves on to the next group.

#### Some links to important parts of the code:
The following file is responsible for the detection command: https://github.com/buildpacks/lifecycle/blob/main/cmd/lifecycle/detector.go. 

The public functions in the above file are being called by the `Run` function in the following file: https://github.com/buildpacks/lifecycle/blob/main/cmd/command.go

The spec of the detector can be found [here][spec].

[inputs]: https://github.com/buildpacks/spec/blob/main/platform.md#inputs
[outputs]: https://github.com/buildpacks/spec/blob/main/platform.md#outputs
[detector]: https://github.com/buildpacks/spec/blob/main/platform.md#detector
[buildPlan]: https://github.com/buildpacks/spec/blob/main/buildpack.md#build-plan-toml
[detectScriptOutput]: https://github.com/buildpacks/spec/blob/main/buildpack.md#detection
[spec]: https://github.com/buildpacks/spec/blob/main/buildpack.md#phase-1-detection
[order]: https://github.com/buildpacks/spec/blob/main/platform.md#ordertoml-toml
[group]: https://github.com/buildpacks/spec/blob/main/platform.md#grouptoml-toml
[plan]: https://github.com/buildpacks/spec/blob/main/platform.md#plantoml-toml
