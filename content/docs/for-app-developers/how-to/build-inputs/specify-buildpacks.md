
+++
title="Specify buildpacks or extensions at build time"
aliases=[
  "/docs/app-developer-guide/specify-buildpacks"
]
weight=1
summary="No builder author can be truly omniscient, and whoever created yours surely was no exception!"
+++

You may specify exactly what buildpacks are used during the build process by referencing them with a URI in any of the following formats.

| Type                  | Format                                       |
|-----------------------|----------------------------------------------|
| Relative              | `<path>`                                     |
| Filesystem            | `file://[<host>]/<path>`                     |
| URL                   | `http[s]://<host>/<path>`                    |
| Docker                | `docker://[<host>]/<path>[:<tag>⏐@<digest>]` |
| CNB Builder Resource  | `urn:cnb:builder[:<id>[@<version>]]`         |
| CNB Registry Resource | `urn:cnb:registry[:<id>[@<version>]]`        |

##### Fallback Behavior

When a string does not include a scheme prefix (ex. `docker://`) and also does not match a path on the filesystem,
a platform may attempt to resolve it to a URI in the following order:
- If it matches a buildpack ID in the builder, it will be treated as a `urn:cnb:builder` URI
- If it looks like a Docker ref, it will be treated as a `docker://` URI
- If it looks like a Buildpack Registry ID, it will be treated as a `urn:cnb:registry` URI

If you need to disambiguate a particular reference, use a fully qualified URI.

## Using the Pack CLI

The `--buildpack` parameter accepts a URI in any of the formats described above.

##### Example:

For this example we will use a few buildpacks from our [samples][samples] repo.

```
pack build sample-java-maven-app \
    --builder registry.example.com/example/builder:alpine \
    --buildpack samples/java-maven \
    --buildpack samples/buildpacks/hello-processes/ \
    --buildpack docker://registry.example.com/example/sample-package:hello-universe \
    --path samples/apps/java-maven/
```
<!--+- "{{execute}}"+-->

> Multiple buildpacks can be specified, in order, by supplying:
>
> - `--buildpack` multiple times, or
> - a comma-separated list to `--buildpack` (without spaces)

Similarly, it is possible to provide extensions at build time:

```bash
pack build [...] --extension=foo [...]`
```

## Using a Project Descriptor

The [`project.toml`][project-toml] format allows for Buildpack URIs to be specified in the `[[io.buildpacks.group]]` table with the `uri` key.

##### Example:

```toml
[_]
schema-version = "0.2"
id = "sample-java-maven-app"
name = "Sample Java App"
version = "1.0.0"

[[io.buildpacks.group]]
uri = "samples/java-maven"

[[io.buildpacks.group]]
uri = "samples/buildpacks/hello-processes/"

[[io.buildpacks.group]]
uri = "docker://registry.example.com/example/sample-package:hello-universe"
```

## URI Examples

A path to a directory<sup><small>†</small></sup>, `tar` file, or `tgz` file

- `./my/buildpack/`
- `./my/buildpack.tgz`
- `/home/user/my/buildpack.tgz`
- `file:///my/buildpack.tgz`
- `file:///home/user/my/buildpack.tgz`

A URL to a `tar` or `tgz` file containing a buildpackage
- `http://example.com/my/buildpack.tgz`
- `https://example.com/my/buildpack.tgz`

A Docker image containing a buildpackage
- `docker://gcr.io/distroless/nodejs`
- `docker:///ubuntu:latest`
- `docker:///ubuntu@sha256:45b23dee08...`

A buildpack located in a CNB Builder
- `urn:cnb:builder:bp.id`
- `urn:cnb:builder:bp.id@bp.version`

A buildpack located in a CNB Registry
- `urn:cnb:registry:bp-id`
- `urn:cnb:registry:bp-id@bp.version`

<small><sup>†</sup> Directory buildpacks are not currently supported on Windows.</small><br />
<small><sup>‡</sup> Version may be omitted if there is only one buildpack in the builder matching the `id`.</small>

[project-toml]: /docs/for-app-developers/how-to/build-inputs/use-project-toml/
[samples]: https://github.com/buildpacks/samples
