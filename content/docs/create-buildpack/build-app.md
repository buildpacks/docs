+++
title="Building your application"
weight=404
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Javier Romero"
lastmodifieremail = "jromero@pivotal.io"
+++


Next, we'll make the build step install dependencies. This will require a few updates to the `build` script. Change it to look like the following:

```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# 1. GET ARGS
layersdir=$1

# 2. DOWNLOAD RUBY
echo "---> Downloading and extracting Ruby"
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$rubylayer"

# 3. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e 'launch = true' > "$rubylayer.toml"

# 4. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="$rubylayer"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"$rubylayer/lib"

# 5. INSTALL BUNDLER
echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

# 6. INSTALL GEMS
echo "---> Installing gems"
bundle install
```

If you build your app again:

```bash
pack build test-ruby-app --path ~/workspace/ruby-sample-app --buildpack ~/workspace/ruby-cnb
```

you will see the following output:

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
[builder] ---> Downloading and extracting Ruby
[builder] ---> Installing bundler
[builder] Successfully installed bundler-2.0.2
[builder] 1 gem installed
[builder] ---> Installing gems
[builder] Fetching gem metadata from https://rubygems.org/..........
...
[builder] Bundle complete! 1 Gemfile dependency, 6 gems now installed.
[builder] Use `bundle info [gemname]` to see where a bundled gem is installed.
===> EXPORTING
[exporter] Exporting layer 'app' with SHA sha256:3eabfdaa6de70cfba17f588bf09841b09f7f8f8e97c757aeb8cda9bf0f53b208
[exporter] Exporting layer 'config' with SHA sha256:cced199e70f3b034dca63991e9ee3b298c6b1f61d3bf10023f1b2b73f1c93662
[exporter] Exporting layer 'launcher' with SHA sha256:ba90690cffad1f005f27ecc8d3a20bba7eeb7455bd2ec8ed584f14deb3e1a742
[exporter] Exporting layer 'com.examples.buildpacks.ruby:ruby' with SHA sha256:512ae48a9f9d01cc9eb6a822660ce2cf3ad5a9c6c6fddc315cdcbb191e3b59a3
[exporter] *** Images:
[exporter]       index.docker.io/library/test-ruby-app:latest - succeeded
[exporter] 
[exporter] *** Image ID: 46e4352e71e9b2065c7de01174115f6130ae2e526602d142e09adc5c35433b74
===> CACHING
Successfully built image test-ruby-app
```

You should now see a newly created image named `test-ruby-app` in your Docker daemon. However, your app
image is not yet runnable. We'll make the app image runnable in the next section.

---

<a href="/docs/create-buildpack/make-app-runnable" class="button bg-pink">Next Step</a>
