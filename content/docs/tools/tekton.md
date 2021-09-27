+++
title="Tekton"
+++

[Tekton][tekton] is an open-source CI/CD system platform implementation running on k8s. There are two Tekton `tasks`
maintained by the CNB project, both of which use the [lifecycle][lifecycle] directly (i.e. they do not use `pack`).

<!--more-->

They are:

1. [buildpacks][buildpacks-task] `task` &rarr; This task, which we recommend using, calls the `creator` binary of the
   [lifecycle][lifecycle] to construct, and optionally publish, a runnable image.
2. [buildpacks-phases][buildpacks-phases] `task` &rarr; This task calls the individual [lifecycle][lifecycle] binaries, to run each phase in a separate container.

## Set Up

> NOTE: Prior to installing `Tekton`, we recommend reviewing the basic Tekton concepts in the [documentation][tekton-concepts].

### Prerequisites

Before we get started, make sure you've got the following installed:

{{< download-button href="https://kubernetes.io/docs/tasks/tools/install-kubectl/" color="blue" >}} Install kubectl {{</>}}

### 1. Install Tekton and Tekton Dashboard

To start, set up `Tekton`, using the Tekton [documentation][tekton-setup].

We also recommend using the `Tekton dashboard`. To install it, follow the steps in the [dashboard docs][tekton-dashboard-setup], and
start the dashboard server.

### 2. Install the Buildpacks Task

Install the latest version of the buildpacks task (currently `0.3`), by running:

```shell
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/master/task/buildpacks/0.3/buildpacks.yaml
```

### 3. Install git-clone Task

For our `pipeline`, we will use the `git-clone` task to clone a repository. Install the latest version (currently `0.4`), by running:

```shell
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/master/task/git-clone/0.4/git-clone.yaml
```

### 4. Define and Apply Tekton Pipeline Resources

In order to set up our pipeline, we will need to define a few things:

- Pipeline &rarr; A `Pipeline` defines a series of `Tasks` that accomplish a specific build or delivery goal. The `Pipeline`
  can be triggered by an event or invoked from a `PipelineRun`.
- PipelineResource &rarr; A `PipelineResource` defines locations for inputs ingested and outputs produced by the steps in `Tasks`.
- PersistentVolumeClaim &rarr; A `PersistentVolumeClaim` (a general Kubernetes concept, generally shortened to PVC) is
  a request for storage by a user.

#### 4.1 PVCs

Create a file `resources.yml` that defines a `PersistentVolumeClaim`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: buildpacks-source-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
```

#### 4.2 Authorization

> NOTE: You don't need to use authorization if you are pushing to a local registry. However, if you are pushing to a
> remote registry (e.g. `DockerHub`, `GCR`), you need to add authorization

Create a `Secret` containing username and password that the build should use to authenticate to the container registry.

```shell
kubectl create secret docker-registry docker-user-pass \
    --docker-username=<USERNAME> \
    --docker-password=<PASSWORD> \
    --docker-server=<LINK TO REGISTRY, e.g. https://index.docker.io/v1/ > \
    --namespace default
```

Create a file `sa.yml` that defines a `ServiceAccount` that uses the newly created secret:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: buildpacks-service-account
secrets:
  - name: docker-user-pass
```

#### 4.3 Pipeline

Create a file `pipeline.yml` that defines the `Pipeline`, and relevant resources:

