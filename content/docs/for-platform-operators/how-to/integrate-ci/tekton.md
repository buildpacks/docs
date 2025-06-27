
+++
title="Tekton"
aliases=[
  "/docs/tools/tekton"
]
weight=6
+++

[Tekton][tekton] is an open-source CI/CD system running on k8s.

The CNB project has created a reference "task" for performing buildpacks builds with or without extensions (aka Dockerfile to be applied) top
of the [lifecycle][lifecycle] tool (i.e. they do not use `pack`).

The [Buildpacks Phases Task][buildpacks-phases] calls the individual [lifecycle][lifecycle] binaries (prepare, analyze, detect, restore, build or extender, export), to run each phase in a separate container. 

The uid and gid as defined part of the builder image will be used to build the image. 

The different parameters to customize the task are defined part of the task's documentation under the section `parameters`.

## Set Up

> NOTE: Prior to installing `Tekton`, we recommend reviewing the basic Tekton concepts in the [documentation][tekton-concepts].

### Prerequisites

Before we get started, make sure you've got the following installed:

{{< download-button href="https://kubernetes.io/docs/tasks/tools/install-kubectl/" color="blue" >}} Install kubectl {{</>}}

### 1. Install Tekton and Tekton Dashboard

To start, set up a `Tekton` version `>= 1.0`, using the Tekton [documentation][tekton-setup].

We also recommend using the `Tekton dashboard`. To install it, follow the steps in the [dashboard docs][tekton-dashboard-setup], and
start the dashboard server.

> NOTE: If you run Tekton on a Kind or Minikube Kubernetes cluster, be sure to set the `coschedule` flag to `disabled` within the `feature-flags` ConfigMap.

### 2. Install the Buildpacks Task

Install the latest version of the buildpacks task (currently `0.3`), by running:

```shell
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/refs/heads/main/task/buildpacks-phases/0.3/buildpacks-phases.yaml
```

### 3. Define and Apply Tekton Pipeline Resources

In order to set up our pipeline, we will need to define a few things:

- Pipeline &rarr; A `Pipeline` defines a series of `Tasks` that accomplish a specific build or delivery goal. The `Pipeline`
  can be triggered by an event or invoked from a `PipelineRun`.
- PipelineResource &rarr; A `PipelineResource` defines locations for inputs ingested and outputs produced by the steps in `Tasks`.
- PersistentVolumeClaim &rarr; A `PersistentVolumeClaim` (a general Kubernetes concept, generally shortened to PVC) is
  a request for storage by a user.

#### 4.1 Persistent Volume

