+++
title="Caching Strategies"
weight=6
summary="Learn strategies for caching layers."
+++

# Caching

There are three types of layers that can be contributed to an image

* `build` layers -- the directory will be accessible by subsequent buildpacks,
* `cache` layers -- the directory will be included in the cache,
* `launch` layers -- the directory will be included in the run image as a single layer,

A fourth type of layer

* `ignored` layers

are available to buildpack authors for use as temporary layers.

In this section we look at caching each layer type.

## Layer Metadata

buildpacks ensure byte-for-byte reproducibility of layers.  File creation time is [normalized to January 1, 1980](https://medium.com/buildpacks/time-travel-with-pack-e0efd8bf05db) to ensure reproducibility.  Byte-for-byte reproducibility means previous layers can be reused.  However, we want to invalidate previously cached layers if

* the buildpacks API changes,
* the type of the layer changes.

A layer built using a buildpack at API version `0.7` should be considered invalid if the API version for that buildpack has been updated to `0.8`.  Similarly, if a layer is changed from being a cache-only layer to being a cache and launch layer, then the cache should be considered invalid.

In addition to general cache invalidation conditions a buildpack should invalidate a previous layer if an important property changes, such as:

* the major version of the runtime changes eg: NodeJS changes from 16 to 18
* requested application dependencies have changed eg: a Python application adds a dependency on the `requests` module

Launch layers are exported to an OCI registry and layer metadata is stored with the launch layer.  The layer metadata is commonly used when deciding if a launch layer should be re-used from cache.

## Strategies

Caching during the production of an application image is necessarily very flexible.  Most buildpacks that wish to contribute a layer to the application image need only to

1. Check that the metadata of the cached layer is current,
2. Create an empty layer, and
3. Set `launch = true`.

This will guarantee that the previously published application image layer in the registry is re-used if the layer metadata matches the requested metadata.  In this most straightforward use-case `launch` is `true` and both `build` and `cache` are set to `false`.  That is to say, the most common case is where `cache = false`, `build = false` and `launch = true`.  It is important to note that the layer is re-used on the OCI registry.  This avoids expensive rebuilds of the layer and expensive pulls of the layer to the host running the build.

Setting `build = true` makes a layer available to subsequent buildpacks.  Therefore binaries installed to the `bin` directory on a `build = true` layer are available to subsequent buildpacks during the build phase.  It is also the case that `lib` directories on a `build = true` later are added to the `LD_LIBRARY_PATH` during the build phase of subsequent buildpacks.  Environment variables defined in a `build = true` layer are similarly available.  For any layer where `launch = true` and `build = true`, a launch layer from the OCI registry can no longer be reused. Instead, the layer must be made available locally so that subsequent buildpacks can use it.

Setting `cache = true` allows additional fine-grained control over caching.  The `cache = true` flag caches a layer and allows a buildpack to make _content_ level decisions about the validity of the cache (as opposed to using the less granular metadata).  As an example, suppose a layer where `launch = true` installs a `jq` binary with version `1.5` and sets `version=1.5` in the layer metadata.  By default, this layer will not be re-used from the registry when a buildpack requests `jq` with `version=1.6` to be installed.  However, setting `cache = true` makes a previously built layer available during the build.  A buildpack could then prefer to implement logic to restore `jq` with `version=1.5` instead of performing a potentially expensive download of `jq` with `version=1.6`.  The `cache = true` setting allows for cache validation decisions to be made at a level of granularity that is much finer grained than layer metadata.

Setting `cache = false`, `build = false`, and `launch = true` is the most common configuration.  If `cache = false`, `build = false`, and `launch = true` is not appropriate for your layer, then `cache = true`, `build = true`, and `launch = true` should be the next combination to evaluate:

* When `cache = true, build = true, launch = true`, explicitly setting `build = true` makes the layer available, to subsequent buildpacks, during the build phase.  As `cache = true` the layer is restored from local cache before proceeding to the build phase.  For example, a Python distribution could be provided in a cached, build and launch layer. The build phase could verify that the restored cached version of the Python distribution contains Python 3.10 but disregard the patch number of the Python interpreter.
* `cache = true, build = true, launch = true` is an appropriate setting for a layer providing a distribution or runtime such as a Python interpreter or NodeJS runtime.

Other common configurations include

* `cache = true, build = false, launch = true` Allows the same caching behavior as `cache = true, build = true, launch = true`, but the layer is not available to subsequent buildpacks.  For example, the build phase can restore a Python distribution disregarding the patch number of the `major.minor.patch` number stored in the metadata.  As `build = false` the python interpreter is unavailable to subsequent buildpacks.
* `cache = true, build = true, launch = false` This configuration is useful where a build time dependency is provided.  For example, a JDK could be provided as a cached build layer that is not added as a launch layer. Instead, a JRE could be provided as a launch layer in the application image.
* `cache = true, build = false, launch = false` This configuration is particularly useful in layers that download resources.  Using a cache-only layer supports allows a  buildpack to re-use cached downloads during installation.  For example, pip wheels could be downloaded as a cache-only layer and the same buildpack could install the wheels in to a launch layer.

There are other boolean combinations of cache, build and launch.  These provide significant flexibility in the caching system.  Users of less common caching strategies need a good understanding of the [buildpacks specification on Layer Types](https://github.com/buildpacks/spec/blob/main/buildpack.md#layer-types
).
