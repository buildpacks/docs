
+++
title="Mount volumes at build-time"
aliases=[
  "/docs/app-developer-guide/mounting-volumes"
]
weight=3
summary="Supply and persist data from build containers with arbitrary volume mounts."
+++

## Mounting Volumes (`--volume`)

The `--volume` parameter must be one of the following:

 - A volume mount.
 - A comma separated list of volume mounts.

Each volume mount has the following format:
```
<host path>:<target path>[:<mode>]
```

##### `<host path>`
This is the name of the volume, it is unique on a given host machine.

##### `<target path>`
The path where the file or directory is available in the container.

##### `[:<mode>]` 
An optional comma separated list of mount options. If no options are provided, the read-only option will be used.
A mount option must be one of the following:
  - `ro`, volume contents are read-only.
  - `rw`, volume contents are readable and writeable.
  - `volume-opt=key=value`, can be specified more than once, takes a key-value pair consisting of the option name and its value.


### Examples
For the following examples we will use our [samples][samples] repo for simplicity.

Here we bind mount a local folder into our container and display its contents during 
a `pack build`.

#### Linux container example

<!-- test:suite=volumes:linux -->

<!-- test:setup:exec -->
<!--
```
git clone https://github.com/buildpack/samples
```
-->

<!-- test:teardown:exec -->
<!--
```
docker volume rm test-volume
```
-->

We'll create a new docker volume:

<!-- test:exec -->
```bash
docker volume create test-volume
```
<!--+- "{{execute}}"+-->

Next, we'll create a text file on the volume:

<!-- test:exec -->
```bash
docker run --rm \
    --volume test-volume:/tmp/volume:rw \
    bash \
    bash -c 'echo "Hello from a volume!" > /tmp/volume/volume_contents.txt'
```
<!--+- "{{execute}}"+-->

Now, we can mount this volume during `pack build`:

<!-- test:exec -->
```bash
ls -al
pack build volume-example \
    --builder cnbs/sample-builder:noble \
    --buildpack samples/buildpacks/hello-world \
    --path samples/apps/bash-script \
    --volume test-volume:/platform/volume:ro
```
<!--+- "{{execute}}"+-->

The above `pack build ...` command will mount the `test-volume` volume in the `/platform` directory of the container.

Since we are using the `samples/hello-world` buildpack, we should see the `/platform` directory files listed:

```text
[builder]      platform_dir files:
...
[builder]        /platform/volume:
[builder]        total 12
[builder]        drwxr-xr-x 2 root root 4096 Sep 17 20:17 .
[builder]        drwxr-xr-x 1 root root 4096 Sep 17 20:18 ..
[builder]        -rw-r--r-- 1 root root   21 Sep 17 20:18 volume_contents.txt
```

[samples]: https://github.com/buildpack/samples
