+++
title="Building your application"
weight=404
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Danny Joyce"
lastmodifieremail = "djoyce@pivotal.io"
draft = true
+++


Next we will make the build step work.  This will require a few updates to the build script.

We need to read the layers directory passed in by build lifecycle - learn more about the lifecycle [here](https://github.com/buildpack/lifecycle)

```
layersdir=$1 
```

We need to create a ruby layer in the image. We'll add `launch = true` to direct the lifecycle to provide ruby when we launch our app.

```
mkdir -p $layersdir/ruby
echo -e 'launch = true' > $layersdir/ruby.toml
```

We will need to download ruby

```
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"
```

Finally, we will need to install bundler and then run bundle install

```
gem install bundler --no-ri --no-rdoc
bundle install
```


Your build script will now look like this

```
#!/usr/bin/env bash
set -eo pipefail

# Set the layersdir variable to be the first argument from the build lifecycle
layersdir=$1

echo "---> Ruby Buildpack" 

echo "---> Downloading and extracting ruby"
mkdir -p $layersdir/ruby
echo -e 'launch = true' > $layersdir/ruby.toml

ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"

# Make ruby accessible in this script
export PATH=$PATH:$layersdir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

echo "---> Installing gems"
bundle install
```


Now if you build your app again 

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
[builder] ---> Downloading and extracting ruby
[builder] ---> Installing bundler
[builder] Successfully installed bundler-2.0.1
[builder] 1 gem installed
[builder] ---> Installing gems
[builder] Don't run Bundler as root. Bundler can ask for sudo if it is needed, and
[builder] installing your bundle as root will break this application for all non-root
[builder] users on this machine.
[builder] Fetching gem metadata from https://rubygems.org/.........
[builder] Using bundler 2.0.1
[builder] Fetching mustermann 1.0.3
[builder] Installing mustermann 1.0.3
[builder] Fetching rack 2.0.6
[builder] Installing rack 2.0.6
[builder] Fetching rack-protection 2.0.5
[builder] Installing rack-protection 2.0.5
[builder] Fetching tilt 2.0.9
[builder] Installing tilt 2.0.9
[builder] Fetching sinatra 2.0.5
[builder] Installing sinatra 2.0.5
[builder] Bundle complete! 1 Gemfile dependency, 6 gems now installed.
[builder] Use `bundle info [gemname]` to see where a bundled gem is installed.
===> EXPORTING
[exporter] WARNING: image 'test-ruby-app' not found or requires authentication to access
[exporter] WARNING: image 'test-ruby-app' has incompatible 'io.buildpacks.lifecycle.metadata' label
[exporter] adding layer 'app' with diffID 'sha256:2c0668ad9c1f6c3c560aeb91baa56b43ea5d90a74bf7ca7e95ecc36833bb1041'
[exporter] adding layer 'config' with diffID 'sha256:16d1127f679cc735b52cd36bd0e8b19cab0bd56ebf3fb8b2d29c420398e62c0c'
[exporter] adding layer 'launcher' with diffID 'sha256:2868a35455a6d093663d951774ec9150b4c7b6f3047651e1266449f80a3b982b'
[exporter] adding layer 'com.examples.buildpacks.ruby:ruby' with diffID 'sha256:d546c1e63e08f317de30ec8d47c9756ca152c84a59c925403704bfb2ffa6153e'
[exporter] setting metadata label 'io.buildpacks.lifecycle.metadata'
[exporter] setting env var 'CNB_LAYERS_DIR=/layers'
[exporter] setting env var 'CNB_APP_DIR=/workspace'
[exporter] setting entrypoint '/lifecycle/launcher'
[exporter] setting empty cmd
[exporter] writing image
[exporter]
[exporter] *** Image: test-ruby-app@b5a41ec8565a8202a196e685bf5d42689dedcfd856bf19ceec33903ac54cfea5
===> CACHING
[cacher] WARNING: image 'pack-cache-5f615b7ee276' not found or requires authentication to access
[cacher] WARNING: image 'pack-cache-5f615b7ee276' has incompatible 'io.buildpacks.lifecycle.cache.metadata' label
[cacher] setting metadata label 'io.buildpacks.lifecycle.cache.metadata'
[cacher] writing image
[cacher] cache 'pack-cache-5f615b7ee276@9a9c2565c6a47c21f6e5f1febbc1185ac14c15aeab1389084dd9b011a1742a43'
Successfully built image test-ruby-app
```

You should now see a newly created image named `test-ruby-app`. However, you're app
image is not yet runnable. We'll make the app image runnable in the next section.

---
