+++
title="What is a composite buildpack?"
weight=99
+++

A composite buildpack, also sometimes called a "meta buildpack",
is a buildpack that does not contain any `./bin/detect` or `./bin/build` binaries,
but instead references other buildpacks in its `buildpack.toml` via the `[[order]]` array.

This is useful for composing more complex detection strategies.