```yaml
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: buildpacks-test-pipeline
spec:
  params:
    - name: image
      type: string
      description: image URL to push
  workspaces:
    - name: source-workspace # Directory where application source is located. (REQUIRED)
    - name: cache-workspace # Directory where cache is stored (OPTIONAL)
  tasks:
    - name: fetch-repository # This task fetches a repository from github, using the `git-clone` task you installed
      taskRef:
        name: git-clone
      workspaces:
        - name: output
          workspace: source-workspace
      params:
        - name: url
          value: https://github.com/buildpacks/samples
        - name: subdirectory
          value: ""
        - name: deleteExisting
          value: "true"
    - name: buildpacks # This task uses the `buildpacks` task to build the application
      taskRef:
        name: buildpacks
      runAfter:
        - fetch-repository
      workspaces:
        - name: source
          workspace: source-workspace
        - name: cache
          workspace: cache-workspace
      params:
        - name: APP_IMAGE
          value: "$(params.image)"
        - name: SOURCE_SUBPATH
          value: "apps/java-maven" # This is the path within the samples repo you want to build (OPTIONAL, default: "")
        - name: BUILDER_IMAGE
          value: paketobuildpacks/builder:base # This is the builder we want the task to use (REQUIRED)
    - name: display-results
      runAfter:
        - buildpacks
      taskSpec:
        steps:
          - name: print
            image: docker.io/library/bash:5.1.4@sha256:b208215a4655538be652b2769d82e576bc4d0a2bb132144c060efc5be8c3f5d6
            script: |
              #!/usr/bin/env bash
              set -e
              echo "Digest of created app image: $(params.DIGEST)"
        params:
          - name: DIGEST
      params:
        - name: DIGEST
          value: $(tasks.buildpacks.results.APP_IMAGE_DIGEST)
```

#### 4.4 Apply Configuration

Apply these configurations, using `kubectl`:

```shell
kubectl apply -f resources.yml -f sa.yml -f pipeline.yml
```

### 5. Create & Apply PipelineRun

Create a file `run.yml`, which defines the `PipelineRun`:

```yaml
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: buildpacks-test-pipeline-run
spec:
  serviceAccountName: buildpacks-service-account # Only needed if you set up authorization
  pipelineRef:
    name: buildpacks-test-pipeline
  workspaces:
    - name: source-workspace
      subPath: source
      persistentVolumeClaim:
        claimName: buildpacks-source-pvc
    - name: cache-workspace
      subPath: cache
      persistentVolumeClaim:
        claimName: buildpacks-source-pvc
  params:
    - name: image
      value: <REGISTRY/IMAGE NAME, eg gcr.io/test/image > # This defines the name of output image
```

> Make sure to replace `<REGISTRY/IMAGE NAME>` with your image path.

Apply it with:

```shell
kubectl apply -f run.yml
```

### 6. See it Build

Look at the `PipelineRun` logs by running

```shell
kubectl describe pipelinerun buildpacks-test-pipeline-run
```

or by using the Tekton Dashboard.

Once the application is successfully built, you can pull it and run it by running:

```shell
docker pull some-output-image
```

### 7. Cleanup (Optional)

To clean up, run:

```shell
kubectl delete taskrun --all
kubectl delete pvc --all
kubectl delete pv --all
```

## References

The Buildpacks tasks can be accessed at:

- [Buildpacks Task Source][buildpacks-task]
- [Buildpacks Phases Task Source][buildpacks-phases]

Some general resources for Tekton are:

- [Tekton: Getting Started][tekton-setup]
- [Tekton Dashboard: Setup][tekton-dashboard-setup]
- [Tekton Concepts][tekton-concepts]
- [Tekton Authorization Documentation][tekton-auth]

[tekton]: https://tekton.dev/
[lifecycle]: /docs/concepts/components/lifecycle
[buildpacks-task]: https://github.com/tektoncd/catalog/tree/master/task/buildpacks
[buildpacks-phases]: https://github.com/tektoncd/catalog/tree/master/task/buildpacks-phases
[tekton-setup]: https://tekton.dev/docs/getting-started/
[tekton-dashboard-setup]: https://tekton.dev/docs/dashboard/
[tekton-concepts]: https://tekton.dev/docs/concepts/
[git-clone-task]: https://github.com/tektoncd/catalog/tree/master/task/git-clone
[kubectl-install]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[tekton-auth]: https://tekton.dev/docs/pipelines/auth/
