+++
title="Specify export target"
weight=50
+++

Tell `pack` where you want your application image to be saved.

<!--more-->

By default, when you `pack build` an application, the image will be saved to a daemon, such as Docker or [Podman][podman],
and you can view the image using a command such as `docker image ls`.

However, you could also choose to "publish" the application to an OCI registry, such as Docker Hub or Google Artifact Registry,
or even to a local registry, by providing the `pack build --publish` flag.

Or, you could save the image in OCI layout format on disk by providing the `--layout` flag.
See [here][OCI layout] for more information about working with layout images.

## FAQ: What am I using the daemon for?

Buildpacks always need to run in a containerized environment.
Therefore, even when you publish the application image to a registry,
`pack` is still using a daemon under the hood to create the build container(s) where buildpacks run.

The relationship between the build container and the application container can be seen in the diagram below:

![build diagram](/images/build-container-app-container.svg)

[podman]: /docs/for-app-developers/how-to/special-cases/build-on-podman
[OCI layout]: /docs/for-app-developers/how-to/special-cases/export-to-oci-layout
