+++
title="Building your application"
weight=404
+++

Next, we'll make the build step install dependencies. This will require a few updates to the `build` script.

Let's change `ruby-buildpack/bin/build` to look like the following:

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
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```

you will see the following output:

```
===> DETECTING
[detector] com.examples.buildpacks.ruby 0.0.1
===> ANALYZING
[analyzer] Previous image with name "index.docker.io/library/test-ruby-app:latest" not found
===> RESTORING
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting Ruby
[builder] ---> Installing bundler
[builder] Successfully installed bundler-2.1.4
[builder] 1 gem installed
[builder] ---> Installing gems
[builder] Fetching gem metadata from https://rubygems.org/....
[builder] Resolving dependencies...
[builder] Using bundler 2.1.4
[builder] Fetching ruby2_keywords 0.0.2
[builder] Installing ruby2_keywords 0.0.2
[builder] Fetching mustermann 1.1.1
[builder] Installing mustermann 1.1.1
[builder] Fetching rack 2.2.3
[builder] Installing rack 2.2.3
[builder] Fetching rack-protection 2.0.8.1
[builder] Installing rack-protection 2.0.8.1
[builder] Fetching tilt 2.0.10
[builder] Installing tilt 2.0.10
[builder] Fetching sinatra 2.0.8.1
[builder] Installing sinatra 2.0.8.1
[builder] Bundle complete! 1 Gemfile dependency, 7 gems now installed.
[builder] Use `bundle info [gemname]` to see where a bundled gem is installed.
===> EXPORTING
[exporter] Adding layer 'launcher'
[exporter] Adding layer 'com.examples.buildpacks.ruby:ruby'
[exporter] Adding 1/1 app layer(s)
[exporter] Adding layer 'config'
[exporter] *** Images (50a49bab37d1):
[exporter]       index.docker.io/library/test-ruby-app:latest
Successfully built image test-ruby-app
```

You should now see a newly created image named `test-ruby-app` in your Docker daemon. However, your app
image is not yet runnable. We'll make the app image runnable in the next section.

---

<a href="/docs/buildpack-author-guide/create-buildpack/make-app-runnable" class="button bg-pink">Next Step</a>
