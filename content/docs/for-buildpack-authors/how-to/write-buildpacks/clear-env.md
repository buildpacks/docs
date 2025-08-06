+++
title="Clear the buildpack environment"
weight=99
+++

"Clearing" the buildpack environment with `clear-env` is the process of preventing the lifecycle from automatically merging user-provided environment variables into the buildpack's executing process's environment variables.
<!--more-->

User-provided environment variables are always written to disk at `$CNB_PLATFORM_DIR/env/` as "platform" environment variables and are available to a buildpack regardless of the `clear-env` setting. For example, if someone runs `pack build --env HELLO=world`, there is always a `$CNB_PLATFORM_DIR/env/hello` file with the contents of `world`.

By default with `clear-env = false`, the lifecycle automatically copies these user-provided environment variables into the current process environment when executing `/bin/detect` and `/bin/build`. This provides a comprehensive stream of all user environment variables for a buildpack that wants easy access to user customization.

Setting `clear-env = true` in the [buildpack.toml](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpacktoml-toml) prevents this automatic merging, giving a buildpack complete control over which user-provided environment variables to use. This provides maximum isolation and predictability for a buildpack that wants to be more selective about environment variable usage.

For example, if a user has specified the `PATH` environment variable, then a buildpack written in bash might unexpectedly find that tools it relies on such as `cp` aren't the ones it expects. However, setting `clear-env = true` won't change runtime behavior.

* When you set `clear-env` to `true` for a given buildpack, the `lifecycle` writes user-provided environment variables to disk at `$CNB_PLATFORM_DIR/env/` but it won't copy those variables into the buildpack process when running `/bin/detect` or `/bin/build`.
* If a buildpack uses `clear-env = false` which allows customization by the end-user through the environment, there is a special convention for naming the environment variables recognized by the buildpack, shown in the following table:

| Environment Variable   | Description                                       | Detect | Build | Launch |
|------------------------|---------------------------------------------------|--------|-------|--------|
| `BP_*`                 | User-provided variable for buildpack              | [x]    | [x]   |        |
| `BPL_*`                | User-provided variable for exec.d                 |        |       | [x]    |

Buildpack that use `clear-env = true` should filter and export environment variables from `$CNB_PLATFORM_DIR/env/` while warning on the filtered variables. Emitting a warning helps users understand if runtime behavior differs from build time behavior. Sourcing the user environment variables is critical to allowing sub-processes access to credentials.

For example, if a private gem server hosted on `gems.example.com` needs access in a sub-process such as `bundle install`, the user must provide `BUNDLE_GEMS__EXAMPLE__COM=<username>:<password>`. If `clear-env = true` and the buildpack doesn't use platform environment variables, then trying to access that resource would fail.


### Further reading

For more about how end-users specify environment variables, see the page for how to [customize buildpack behavior with build-time environment variables](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/).
