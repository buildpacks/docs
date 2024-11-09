
+++
title="Export to OCI layout format on disk"
aliases=[
  "/docs/features/experimental/export-to-oci-layout"
]
weight=3
summary="The OCI Image Layout is the directory structure for OCI content-addressable blobs and location-addressable references."
+++

<!--more-->

<div class="quote mb-4">
    The OCI Image Layout is the directory structure for OCI content-addressable blobs and location-addressable references.
    <div class="author">See the <a href="https://github.com/opencontainers/image-spec/blob/main/image-layout.md">specification.</a></div>
</div>

Exporting to OCI layout format is an **experimental** feature available on pack since version 0.30.0

### 1. Enable experimental feature

Verify your pack version is equal or greater than 0.30.0

```bash
pack version
```

Enable the experimental features on pack

```bash
pack config experimental true
```

You can confirm everything is fine, checking the `config.toml` file in your `PACK_HOME` installation folder. For example:

```bash
cat ~/.pack/config.toml
experimental = true
layout-repo-dir = "<$HOME>/.pack/layout-repo"
```

The configuration shows the experimental mode was **enabled** and a local directory to save images on disk was configured to path `<$HOME>/.pack/layout-repo`. `layout-repo-dir` is being used as a [local repository](https://github.com/buildpacks/rfcs/blob/main/text/0119-export-to-oci.md#how-it-works) 
to save images requires by `pack build` command in OCI layout format.

### 2. Build the app

Please first follow the steps to [build an app](/docs/for-app-developers/tutorials/basic-app), once you have successfully built an application you can export the sample application to disk in OCI layout format. 

The OCI layout feature must be enabled using the convention `oci:<path/to/save/image>` in the `<image-name>` parameter when invoking `pack build`.

For example:

```bash
pack build oci:sample-app --path samples/apps/java-maven --builder cnbs/sample-builder:noble
```

It will save the image in a folder `./sample-app` created in your current directory.

### 3. Check your image

**Congratulations!**

You can verify your application image was saved on disk in a folder called `./sample-app` in your current directory in OCI layout format. For example:

```bash
tree sample-app

sample-app
├── blobs
│ └── sha256
│     ├── 141bfb0cd434d425bc70edb9e56ea11d07aed76450eb0e73e6110645f251a8d3
│     ├── 2fa192256ce255c6ea6c1296eadfe2feba8094f40e6aa85e699645caca2e85d8
│     ├── 5a44e4f7b58d74fe6f92dd7028075c91191128d1e2e7f39846fe061a9a98836e
│     ├── 72d9f18d70f395ff9bfae4d193077ccea3ca583e3da3dd66f5c84520c0100727
│     ├── 827746ec7ba80f4e4811b6c9195b6f810fbc2d58a6c9cc337bf0305791f24e97
│     ├── ad13830c92258c952f25d561d8bf7d9eb58b8a3003960db1502cbda8239130b5
│     ├── b97b58b190d5f731c879b0f7446a2bd554863b51851e03757199c74dd922ce61
│     ├── c44222730efa142cd5bedc0babf82a9a07d325494be7f5c3cfde56f43166b65f
│     ├── e1048fb89c3194a1f0542c0847aa086a7034dd7867c48fe8c93675cf36f90610
│     ├── f0a30c5bc44742065b1b4ffa95271a39994f05ba7a03dd7e7143d1d3e45fa0b1
│     └── f9d6350d0c44c0e7165a522155f53181ce8c163a6b8ead1f6baea22d1a8d8a78
├── index.json
└── oci-layout  

3 directories, 13 files
```
If you want to keep playing with the image in  OCI layout format, one tool you can take a look at is [umoci](https://umo.ci/). It can help you to create a 
[runtime bundler](https://github.com/opencontainers/runtime-spec) that can be executed with another tool like [runc](https://github.com/opencontainers/runc)

---

## Extra configuration

### Skip saving your run-image layers on disk

Before using this option we suggest to remove your local layout directory (the one configured in your pack config.toml with the key `layout-repo-dir`) and 
your application image folder (if you are planning to use the same folder). The reason for this is pack doesn't remove the blobs saved in the `layout-repo-dir` if you use the `--sparse` flag 

If you don't need your `run-image` layers on disk, you can skip them using `--sparse` flag in your `pack build` command invocation.

For example:

```bash
pack build oci:sample-app --sparse --path samples/apps/java-maven --builder cnbs/sample-builder:noble
```

Verify your application image

```bash
sample-app
├── blobs
│ └── sha256
│     ├── 2ebed3ab57806441e2bf814eaf0648ed77289e058340d2b76d32b422fbaac5d8
│     ├── 2fa192256ce255c6ea6c1296eadfe2feba8094f40e6aa85e699645caca2e85d8
│     ├── 5a44e4f7b58d74fe6f92dd7028075c91191128d1e2e7f39846fe061a9a98836e
│     ├── 741e558b7b807fea350b26b8152170a2463277cb3d1268b60de76ec12608518a
│     ├── 907c84671180d979a38affb62d9a6ea8e9a510e27639e0b60a34a42f1a846ddc
│     ├── ad13830c92258c952f25d561d8bf7d9eb58b8a3003960db1502cbda8239130b5
│     ├── c44222730efa142cd5bedc0babf82a9a07d325494be7f5c3cfde56f43166b65f
│     └── f9d6350d0c44c0e7165a522155f53181ce8c163a6b8ead1f6baea22d1a8d8a78
├── index.json
└── oci-layout

3 directories, 10 files
```

As you can see, there are 3 missing files at `sample-app/blobs/sha256` folder. The missing 3 blobs are the blobs from the 
`run-image` that were not downloaded but if you check your config file you'll notice you have the same number of layers as 
when you export the full image.

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
It will give you `application/vnd.docker.distribution.manifest.list.v2+json`, which will fail because of the [state of our current implementation](https://github.com/buildpacks/rfcs/pull/203#discussion_r1092449172), we will improve this behavior in future versions.





