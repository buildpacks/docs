+++
title="Specify the build time environment variables"
weight=4
+++

Environment variables are used to configure buildpack behavior. They may be specified by:

* The platform operator (this page)
* The end user (see [Customize buildpack behavior with build-time environment variables][end user])
* Other buildpacks (see [Specify the environment][env])

<!--more-->

When more than one entity specifies the same environment variable, the order of precedence is as shown above, with the platform operator having ultimate say over what the final value of the variable will be.

The platform operator specifies environment variables in a manner that is very similar to buildpacks (see XXX), but with a few differences. Namely:

* The env directory is `/cnb/build-config`
* When no suffix is provided, the modification behavior is `default`
For more information, consult the [Platform Specification](https://github.com/buildpacks/spec/blob/main/platform.md).

### Example

PLACEHOLDER

[env]: https://buildpacks.io/docs/for-buildpack-authors/how-to/write-buildpacks/specify-env/
[end user]: https://buildpacks.io/docs/for-app-developers/how-to/build-inputs/configure-build-time-environment/
