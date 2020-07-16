+++
title="Distribution API"
aliases=["/docs/reference/distribution-api/"]
+++

This specification defines the artifact format, delivery mechanism, and order resolution process for buildpacks.

<!--more-->

## Buildpack Descriptor

A buildpack must contain a `buildpack.toml` file in its root directory.

## Buildpackage

A buildpackage is a distributable artifact that contains a buildpack. Its format may be either:

* An OCI image
* An uncompressed tar archive with the extension `.cnb` containing an OCI image.

## Further Reading

You can read the complete [Distribution specification on Github](https://github.com/buildpacks/spec/blob/main/distribution.md).
