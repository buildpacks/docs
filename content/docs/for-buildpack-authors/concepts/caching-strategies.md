+++
title="Caching strategies"
weight=1
summary="Learn strategies for caching layers at build-time for future re-use."
+++

# Layers

There are three types of layers that can be contributed to an image

* `build` layers -- the directory will be accessible by subsequent buildpacks,
* `cache` layers -- the directory will be included in the cache,
* `launch` layers -- the directory will be included in the run image as a single layer,

In this section we look at caching each layer type.

## Layer Metadata

buildpacks ensure byte-for-byte reproducibility of layers.  File creation time is [normalized to January 1, 1980](https://medium.com/buildpacks/time-travel-with-pack-e0efd8bf05db) to ensure reproducibility.  Byte-for-byte reproducibility means previous layers can be reused.  However, we may want to invalidate previously cached layers if an important property changes, such as:

* the major version of the runtime changes eg: NodeJS changes from 16 to 18
* requested application dependencies have changed eg: a Python application adds a dependency on the `requests` module

Launch layers are exported to an OCI registry.  The layer metadata is commonly used when deciding if a launch layer should be re-used.  A launch layer may be re-used on an OCI registry without downloading the layer to the machine running a build.

## Caching Strategies

Caching during the production of an application image is necessarily very flexible.  Most buildpacks that wish to contribute a layer to the application image need only to

1. Check that the metadata of the cached layer is current,
2. Create an empty layer, and
3. Set `launch = true`.

This will guarantee that the previously published application image layer in the registry is re-used if the layer metadata matches the requested metadata.  In this most straightforward use-case `launch` is `true` and both `build` and `cache` are set to `false`.  That is to say, the most common case is where `cache = false`, `build = false` and `launch = true`.  It is important to note that the layer is re-used on the OCI registry.  This avoids expensive rebuilds of the layer and expensive pulls of the layer to the host running the build.

Setting `build = true` makes a layer available to subsequent buildpacks.  Therefore binaries installed to the `bin` directory on a `build = true` layer are available to subsequent buildpacks during the build phase.  It is also the case that `lib` directories on a `build = true` later are added to the `LD_LIBRARY_PATH` during the build phase of subsequent buildpacks.  Environment variables defined in a `build = true` layer are similarly available.  For any layer where `launch = true` and `build = true`, a launch layer from the OCI registry can no longer be reused. Instead, the layer must be made available locally so that subsequent buildpacks can use it.

Setting `cache = true` ensures that the layer is restored locally before the buildpacks build phase.

Setting `cache = false`, `build = false`, and `launch = true` is the most common configuration.  If `cache = false`, `build = false`, and `launch = true` is not appropriate for your layer, then `cache = true`, `build = true`, and `launch = true` should be the next combination to evaluate:

* When `cache = true, build = true, launch = true`, explicitly setting `build = true` makes the layer available, to subsequent buildpacks, during the build phase.  As `cache = true` the layer is restored from local cache before proceeding to the build phase.  For example, a Python distribution could be provided in a cached, build and launch layer. The build phase could verify that the restored cached version of the Python distribution contains Python 3.10 but disregard the patch number of the Python interpreter.
* `cache = true, build = true, launch = true` is an appropriate setting for a layer providing a distribution or runtime such as a Python interpreter or NodeJS runtime.

Other common configurations include

* `cache = true, build = false, launch = true` Allows the same caching behavior as `cache = true, build = true, launch = true`, but the layer is not available to subsequent buildpacks.  For example, the build phase can restore a Python distribution disregarding the patch number of the `major.minor.patch` number stored in the metadata.  As `build = false` the python interpreter is unavailable to subsequent buildpacks.
* `cache = true, build = true, launch = false` This configuration is useful where a build time dependency is provided.  For example, a JDK could be provided as a cached build layer that is not added as a launch layer. Instead, a JRE could be provided as a launch layer in the application image.
* `cache = true, build = false, launch = false` This configuration is particularly useful in layers that download resources.  Using a cache-only layer supports allows a  buildpack to re-use cached downloads during installation.  For example, pip wheels could be downloaded as a cache-only layer and the same buildpack could install the wheels in to a launch layer.

There are other boolean combinations of cache, build and launch.  These provide significant flexibility in the caching system.  Users of less common caching strategies need a good understanding of the [buildpacks specification on Layer Types](https://github.com/buildpacks/spec/blob/main/buildpack.md#layer-types
).

The flexibility of buildpacks layer options allow fine-grained control over caching.  A buildpack may make _content_ level decisions about the validity of a previous layer (as opposed to using the less granular metadata).  A buildpack may contribute a launch layer that includes a built application and its dependencies.  The same buildpack can also contribute a cache-only layer containing the source dependencies.  In subsequent builds the buildpack can detect whether application dependencies have changed.  The subset of dependencies that have changed may be updated on the cache layer.  Then all dependencies may be restored from the cache layer and the built application is contributed as a new launch layer.  In this way we make content-level decisions about the validity of dependencies.  In addition, content-level caching strategies can save time and bandwidth by choosing to update only a subset of the cached content.
