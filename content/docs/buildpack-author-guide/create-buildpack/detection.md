+++
title="Detecting your application"
weight=403
+++

<!-- test:suite=create-buildpack;weight=3 -->

Next, you will want to actually detect that the app you are building is a node-js app. In order to do this, you will need to check for a `package.json`.

Replace `exit 1` in the `detect` script with the following check:

```bash
if [[ ! -f package.json ]]; then
   exit 100
fi
```

Your `node-js-buildpack/bin/detect`<!--+"{{open}}"+--> script should look like this:

<!-- test:file=node-js-buildpack/bin/detect -->
```bash
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f package.json ]]; then
   exit 100
fi
```

Next, rebuild your app with the updated buildpack:

<!-- test:exec;exit-code=1 -->
```bash
pack build test-node-js-app --path ./node-js-sample-app --buildpack ./node-js-buildpack
```
<!--+- "{{execute}}"+-->

You should see the following output:

```
Previous image with name "test-node-js-app" not found
===> DETECTING
examples/node-js 0.0.1
===> RESTORING
===> BUILDING
---> node-js Buildpack
ERROR: failed to build: exit status 1
ERROR: failed to build: executing lifecycle: failed with status code: 51
```

Notice that `detect` now passes because there is a valid `package.json` in the NodeJS app at `node-js-sample-app`, but now `build` fails because it is currently written to error out.

You will also notice that `RESTORING` now appears in the build output. This step is part of the buildpack lifecycle that looks to see if any previous image builds have layers that the buildpack can re-use. We will get into this topic in more detail later.

<!--+if false+-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/build-app" class="button bg-pink">Next Step</a>
<!--+end+-->
