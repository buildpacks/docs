# Cache Images
# Cache Images


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
 - A local [Docker v2 registry running on port `5000`](https://docs.docker.com/registry/deploying/#run-a-local-registry)
 - Our [samples][samples] repo

> **NOTE:**  If we wish to publish to an external registry like `Dockerhub` we will first need to authenticate with `docker` to allow us to push images. We can do this via `docker login`


Next we trust the `cnbs/sample-builder:bionic` builder in order to allow access to docker credentials when publishing.

```
pack config trusted-builders add cnbs/sample-builder:bionic
```{{execute}}

To build the `localhost:5000/buildpack-examples/cache-image-example` application image
 and the `localhost:5000/buildpack-examples/maven-cache-image:latest` cache image
 we may run the following 

```
pack build localhost:5000/buildpack-examples/cache-image-example \
    --builder cnbs/sample-builder:bionic \
    --buildpack samples/java-maven \
    --path samples/apps/java-maven \
    --cache-image localhost:5000/buildpack-examples/maven-cache-image:latest \
    --network host \
    --publish
```{{execute}}

> **NOTE:**  Please omit `--network host` if you are using a remote registry like Dockerhub or on Windows.

Now we may inspect both the application image, and the cache image by pulling them -

Let's inspect the application image first -

```
docker pull localhost:5000/buildpack-examples/cache-image-example
docker inspect localhost:5000/buildpack-examples/cache-image-example
```{{execute}}

Now let's take a look at the cache image - 
```
docker pull localhost:5000/buildpack-examples/maven-cache-image:latest
docker inspect localhost:5000/buildpack-examples/maven-cache-image:latest
```{{execute}}

The cache image we produced may now be used by builds on other machines. Note these
builds may also update the specified `cache-image`.

The following command will restore data for the `samples/java-maven:maven_m2` layer from the cache image.
```
pack build localhost:5000/buildpack-examples/second-cache-image-example \
    --builder cnbs/sample-builder:bionic \
    --buildpack samples/java-maven \
    --path samples/apps/java-maven \
    --cache-image localhost:5000/buildpack-examples/maven-cache-image:latest \
    --network host \
    --publish
```{{execute}}

[samples]: https://github.com/buildpack/samples