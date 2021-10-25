+++
title="Publishing with Github Actions"
weight=5
summary="Learn how to automatically publish your buildpack to the Buildpack Registry from a Github Action."
+++

If you would like to publish your buildpack image to the registry without requiring a human to click a button in a browser, you can automate the process using the helpers in the [buildpacks/github-actions][github-actions] repository.

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
      uses: buildpacks/github-actions/setup-pack@v4.4.0
    - id: package
      run: |
        #!/usr/bin/env bash
        set -euo pipefail
        BP_ID="$(cat buildpack.toml | yj -t | jq -r .buildpack.id)"
        VERSION="$(cat buildpack.toml | yj -t | jq -r .buildpack.version)"
        PACKAGE="${REPO}/$(echo "$BP_ID" | sed 's/\//_/g')"
        pack buildpack package --publish ${PACKAGE}:${VERSION}
        DIGEST="$(crane digest ${PACKAGE}:${VERSION})"
        echo "::set-output name=bp_id::$BP_ID"
        echo "::set-output name=version::$VERSION"
        echo "::set-output name=address::${PACKAGE}@${DIGEST}"
      shell: bash
      env:
        REPO: docker.io/${{ secrets.DOCKER_HUB_USER }}
    - id: register
      uses: docker://ghcr.io/buildpacks/actions/registry/request-add-entry:4.4.0
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

From [GitHub.com](https://github.com), click on _Your Repositories_, then click the _Packages_ tab and look for the image you just created. Click it and then select _Package Settings_. From this page, click the button to make this package public, and confirm the name of the image when prompted.

Push the `release.yml` changes to GitHub and trigger a new release. The workflow will create a GitHub Issue on the Buildpack Registry and your buildpack will be added to the index.

It is possible to perform these same step on any automated CI platform, but the Buildpack project only provides helpers for GitHub Actions.

You may store your buildpack image in any standard OCI registry, such as [Docker Hub][docker-hub], [Google Container Registry][gcr], or [GitHub Container Registry][ghcr]. However, [GitHub Packages][github-packages] are not supported as they provide a non-standard implementation of the OCI Registry specification.

[package]: /docs/buildpack-author-guide/package-a-buildpack/
[github-actions]: https://github.com/buildpacks/github-actions
[docker-hub]: https://hub.docker.com/
[gcr]: https://cloud.google.com/container-registry/
[ghcr]: https://docs.github.com/en/packages/guides/about-github-container-registry
[github-packages]: https://docs.github.com/en/packages/guides/configuring-docker-for-use-with-github-packages
