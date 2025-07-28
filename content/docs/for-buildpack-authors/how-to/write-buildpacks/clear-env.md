+++
title="Clear the buildpack environment"
weight=99
+++

"Clearing" the buildpack environment with `clear-env` is the process of preventing the lifecycle from automatically merging user-provided environment variables into the buildpack's executing process's environment variables.
<!--more-->

User-provided environment variables are always written to disk at `$CNB_PLATFORM_DIR/env/` (known as "platform" environment variables) and are available to buildpacks regardless of the `clear-env` setting. For example, if someone runs `pack build --env HELLO=world`, there will always be a `$CNB_PLATFORM_DIR/env/hello` file with the contents of `world`.

By default (`clear-env = false`), the lifecycle automatically copies these user-provided environment variables into the current process environment when executing `/bin/detect` and `/bin/build`. This provides a "firehose" of all user environment variables for buildpacks that want easy access to user customization.

Setting `clear-env = true` in the [buildpack.toml](https://github.com/buildpacks/spec/blob/main/buildpack.md#buildpacktoml-toml) prevents this automatic merging, giving buildpacks complete control over which user-provided environment variables to use. This provides maximum isolation and predictability for buildpacks that want to be more selective about environment variable usage.

For example, if a user has specified the `PATH` environment variable, then a buildpack written in bash might unexpectedly find that tools it relies on such as `cp` are not the ones it expects. However, setting `clear-env = true` will not change runtime behavior.

* When `clear-env` is set to `true` for a given buildpack, the `lifecycle` will write user-provided environment variables to disk at `$CNB_PLATFORM_DIR/env/` but it will not copy those variables into the buildpack process when running `/bin/detect` or `/bin/build`.
* If a buildpack uses `clear-env = false` which allows customization by the end-user through the environment, there is a special convention for naming the environment variables recognized by the buildpack, shown in the following table:

| Env Variable           | Description                                       | Detect | Build | Launch |
|------------------------|---------------------------------------------------|--------|-------|--------|
| `BP_*`                 | User-provided variable for buildpack              | [x]    | [x]   |        |
| `BPL_*`                | User-provided variable for exec.d                 |        |       | [x]    |

Buildpacks that use `clear-env = true` are suggested to filter and export environment variables from `$CNB_PLATFORM_DIR/env/` while warning on the filtered variables. Emitting a warning will help users understand if runtime behavior differs from build time behavior. Sourcing the user environment variables is critical to allowing sub-processes access to credentials.

For example, if a private gem server hosted on `gems.example.com` needs to be accessed in a subprocess such as `bundle install`, a user provided `BUNDLE_GEMS__EXAMPLE__COM=<username>:<password>` would need to be used. If `clear-env = true` and platform environment variables are not used, then trying to access that resource would fail.


### Further Reading

For more about how environment variables are specified by end-users, see the page for how to [customize buildpack behavior with build-time environment variables](https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/).
