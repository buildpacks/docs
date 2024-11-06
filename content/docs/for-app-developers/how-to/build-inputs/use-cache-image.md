
+++
title="Use a cache image"
aliases=[
  "/docs/app-developer-guide/using-cache-image"
]
weight=6
summary="Share layers between builds with a cache image."
+++

Cache images are a way to preserve build-optimizing layers across different host machines. 
These images can improve performance when using `pack` in ephemeral environments such as CI/CD pipelines.

## Using Cache Images (`--cache-image`)

The `--cache-image` parameter must be in the following format

```
--cache-image <remote-image-location>
```

The `--cache-image` flag must be specified in conjunction with the `--publish` flag.

### Examples
For the following examples we will use:
 - A local [Docker v2 registry running on port `5000`](https://docs.docker.com/registry/deploying/#run-a-local-registry)
 - Our [samples][samples] repo

> **NOTE:**  If we wish to publish to an external registry like `Dockerhub` we will first need to authenticate with `docker` to allow us to push images. We can do this via `docker login`


Next we trust the `cnbs/sample-builder:noble` builder in order to allow access to docker credentials when publishing.

```
pack config trusted-builders add cnbs/sample-builder:noble
```
<!--+- "{{execute}}"+-->

To build the `localhost:5000/buildpack-examples/cache-image-example` application image
 and the `localhost:5000/buildpack-examples/maven-cache-image:latest` cache image
 we may run the following 

```
pack build localhost:5000/buildpack-examples/cache-image-example \
    --builder cnbs/sample-builder:noble \
    --buildpack samples/java-maven \
    --path samples/apps/java-maven \
    --cache-image localhost:5000/buildpack-examples/maven-cache-image:latest \
    --network host \
    --publish
```
<!--+- "{{execute}}"+-->

> **NOTE:**  Please omit `--network host` if you are using a remote registry like Dockerhub or on Windows.

Now we may inspect both the application image, and the cache image by pulling them -

Let's inspect the application image first -

```
docker pull localhost:5000/buildpack-examples/cache-image-example
docker inspect localhost:5000/buildpack-examples/cache-image-example
```
<!--+- "{{execute}}"+-->

Now let's take a look at the cache image - 
```
docker pull localhost:5000/buildpack-examples/maven-cache-image:latest
docker inspect localhost:5000/buildpack-examples/maven-cache-image:latest
```
<!--+- "{{execute}}"+-->

The cache image we produced may now be used by builds on other machines. Note these
builds may also update the specified `cache-image`.

The following command will restore data for the `samples/java-maven:maven_m2` layer from the cache image.
```
pack build localhost:5000/buildpack-examples/second-cache-image-example \
    --builder cnbs/sample-builder:noble \
    --buildpack samples/java-maven \
    --path samples/apps/java-maven \
    --cache-image localhost:5000/buildpack-examples/maven-cache-image:latest \
    --network host \
    --publish
```
<!--+- "{{execute}}"+-->

### Image Retention

Managing the lifecycle of images should be the responsibility of the owner, as `the platform does not automatically clean up old images from the registry`.   
You can refer to your registry's documentation to learn how to accomplish this.   
* [AWS ECR](https://aws.amazon.com/ecr/) users can find information on how to delete images in the AWS ECR documentation, specifically in the section on [image deletion](https://docs.aws.amazon.com/AmazonECR/latest/userguide/delete_image.html).
* [Docker](https://docs.docker.com/engine/) users can consult the Docker documentation on [Advanced Image Management](https://docs.docker.com/docker-hub/image-management/) to find out how to delete images.


[samples]: https://github.com/buildpack/samples
