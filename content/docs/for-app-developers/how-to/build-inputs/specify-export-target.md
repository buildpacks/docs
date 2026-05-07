+++
title="Specify export target"
weight=50
+++

Tell `pack` where you want your app image to be saved.

<!--more-->

By default, when you build an app with `pack build <my-image>`, the image will be saved to a daemon, such as Docker or [Podman][podman],
and you can view the image using a command such as `docker image ls`.

However, you could also choose to "publish" the app to an OCI registry, such as Docker Hub or Google Artifact Registry,
or even to a local registry, by providing the `pack build --publish` flag.

Or, you could save the image in OCI layout format on disk by prefixing your image name with `oci:`, as in `pack build oci:<my-image>`.
See [here][OCI layout] for more information about working with layout images.

## FAQ: what am I using the daemon for?

Buildpacks always need to run in a containerized environment.
Therefore, even when you publish the app image to a registry,
`pack` is still using a daemon under the hood to create the build containers where buildpacks run.

The relationship between the build container and the app container can be seen in the diagram below:

![build diagram](/images/build-container-app-container.svg)

[podman]: /docs/for-app-developers/how-to/special-cases/build-on-podman
[OCI layout]: /docs/for-app-developers/how-to/special-cases/export-to-oci-layout