Create a file `resources.yml` that defines a `PersistentVolumeClaim` able to store the git cloned project and buildpacks files:

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
> remote registry (e.g. `DockerHub`, `GCR`, `quay.io), you need to add authorization

Create a `Secret` containing username and password that the build should use to authenticate to the container registry.

```shell
kubectl create secret docker-registry registry-user-pass \
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
  - name: registry-user-pass
```
> NOTE: This service account will be used by Tekton in order to mount the credentials as docker config file part of the pod running buildpacks 

#### 4.3 Pipeline

Create a file `pipeline.yml` that defines the `Pipeline`, and relevant resources:

```yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: buildpacks-test-pipeline
spec:
  params:
    - name: git-url
      type: string
      description: URL of the project to git clone
    - name: source-subpath
      type: string
      description: The subpath within the git project
    - name: image
      type: string
      description: image URL to push
    - name: builder
      type: string
      description: builder image URL
    - name: env-vars
      type: array
      description: env vars to pass to the lifecycle binaries
  workspaces:
    - name: source-workspace # Directory where application source is located. (REQUIRED)
  tasks:
    - name: fetch-repository # This task fetches a repository from github, using the `git-clone` task you installed
      taskRef:
        resolver: http
        params:
          - name: url
            value: https://raw.githubusercontent.com/tektoncd/catalog/refs/heads/main/task/git-clone/0.9/git-clone.yaml
      workspaces:
        - name: output
          workspace: source-workspace
      params:
        - name: url
          value: "$(params.git-url)"
        - name: deleteExisting
          value: "true"
    - name: buildpacks # This task uses the `buildpacks phases` task to build the application
      taskRef:
        name: buildpacks-phases
      runAfter:
        - fetch-repository
      workspaces:
        - name: source
          workspace: source-workspace
      params:
        - name: APP_IMAGE
          value: "$(params.image)"
        - name: SOURCE_SUBPATH
          value: "$(params.source-subpath)"
        - name: CNB_BUILDER_IMAGE
          value: "$(params.builder)"
        - name: CNB_ENV_VARS
          value: "$(params.env-vars[*])"
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
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: buildpacks-test-pipeline-run
spec:
  taskRunTemplate:
    serviceAccountName: buildpacks-service-account # Only needed if you set up authorization
  pipelineRef:
    name: buildpacks-test-pipeline
  workspaces:
    - name: source-workspace
      subPath: source
      persistentVolumeClaim:
        claimName: buildpacks-source-pvc
  params:
    - # The url of the git project to clone (REQURED).
      name: git-url
      value: https://github.com/buildpacks/samples
    - # This is the path within the git project you want to build (OPTIONAL, default: "")
      name: source-subpath
      value: "apps/java-maven"
    - # This is the builder image we want the task to use (REQUIRED).
      name: builder
      value: paketobuildpacks/builder-jammy-tiny
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

Once the application is successfully built, you can pull and run it by running:

```shell
docker | podman pull <REGISTRY/IMAGE NAME>
docker | podman run -it <REGISTRY/IMAGE NAME>
```

### 7. Using extension

If your builder image supports the [extension][extension] mechanism able to customize the [build][extension-build] or the [run (aka execution)][extension-run], then you can replay this scenario by simply changing within the `PipelineRun` resource file the builder parameter

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: buildpacks-test-pipeline-run
spec:
  taskRunTemplate:
    serviceAccountName: buildpacks-service-account
  pipelineRef:
    name: buildpacks-test-pipeline
  workspaces:
    - name: source-workspace
      subPath: source
      persistentVolumeClaim:
        claimName: buildpacks-source-pvc
  params:
    - name: image
      value: <REGISTRY/IMAGE NAME, eg gcr.io/test/image>
    - name: git-url
      value: https://github.com/quarkusio/quarkus-quickstarts
    - name: source-subpath
      value: "getting-started"  
    - name: builder
      value: paketobuildpacks/builder-ubi8-base:0.1.30
    - name: env-vars
      value:
      - BP_JVM_VERSION=21
```
When the build process starts, then you should see, part of the extender step, if you build a Java runtime (Quarkus, Spring boot, etc) such log messages if the extension installs by example a different JDK
```txt
2025-06-27T11:32:25.067007701Z time="2025-06-27T11:32:25Z" level=info msg="Performing slow lookup of group ids for root"
2025-06-27T11:32:25.067243910Z time="2025-06-27T11:32:25Z" level=info msg="Running: [/bin/sh -c echo ${build_id}]"
2025-06-27T11:32:25.095150183Z 9e447871-e415-4018-a860-d5a66d925a57
2025-06-27T11:32:25.096877516Z time="2025-06-27T11:32:25Z" level=info msg="Taking snapshot of full filesystem..."
2025-06-27T11:32:25.280396774Z time="2025-06-27T11:32:25Z" level=info msg="Pushing layer oci:/kaniko/cache/layers/cached:a035cdb3949daa8f4e7b2c523ea0d73741c7c2d5b09981c261ebae99fd2f3233 to cache now"
2025-06-27T11:32:25.280572023Z time="2025-06-27T11:32:25Z" level=info msg="RUN microdnf --setopt=install_weak_deps=0 --setopt=tsflags=nodocs install -y openssl-devel java-21-openjdk-devel nss_wrapper which && microdnf clean all"
2025-06-27T11:32:25.280577315Z time="2025-06-27T11:32:25Z" level=info msg="Cmd: /bin/sh"
2025-06-27T11:32:25.280578398Z time="2025-06-27T11:32:25Z" level=info msg="Args: [-c microdnf --setopt=install_weak_deps=0 --setopt=tsflags=nodocs install -y openssl-devel java-21-openjdk-devel nss_wrapper which && microdnf clean all]"
...
```

### 8. Cleanup (Optional)

To clean up, run:

```shell
kubectl delete -n default pipelinerun buildpacks-test-pipeline-run
kubectl delete -n default pipeline buildpacks-test-pipeline
kubectl delete -n default buildpacks-phases
kubectl delete -n default pvc buildpacks-source-pvc
```

## References

The Buildpacks task can be accessed at:

- [Buildpacks Phases Task Source][buildpacks-phases]

Some general resources for Tekton are:

- [Tekton: Getting Started][tekton-setup]
- [Tekton Dashboard: Setup][tekton-dashboard-setup]
- [Tekton Concepts][tekton-concepts]
- [Tekton Authorization Documentation][tekton-auth]

[tekton]: https://tekton.dev/
[lifecycle]: /docs/for-platform-operators/concepts/lifecycle
[buildpacks-task]: https://github.com/tektoncd/catalog/tree/master/task/buildpacks
[buildpacks-phases]: https://github.com/tektoncd/catalog/tree/master/task/buildpacks-phases
[tekton-setup]: https://tekton.dev/docs/getting-started/
[tekton-dashboard-setup]: https://tekton.dev/docs/dashboard/
[tekton-concepts]: https://tekton.dev/docs/concepts/
[kubectl-install]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[tekton-auth]: https://tekton.dev/docs/pipelines/auth/
[extension]: https://buildpacks.io/docs/for-buildpack-authors/tutorials/basic-extension/02_why-dockerfiles/
[extension-build]: https://buildpacks.io/docs/for-buildpack-authors/tutorials/basic-extension/04_build-dockerfile/
[extension-run]: https://buildpacks.io/docs/for-buildpack-authors/tutorials/basic-extension/06_run-dockerfile-extend/
