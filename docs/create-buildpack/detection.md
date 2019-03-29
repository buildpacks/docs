
+++
title="Detecting your application"
weight=403
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
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
*** DETECTING WITH MANUALLY-PROVIDED GROUP:
2018/12/11 19:28:45 Trying group of 1...
2018/12/11 19:28:45 ======== Results ========
2018/12/11 19:28:45 Ruby Buildpack: pass
*** ANALYZING: Reading information from previous image for possible re-use
2018/12/11 19:28:46 WARNING: skipping analyze, image 'test-ruby-app' not found or requires authentication to access
*** BUILDING:
---> Ruby Buildpack
2018/12/11 19:28:49 Error: failed to : exit status 1
Error: running builder in container: failed with status code: 7
```

Notice that `detect` now passes because there is a valid Gemfile in the ruby app at `~/ruby-sample-app`, but now `build` fails because it is coded to do so.

You will also notice `ANALYZE` now appears in the build output.  This step is part of the buildpack lifecycle that looks to see if any previous image builds have layers that the buildpack can re-use. We will get into this topic in more detail later.

---
