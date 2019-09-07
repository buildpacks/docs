+++
title="Buildpack API"
weight=2
creatordisplayname = "Joe Kutner"
creatoremail = "jpkutner@gmail.com"
lastmodifierdisplayname = "Joe Kutner"
lastmodifieremail = "jpkutner@gmail.com"
+++

## Buildpack API

This specification defines the interface between a buildpack and the environment that runs it.

A buildpack contains two executables:

* `bin/detect`
* `bin/build`

These executables can be shell scripts written in a languages like Bash, or they
can be executables compiled from a language like Go.

### `bin/detect`

This entrypoint is used to determine if this buildpack should be
run against a given codebase. It

### `bin/build`

This entrypoint transforms a codebase into an executable state. It will often
resolve dependencies, install binary packages, and compile code.
