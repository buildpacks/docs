
+++
title="Detecting your application"
weight=403
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Danny Joyce"
lastmodifieremail = "djoyce@pivotal.io"
draft = true
+++

Next you will want to actually detect that the app your are building is a ruby app. In order to do this you will need to check for a Gemfile.

Replace `exit 1` with the following check in your detect script

```
if [[ ! -f Gemfile ]]; then
   exit 100
fi
```
And now your detect script will look like this

```
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi
```

Next, rebuild your app with your updated buildpack

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will see the following output

```
===> DETECTING
[detector] Trying group of 1...
[detector] ======== Results ========
[detector] Ruby Buildpack: pass
===> RESTORING
[restorer] cache image 'pack-cache-5f615b7ee276' not found, nothing to restore
===> ANALYZING
[analyzer] WARNING: image 'test-ruby-app' not found or requires authentication to access
[analyzer] WARNING: image 'test-ruby-app' has incompatible 'io.buildpacks.lifecycle.metadata' label
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] Error: failed to : exit status 1
ERROR: failed with status code: 7
```

Notice that `detect` now passes because there is a valid Gemfile in the ruby app at `~/ruby-sample-app`, but now `build` fails because it is coded to do so.

You will also notice `ANALYZING` now appears in the build output.  This steps is part of the buildpack lifecycle that looks to see if any previous image builds have layers that the buildpack can re-use. We will get into this topic in more detail later.

---
