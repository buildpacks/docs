
+++
title="kpack"
aliases=[
  "/docs/tools/kpack"
]
weight=2
+++

[kpack][kpack] is a Kubernetes-native platform that uses unprivileged Kubernetes primitives to perform buildpacks builds and keep application images up-to-date.

[kpack][kpack] is part of the [Buildpacks Community](https://github.com/buildpacks-community) organization.

<!--more-->

## Use 
To use [kpack][kpack] you can follow their [tutorial][tutorial] for details on how to create a builder and use it to create application images.
An example `kpack Image` configuration looks like - 

```yaml
apiVersion: kpack.io/v1alpha1
kind: Image
metadata:
  name: example-image
  namespace: default
spec:
  tag: <DOCKER-IMAGE-TAG>
  serviceAccount: <SERVICE-ACCOUNT>
  builder:
    name: <BUILDER>
    kind: Builder
  source:
    git:
      url: <APPLICATION-SOURCE-REPOSITORY>
      revision: <APPLICATION-SOURCE-REVISION>
```

kpack is also accompanied by a handy CLI utility called [kpack CLI][cli] that lets you interact with kpack resources.


### References

- [kpack GitHub repository][kpack]
- [kpack CLI Github repository][cli]
- [kpack tutorial][tutorial]
- [kpack Donation announcement][announcement]

[kpack]: https://github.com/buildpacks-community/kpack
[tutorial]: https://github.com/buildpacks-community/kpack/blob/main/docs/tutorial.md
[cli]: https://github.com/buildpacks-community/kpack-cli/blob/main/docs/kp.md
[buildpacks]: https://buildpacks.io
[announcement]: https://medium.com/buildpacks/kpack-joins-the-buildpacks-community-organization-223e59bda951
