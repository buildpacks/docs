+++
title="Building on Podman"
weight=99
summary="Use podman as an alternative to Docker with Cloud Native Buildpacks."
aliases=[
    "/docs/using-pack/building-app/"
]
+++

### What is Podman?

To quote from the official documentation:

> Podman is a daemonless, open source, Linux native tool designed to make it easy to find, run, build, share and deploy applications using Open Containers Initiative (OCI) Containers and Container Images.

It can be used as a standalone daemonless CLI with sub-commands and flags almost identical the standard `docker` CLI. You can even alias `docker=podman` and everything should work as expected.

Beside running as a standalone daemonless CLI, `podman` can also serve as a `docker` API daemon using `podman system service` sub-command. You just need to set the `DOCKER_HOST` environment and most applications will pick it up (`pack` is one of them).

While `podman` is native to Linux you still can enjoy it on `macOS` using virtual machine. There is sub-command `podman machine` facilitating VM creation making it really easy.

# Setup

Minimal required versions:

  * `podman v3.3.0` or newer
  * [`pack v0.22.0`](/docs/tools/pack/) or newer

---

{{< podman-setup >}}

# Usage

## Build

### Source

![](https://i.imgur.com/JVr0uue.png)

```shell=bash
git clone https://github.com/buildpacks/samples
```

### `pack build`

![](https://i.imgur.com/0mmV6K7.png)

```shell=bash
pack build sample-app -p samples/apps/ruby-bundler/ -B cnbs/sample-builder:bionic
```

Where:
  - `sample-app` is the image name of the image to be created.
  - `-p` is the **path** to the application source.
  - `-B` is the **[builder][builder]** to use.

> **NOTE**: If using a _socket_ connection, for example on Linux, you'll need to pass an additional flag in order to provide the proper socket location to the `lifecycle`: `--docker-host=inherit`
> <br/><br/>
> In the future, this may be [automatically detected](https://github.com/buildpacks/pack/issues/1338).

### Results

![](https://i.imgur.com/D0Wwm9Z.png)

```shell=bash
podman images
```

[builder]: https://buildpacks.io/docs/concepts/components/builder/

---

# Known Issues & Limitations

  * On `macOS` bind mounts do not work since the VM cannot access host file system.
  * With more time consuming builds and `--trust-builder=true` following error may occur:
    ```
    ERROR: failed to image: error during connect: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.40/info": EOF
    ```
    There is a workaround for this, increase timeout of podman service:
    ```shell=bash
    cat <<EOF > /etc/systemd/user/podman.service
    [Unit]
    Description=Podman API Service
    Requires=podman.socket
    After=podman.socket
    Documentation=man:podman-system-service(1)
    StartLimitIntervalSec=0

    [Service]
    Type=exec
    KillMode=process
    Environment=LOGGING="--log-level=info"
    ExecStart=/usr/bin/podman $LOGGING system service --time=1800

    [Install]
    WantedBy=multi-user.target
    EOF
    
    systemctl --user daemon-reload
    systemctl restart --user podman.socket
    ```

    On `macOS` you need to run this in the VM (use `podman machine ssh`).