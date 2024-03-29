
+++
title="Gitlab Auto DevOps"
aliases=[
  "/docs/tools/gitlab"
]
weight=4
+++

[Gitlab][about-gitlab] is a web-based DevOps platform. The [Auto DevOps][devops] feature uses [`pack`][pack]
to build applications prior to deploying them.

<!--more-->

## Use
To use the CNB integration, you need to configure the Auto DevOps feature, as discussed in [the DevOps guide][devops-guide]. At that point,
you can opt in to using Cloud Native Buildpacks by following the steps in their [CNB documentation][use-cnbs].

This may look like the following in your `.gitlab-ci.yml` file:
```yaml
include:
  - template: Auto-DevOps.gitlab-ci.yml

variables:
  AUTO_DEVOPS_BUILD_IMAGE_CNB_ENABLED: "true"
```

### References

- [Auto Build with CNB Docs][use-cnbs]

[pack]: /docs/install-pack
[about-gitlab]: https://about.gitlab.com/
[devops]: https://docs.gitlab.com/ee/topics/autodevops/
[devops-guide]: https://docs.gitlab.com/ee/topics/autodevops/#get-started-with-auto-devops
[use-cnbs]: https://docs.gitlab.com/ee/topics/autodevops/stages.html#auto-build-using-cloud-native-buildpacks
