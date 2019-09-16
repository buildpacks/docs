
+++
title="Detecting your application"
weight=403
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Javier Romero"
lastmodifieremail = "jromero@pivotal.io"
+++

Next, you will want to actually detect that the app your are building is a Ruby app. In order to do this, you will need to check for a `Gemfile`.

Replace `exit 1` in the `detect` script with the following check:

```bash
if [[ ! -f Gemfile ]]; then
   exit 100
fi
```

Your `detect` script should look like this:

```bash
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi
```

Next, rebuild your app with the updated buildpack:

```bash
pack build test-ruby-app --path ~/workspace/ruby-sample-app --buildpack ~/workspace/ruby-cnb
```

You should see the following output:

```
===> DETECTING
[detector] ======== Results ========
[detector] pass: com.examples.buildpacks.ruby@0.0.1
[detector] Resolving plan... (try #1)
[detector] Success! (1)
===> RESTORING
[restorer] Cache '/cache': metadata not found, nothing to restore
===> ANALYZING
[analyzer] Image 'index.docker.io/library/test-ruby-app:latest' not found
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] Error: failed to build: exit status 1
ERROR: failed with status code: 7
```

Notice that `detect` now passes because there is a valid `Gemfile` in the Ruby app at `~/workspace/ruby-sample-app`, but now `build` fails because it is currently written to error out.

You will also notice that `ANALYZING` now appears in the build output. This steps is part of the buildpack lifecycle that looks to see if any previous image builds have layers that the buildpack can re-use. We will get into this topic in more detail later.

---

<a href="/docs/create-buildpack/build-app" class="button bg-pink">Next Step</a>
