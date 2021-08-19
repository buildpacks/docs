+++
title="Tekton"
+++

[Tekton][tekton] is an open-source CI/CD system platform implementation running on k8s. There are two Tekton `tasks`
maintained by the CNB project, both of which use the [lifecycle][lifecycle] directly (i.e. they do not use `pack`).
<!--more-->
They are:
1. [buildpacks][buildpacks-task] `task` &rarr; This task, which we recommend using, calls the `creator` binary of the 
   [lifecycle][lifecycle] to construct, and optionally publish, a runnable image.
1. [buildpacks-phases][buildpacks-phases] `task` &rarr; This task calls the individual [lifecycle][lifecycle] binaries, to
run each phase in a separate container.

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
Create a file (e.g. `resources.yml`), which defines two `PersistentVolumeClaim`s, one which contains the source code, and the other to serve
as a cache between builds:
```yaml
---
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
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: buildpacks-cache-pvc
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

Create a file (e.g. `auth.yml`) which defines the authorization secrets:
```yaml
apiVersion: v1
kind: Secret
metadata:
    name: basic-user-pass
    annotations:
        tekton.dev/docker-0: <LINK TO REGISTRY, e.g. https://index.docker.io/v1/>
type: kubernetes.io/basic-auth
stringData:
    username: <USERNAME>
    password: <PASSWORD>
---
apiVersion: v1
kind: ServiceAccount
metadata:
    name: buildpacks-service-account
secrets:
    - name: basic-user-pass
```

#### 4.3 Pipeline
Create a file (e.g. `pipeline.yml`) which defines the `Pipeline`, and relevant resources:
```yaml
apiVersion: tekton.dev/v1alpha1
kind: PipelineResource
metadata:
  name: buildpacks-app-image 
spec:
  type: image
  params:
    - name: url
      value: <REGISTRY/IMAGE NAME, eg gcr.io/test/image > #This defines the name of output image
---
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: buildpacks-test-pipeline
spec:
  workspaces:
  - name: shared-workspace
  resources:
  - name: build-image
    type: image
  tasks:
  - name: fetch-repository # This task fetches a repository from github, using the `git-clone` task we installed
    taskRef:
      name: git-clone
    workspaces:
    - name: output
      workspace: shared-workspace
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
      workspace: shared-workspace
    - name: cache
      workspace: buildpacks-cache
    params:
    - name: SOURCE_SUBPATH
      value: 'apps/java-maven' # This is the path within our samples repo we want to build
    - name: BUILDER_IMAGE
      value: 'paketobuildpacks/builder:base' # This is the builder we want the task to use
    resources:
      outputs:
      - name: image
        resource: build-image
```

#### 4.4 Apply Configuration
Apply these configurations, using `kubectl`:
```shell
kubectl apply -f resources.yml -f auth.yml -f pipeline.yml
```

### 5. Create & Apply PipelineRun
Create a file (e.g. `run.yml`), which defines the `PipelineRun`:
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
  - name: shared-workspace
    persistentvolumeclaim:
      claimName: buildpacks-source-pvc
  resources:
  - name: build-image
    resourceRef:
      name: buildpacks-app-image
  podTemplate:
    volumes:
    - name: buildpacks-cache
      persistentVolumeClaim:
        claimName: buildpacks-cache-pvc
```

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
