+++
title="kpack"
+++

[kpack][kpack] is a Kubernetes native platform maintained by [VMware][vmware] under the [VMware Tanzu project][vmware-tanzu] that utilizes unprivileged Kubernetes primitives to provide builds of OCI images as a platform implementation of Cloud Native Buildpacks (CNB).
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

[vmware]: https://www.vmware.com/company.html
[vmware-tanzu]: https://tanzu.vmware.com/build-service
[kpack]: https://github.com/pivotal/kpack
[tutorial]: https://github.com/pivotal/kpack/blob/master/docs/tutorial.md
[cli]: https://github.com/vmware-tanzu/kpack-cli/blob/master/docs/kp.md