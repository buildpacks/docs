+++
title="Buildpack API 0.4 -> 0.5"
+++

<!--more-->

This guide is most relevant to buildpack authors. 

See the [spec release](https://github.com/buildpacks/spec/releases/tag/buildpack%2Fv0.5) for buildpack API 0.5 for the full list of changes and further details.

### Stack ID
The buildpack may now indicate compatibility with any stack by specifying the special value `*`.

### Character restrictions for process types
For each process in `launch.toml`, `type` is now restricted to only contain numbers, letters, and the characters `.`, `_`, and `-`, so symlinks on both linux and windows filesystems can be created.
 
### Override env vars
Override is now the default behavior for env files without a suffix.
It means that for the `/env/`, `/env.build/`, and `/env.launch/` directories, the default, suffix-less behavior will be `VAR.override` instead of `VAR.append`+`VAR.delim=:`.

### Decouple Builpack Plan and BOM
The Buildpack Plan and Bill-Of-Materials are now decoupled.
`<plan>` that is provided to `/bin/build` and contains the Buildpack Plan entries for the buildpack, is now read-only.
There are new `[[bom]]` sections in `<layers>/launch.toml` and `<layers>/build.toml` for runtime and build-time Bill-of-Materials entries respectively.
There is a new `[[entries]]` section in `<layers>/build.toml` for Buildpack Plan entries that should be passed to subsequent buildpacks that may provide the dependencies.

### exec.d
The launch process now supports `exec.d` executables. Unlike `profile.d` scripts, which must be text files containing Bash 3+ scripts, the `exec.d` scripts do not depend on a shell but can still modify the environment of the app process.
Lifecycle will execute each file in each `<layers>/<layer>/exec.d` directory and each file in each `<layers>/<layer>/exec.d/<process>` directory.
The output of the script may contain any number of top-level key/value pairs.
