+++
title="Understand build failures"
weight=99
summary="How to troubleshoot when things go wrong."
+++

While `Buildpacks` help developers transform source code into container images that can run on any cloud, creating an error-free experience remains far from achieved.

This guide catalogs some commonly reported issues that may prevent image build completion and provides troubleshooting tips to help end-users navigate these issues.

If you would like to report an issue, please open a PR against this page using the included template (see bottom of page in Markdown).

#### Issue: `ERROR: failed to build: failed to fetch base layers: saving image with ID "sha256:<sha256>" from the docker daemon: Error response from daemon: unable to create manifests file: NotFound: content digest sha256:<sha256>: not found`

**Occurs when**: building and saving to a docker daemon
**Analysis**: this seems to indicate a problem with the underlying image store in `Docker`
**Remediation**: remove existing images with `docker image prune` (potentially, from multiple storage drivers if switching between `overlay2` and `containerd`)
**Related error messages**:

* `ERROR: failed to initialize analyzer: getting previous image: get history for image "test": Error response from daemon: NotFound: snapshot sha256:<sha256> does not exist: not found`
* `ERROR: failed to export: saving image: failed to fetch base layers: open /tmp/imgutil.local.image.<identifier>/blobs/sha256/<sha256>: no such file or directory`

**For more information**:

* [Issue link on GitHub](https://github.com/buildpacks/pack/issues/2270)
* [Slack thread](https://cloud-native.slack.com/archives/C0331B61A1Y/p1717422902392339?thread_ts=1717185700.984459&cid=C0331B61A1Y)
* [Another Slack thread](https://cloud-native.slack.com/archives/C033DV8D9FB/p1730243369203799)

<!--
#### Issue: `<error text>`
**Occurs when**: <creating a builder, building, running the application, etc.>
**Analysis**: < why this issue occurs >
**Remediation**: < how to avoid this issue >
**Related error messages**:
* `<error text>`
**For more information**:
* <link to GitHub issue, Slack thread, etc.>
--->