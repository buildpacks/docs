# Detecting your application

<!-- test:suite=create-buildpack;weight=3 -->

Next, you will want to actually detect that the app you are building is a Ruby app. In order to do this, you will need to check for a `Gemfile`.

Replace `exit 1` in the `detect` script with the following check:

```bash
if [[ ! -f Gemfile ]]; then
   exit 100
fi
```

Your `ruby-buildpack/bin/detect`{{open}} script should look like this:

<!-- test:file=ruby-buildpack/bin/detect -->
<pre class="file" data-filename="ruby-buildpack/bin/detect" data-target="replace">
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi
</pre>

Next, rebuild your app with the updated buildpack:

<!-- test:exec;exit-code=-1 -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```{{execute}}

You should see the following output:

<!-- test:assert=contains -->
```
===> ANALYZING
[analyzer] Previous image with name "test-ruby-app" not found
===> DETECTING
[detector] examples/ruby 0.0.1
===> RESTORING
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ERROR: failed to build: exit status 1
```

Notice that `detect` now passes because there is a valid `Gemfile` in the Ruby app at `ruby-sample-app`, but now `build` fails because it is currently written to error out.

You will also notice that `ANALYZING` now appears in the build output. This step is part of the buildpack lifecycle that looks to see if any previous image builds have layers that the buildpack can re-use. We will get into this topic in more detail later.

---

<a href="/docs/buildpack-author-guide/create-buildpack/build-app" class="button bg-pink">Next Step</a>