+++
title="Export to OCI layout format"
weight=3
summary="Learn how to export your application image to disk in OCI layout format"
+++

<div class="quote mb-4">
    The OCI Image Layout is the directory structure for OCI content-addressable blobs and location-addressable references.
    <div class="author">See the <a href="https://github.com/opencontainers/image-spec/blob/main/image-layout.md">specification</a></div>
</div>

Exporting to OCI layout format is an **experimental** feature available on pack since version X.Y.Z

### 1. Enable experimental feature

Verify your pack version is equal or greater than X.Y.Z

```bash
pack version
```

Enable the experimental features on pack

```bash
pack config experimental true
```

You can confirm everything is fine, checking the `config.toml` file in your `PACK_HOME` installation folder, for example:

```bash
cat ~/.pack/config.toml
experimental = true
layout-repo-dir = "<$HOME>/.pack/layout-repo"
```

The configuration shows the experimental mode was **enabled** and a local directory to save images on disk was configured to path `<$HOME>/.pack/layout-repo`.

### 2. Build the app

If you haven't already, please follow the steps to [build an app](/docs/app-developer-guide/build-an-app). 

The OCI layout feature must be enabled using the convention `oci:<path/to/save/image>` in the `<image-name>` parameter when invoking `pack build`.

For example:

```bash
pack build oci:sample-app --path samples/apps/java-maven --builder cnbs/sample-builder:bionic
```

It will save the image in a folder *sample-app* created in the current directory.

### 3. Check your image

**Congratulations!**

You can verify your application image was saved on disk in a folder called *sample-app* in your current directory in OCI layout format, for example:

```bash
tree sample-app

sample-app
├── blobs
│   └── sha256
│       ├── 2fa192256ce255c6ea6c1296eadfe2feba8094f40e6aa85e699645caca2e85d8
│       ├── 5a44e4f7b58d74fe6f92dd7028075c91191128d1e2e7f39846fe061a9a98836e
│       └── 622426666a7b61c086c84203082d5f64495be1f8b085137e53b0554cfcdb50ab
├── index.json
└── oci-layout     
```

---

## Extra configuration

### Skip saving your run-image layers on disk

If you don't need your `run-image` layers on disk, you can skip them using `--sparse` flag in your `pack build` command invocation

## Implementation notes

### Media Types

According to the OCI specification, the [compatibles media types](https://github.com/opencontainers/image-spec/blob/main/media-types.md#compatibility-matrix) for the index.json files must be:

- `application/vnd.oci.image.index.v1+json` or
- `application/vnd.docker.distribution.manifest.list.v2+json` 

If you are trying to use the lifecycle directly without using `pack` to export your image, take on consideration that tools like:

[skopeo](https://github.com/containers/skopeo)
```bash
skopeo copy -a docker://<your-image> <dest>
```
It will give you `application/vnd.oci.image.index.v1+json` media type, which is currently working

But [crane](https://github.com/google/go-containerregistry/tree/main/cmd/crane) 

```bash
crane pull <your-image> <dest> --format=oci
```
It will give you `application/vnd.docker.distribution.manifest.list.v2+json`, which will fail





