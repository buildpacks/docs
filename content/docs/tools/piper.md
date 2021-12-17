+++
title='Project "Piper"'
+++

[Project "Piper"][piper] is a set of ready-made Continuous Delivery pipelines for direct use in your project, maintained by [SAP][sap].

<!--more-->

## Use

[Piper][piper] has a step called [cnbBuild][cnbbuild] which allows you to integrate CNB into your Jenkins pipeline.

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
