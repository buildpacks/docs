+++
title='Project "Piper"'
+++

[Project "Piper"][piper] (maintained by [SAP][sap]) is a set of ready-made Continuous Delivery pipelines for direct use in your project. It now also implements the CNB Platform spec as a step and makes it available in your Jenkins pipeline.

<!--more-->

## Use

The step called [cnbBuild][cnbbuild] allows you to integrate Cloud Native Buildpacks (CNB) into your Jenkins pipeline.

```groovy
@Library(["piper-os"]) _

node() {
    stage("Init") {
        git branch: "main", url: "https://github.com/spring-projects/spring-petclinic"
        setupCommonPipelineEnvironment(script: this)
    }

    stage("Build") {
        cnbBuild(
            script: this,
            dockerConfigJsonCredentialsId: 'DOCKER_REGISTRY_CREDS',
            containerImageName: 'image-name',
            containerImageTag: 'v0.0.1',
            containerRegistryUrl: 'gcr.io'
        )
    }
}
```

### References

- [Project Piper][piper]
- [cnbBuild step][cnbbuild]
- [SAP Piper Blogpost][blogpost]

[sap]: https://www.sap.com/
[piper]: https://www.project-piper.io/
[cnbbuild]: https://www.project-piper.io/steps/cnbBuild/
[blogpost]: https://medium.com/buildpacks/support-for-cloud-native-buildpacks-in-jenkins-656330156e77
