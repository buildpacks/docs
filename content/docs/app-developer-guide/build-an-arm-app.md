+++
title="Build an ARM app"
weight=2
summary="The basics of taking your app from source code to runnable ARM image."
+++

As of today, there are no known released CNB builder images that support building ARM application images. Users can create their own ARM64 builder image by following [this guide][this guide].

In the following tutorial, we will be performing a build "manually", in that we will be performing a build by invoking the lifecycle directly.

### 1. Prepare your working directory

On your Linux ARM machine with a [docker][docker] daemon installed, prepare the following directory tree structure.

```bash
tree ~/workspace/
~/workspace/
├── buildpacks
│   └── samples_hello-world
└── platform
```

In addition, clone the [samples][samples] repository which will contain the application source code.

```bash
# clone the repo
git clone https://github.com/buildpacks/samples ~/workspace/samples
```

### 2. Prepare the assets

Now we need to prepare assets that will be used during the build process.

First we download and extract the [lifecycle][lifecycle] release, compiled for ARM. Make sure to replace `<RELEASE-VERSION>` with a valid release version.

```bash
# change to destination directory
cd ~/workspace

# download and extract lifecycle
curl -L https://github.com/buildpacks/lifecycle/releases/download/v<RELEASE-VERSION>/lifecycle-v<RELEASE-VERSION>+linux.arm64.tgz | tar xf -
```

Next we make sure that our buildpack directory is structured in a way that the lifecycle will expect.

```bash
# copy hello-world buildpack
cp -R ~/workspace/samples/buildpacks/hello-world ~/workspace/buildpacks/samples_hello-world/0.0.1
```

And finally we write the `order.toml` file that references the hello-world buildpack.

```bash
cat > ~/workspace/order.toml <EOF
[[order]]
[[order.group]]
id = "samples/hello-world"
version = "0.0.1"
optional = false
EOF
```

### 3. Build your app

Now we can build our app. For this example we will be using the docker CLI to invoke the lifecycle directly.

```bash
# invoke the lifecycle
docker run --rm \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
  --volume ~/workspace/lifecycle:/cnb/lifecycle \
  --volume ~/workspace/buildpacks:/cnb/buildpacks \
  --volume ~/workspace/samples/apps/bash-script:/workspace \
  --volume ~/workspace/platform:/platform \
  --mount type=bind,source=~/workspace/order.toml,target=/cnb/order.toml \
  --env CNB_PLATFORM_API=0.7 \
  ubuntu:bionic \
  /cnb/lifecycle/creator -log-level debug -daemon -run-image ubuntu:bionic hello-arm64
```

### 4. Run it

```bash
docker run --rm hello-arm64
```

**Congratulations!**

The app image should now be built and stored on the docker daemon. You may perform `docker images` to verify.

[pack]: https://github.com/buildpacks/pack
[docker]: https://docs.docker.com
[samples]: https://github.com/buildpacks/samples
[lifecycle]: https://github.com/buildpacks/lifecycle
[this guide]: https://github.com/dmikusa-pivotal/paketo-arm64
