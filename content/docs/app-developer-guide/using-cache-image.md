+++
title="Cache Images"
weight=4
summary="Learn how to use cache-images to share cached layers"
+++

Cache Images are a way to preserve build optimizing layers across different host machines. 
These images can improve performance when using `pack` in ephemeral environments such as CI/CD pipelines.


## Using Cache Images (`--cache-image`)

The `--cache-image` parameter must be in the following format

```
--cache-image <remote-image-location>
```

The `--cache-images` flag must be specified in conjunction with the `--publish` flag.

### Examples
For the following examples we will use:
 - The Dockerhub registry
 - A sample Dockerhub user account named `buildpack-examples`
 - Our [samples][samples] repo

First we need to authenticate with `docker` to allow us to push images
```
    docker login
    ...
```

Next we trust the `cnbs/sample-builder:bionic` builder
 in order to allow access to docker credentials when publishing.
```
pack config trusted-builders add cnbs/sample-builder:bionic
```

To build an the `index.docker.io/buildpack-examples/cache-image-example` application image
 and the `index.docker.io/buildpack-examples/maven-cache-image:latest` cache image
 we may run the following 

```
pack build index.docker.io/buildpack-examples/cache-image-example \
    --builder cnbs/sample-builder:bionic \
    --buildpack samples/java-maven \
    --path samples/apps/java-maven \
    --cache-image index.docker.io/buildpack-examples/maven-cache-image:latest \
    --publish
```

Now we may inspect both the application image, and the cache image by pulling them 

```
# application image inspect
docker pull index.docker.io/buildpack-examples/cache-image-example
docker inspect index.docker.io/buildpack-examples/cache-image-example

#cache image inspect
docker pull index.docker.io/buildpacks-examples/maven-cache-image:latest
docker inspect index.docker.io/buildpacks-examples/maven-cache-image:latest
```

The cache image we produced may now be used by builds on other machines. Note these
builds may also update the specified `cache-image`.

The following command will restore data for the `samples/java-maven:maven_m2` layer from the cache image.
```
pack build index.docker.io/buildpack-examples/second-cache-image-example \
    --builder cnbs/sample-builder:bionic \
    --buildpack samples/java-maven \
    --path samples/apps/java-maven \
    --cache-image index.docker.io/buildpack-examples/maven-cache-image:latest \
    --publish
```

[samples]: https://github.com/buildpack/samples