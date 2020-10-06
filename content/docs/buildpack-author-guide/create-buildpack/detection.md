+++
title="Detecting your application"
weight=403
+++

<!-- test:suite=create-buildpack;weight=3 -->

Next, you will want to actually detect that the app your are building is a Ruby app. In order to do this, you will need to check for a `Gemfile`.

Replace `exit 1` in the `detect` script with the following check:

```bash
if [[ ! -f Gemfile ]]; then
   exit 100
fi
```

Your `ruby-buildpack/bin/detect` script should look like this:

<!-- test:file=ruby-buildpack/bin/detect -->
```bash
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi
```

Next, rebuild your app with the updated buildpack:

<!-- test:exec;exit-code=-1 -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```

You should see the following output:

<!-- test:assert=contains -->
```
===> DETECTING
[detector] com.examples.buildpacks.ruby 0.0.1
===> ANALYZING
[analyzer] Previous image with name "index.docker.io/library/test-ruby-app:latest" not found
===> RESTORING
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ERROR: failed to build: exit status 1
```

Notice that `detect` now passes because there is a valid `Gemfile` in the Ruby app at `ruby-sample-app`, but now `build` fails because it is currently written to error out.

You will also notice that `ANALYZING` now appears in the build output. This steps is part of the buildpack lifecycle that looks to see if any previous image builds have layers that the buildpack can re-use. We will get into this topic in more detail later.

---

<a href="/docs/buildpack-author-guide/create-buildpack/build-app" class="button bg-pink">Next Step</a>
