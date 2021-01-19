+++
title="Publish a buildpack"
weight=5
summary="Learn how to publish your buildpack to the Buildpack Registry."
+++

{{< param "summary" >}}

### 0. Packaging your buildpack

Make sure you've followed the steps in [Package a buildpack][package] to create your buildpack image and publish it to an OCI registry.

**NOTE:** In order to publish your buildpack to the registry, its `id` must be in the format `<namespace>/<name>`. For example:

```toml
[buildpack]
id = "example/my-cnb"
```

### 1. Register your buildpack

With your buildpack image published to a public OCI registry, you can now run the following command to register that buildpack with the Buildpack Registry (but you must replace `example/my-cnb` with your _image_ name):

```shell script
pack buildpack register example/my-cnb
```

This will open GitHub in a browser and may ask you to authenticate with GitHub. After doing so, you'll see a pre-populated GitHub Issue with the details of your buildpack. For example:

<img src="/images/registry-add-buildpack.png" />

The pre-populated text in the body of the issue is consider structured data, and will be used to automatically add the buildpack to the registry index. Do not change it.

Click _Submit new issue_, and your request will be processed within seconds. If the image is a valid buildpack, it will be added to the registry. If there is a problem, the issue will be tagged as a "Failure" and a comment will be added with a link to get more details. Whether successful or not, the issue will be closed.

> **Managing your namespace**
> 
> The first time you publish a buildpack with a given namespace, the registry will automatically assign your GitHub user as that namespace's owner. From then on, only you can publish new buildpacks or buildpack versions under that namespace.
> 
> If you try to publish a buildpack with a namespace that's already in use, the request will fail and the GitHub issue will be closed.
> 
> You can add or change namespace owners by submitting a Pull Request to the [buildpacks/registry-namespaces](https://github.com/buildpacks/registry-namespaces/).

### 3. Automating the registration

If you would like to publish your buildpack image to the registry without requiring a human click a button in a browser, you can automate the process using the helpers in the [buildpacks/github-actions][github-actions] repository.

To begin, you must store your buildpack source code in GitHub and [enable GitHub Actions](https://github.com/features/actions). Then create a directory named `.github/workflows` in your repository, and add a file named `release.yml` to it. The `release.yml` workflow can be [triggered](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) in many ways, but it's common to use a Release event as a trigger. To do so, add the following to your `release.yml`:

```yaml
name: Release
on:
  release:
    types:
      - published
```

Next, you must configure a job to run when this workflow is triggered. Each workflow job is a set of steps. The steps you'll need to run will depend on how your buildpack is built (for example, you may need to compile some code or download some artifacts). But every buildpack will need the following steps:

1. Checkout the source code
1. Authenticate with an OCI Registry
1. Install Pack
1. Run Pack to package the buildpack and publish the image
1. Register the image with the Buildpack Registry

You can implement a job with these steps in your GitHub Action by adding the following code to your `release.yml` (note the indentation):

```yaml
jobs:
  register:
    name: Package, Publish, and Register
    runs-on:
    - ubuntu-latest
    steps:
    - id: checkout
      uses: actions/checkout@v2
    - if: ${{ github.event_name != 'pull_request' || ! github.event.pull_request.head.repo.fork }}
      uses: docker/login-action@v1
      with:
        registry: docker.io
        username: ${{ secrets.DOCKER_HUB_USER }}
        password: ${{ secrets.DOCKER_HUB_PASS }}
    - id: setup-pack
      uses: buildpacks/github-actions/setup-pack@v4.0.0
    - id: package
      run: |
        #!/usr/bin/env bash
        set -euo pipefail
        BP_ID="$(cat buildpack.toml | yj -t | jq -r .buildpack.id)"
        VERSION="$(cat buildpack.toml | yj -t | jq -r .buildpack.version)"
        PACKAGE="${REPO}/$(echo "$BP_ID" | sed 's/\//_/g')"
        pack package-buildpack --publish ${PACKAGE}:${VERSION}
        DIGEST="$(crane digest ${PACKAGE}:${VERSION})"
        echo "::set-output name=bp_id::$BP_ID"
        echo "::set-output name=version::$VERSION"
        echo "::set-output name=address::${PACKAGE}@${DIGEST}"
      shell: bash
      env:
        REPO: docker.io/${{ secrets.DOCKER_HUB_USER }}
    - id: register
      uses: docker://ghcr.io/buildpacks/actions/registry/request-add-entry:4.0.0
      with:
        token:   ${{ secrets.PUBLIC_REPO_TOKEN }}
        id:      ${{ steps.package.outputs.bp_id }}
        version: ${{ steps.package.outputs.version }}
        address: ${{ steps.package.outputs.address }}
```

Before you execute this GitHub Action, you must add three secrets to your GitHub repository:

* `DOCKER_HUB_USER` - your [Docker Hub](https://hub.docker.com/settings/general) username.
* `DOCKER_HUB_PASS` - a [Docker Hub access token](https://hub.docker.com/settings/security).
* `PUBLIC_REPO_TOKEN` - the value of a [GitHub token](https://github.com/settings/tokens/new) with the `repo:public_repo` scope (the default `GITHUB_TOKEN` provided for GitHub Actions is not sufficient).

After you've created these secrets and pushed your `release.yml` file to GitHub you can trigger the workflow by creating a new Release using the [GitHub Releases UI](https://docs.github.com/en/github/administering-a-repository/about-releases).

From [GitHub.com](https://github.com), click on _Your Repositories_, then click the _Packages_ tab and look for the image you just created. Click it and then select _Package Settings_. From this page, click the button to make this package public, and confirm the name of the image when promoted.

Push the `release.yml` changes to GitHub and trigger a new release. The workflow will create a GitHub Issue on the Buildpack Registry and your buildpack will be added to the index.

It is possible to perform these same step on any automated CI platform, but the Buildpack project only provides helpers for GitHub Actions.

You may store your buildpack image in any standard OCI registry, such as [Docker Hub][docker-hub], [Google Container Registry][gcr], or [GitHub Container Registry][ghcr]. However, [GitHub Packages][github-packages] are not supported as they provide a non-standard implementation of the OCI Registry specification.

[package]: /docs/buildpack-author-guide/package-a-buildpack/
[github-actions]: https://github.com/buildpacks/github-actions
[docker-hub]: https://hub.docker.com/
[gcr]: https://cloud.google.com/container-registry/
[ghcr]: https://docs.github.com/en/packages/guides/about-github-container-registry
[github-packages]: https://docs.github.com/en/packages/guides/configuring-docker-for-use-with-github-packages
