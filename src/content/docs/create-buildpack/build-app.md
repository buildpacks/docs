+++
title="Building your application"
weight=6
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
+++


Next we will make the build step work.  This will a few updates to the build script.

We need to read the layers directory passed in by build lifecycle - learn more about the lifecycle [here](https://github.com/buildpack/lifecycle)

```
layersdir=$1 
```

We need to create a ruby layer in the image. We add `launch = true` to direct the lifecycle to provide ruby when we launch our app.

```
mkdir -p $layersdir/ruby
echo -e 'launch = true' > $layersdir/ruby.toml
```

We will need to download ruby

```
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"
```

We will need to download bundler

```
bundler_url=https://buildpacks.cloudfoundry.org/dependencies/bundler/bundler-1.16.6-any-stack-77354698.tgz
mkdir -p $layersdir/bundler
wget -q -O - "$bundler_url" | tar -xzf - -C "$layersdir/bundler"
```

Finally, we will need to install bundle and then run bundle install

```
gem install bundler
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


# Make ruby and bundler accessible in this script
export PATH=$PATH:$layersdir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

echo "---> Installing bundler"
gem install bundler

echo "---> Installing gems"
bundle install
```


Now if you build your app again 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will see the following output

```
*** DETECTING WITH MANUALLY-PROVIDED GROUP:
2018/12/11 19:57:52 Trying group of 1...
2018/12/11 19:57:52 ======== Results ========
2018/12/11 19:57:52 Ruby Buildpack: pass
*** ANALYZING: Reading information from previous image for possible re-use
2018/12/11 19:57:53 WARNING: skipping analyze, image 'test-ruby-app' not found or requires authentication to access
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby
---> Installing bundler
Successfully installed bundler-1.17.2
Parsing documentation for bundler-1.17.2
Installing ri documentation for bundler-1.17.2
Done installing documentation for bundler after 3 seconds
1 gem installed
---> Installing gems
Fetching gem metadata from https://rubygems.org/..............
Using bundler 1.17.2
Fetching rack 2.0.6
Installing rack 2.0.6
Bundle complete! 1 Gemfile dependency, 2 gems now installed.
Use `bundle info [gemname]` to see where a bundled gem is installed.
```

After building the ruby app, the buildpack now creates a docker file based on the output of build and then runs it


```
*** EXPORTING:
2018/12/11 19:58:08 removing uncached layer 'com.examples.buildpacks.ruby/ruby'
2018/12/11 19:58:08 adding app layer with diffID 'sha256:c7a6a708d58501af3c8b0eded4711e6fb4cfc132038b3941edaa77c4249789cf'
2018/12/11 19:58:08 adding config layer with diffID 'sha256:a40c876978a9e7a7859c0ae5a081a7dfe7ca262ceecfb99d8ed01a49e8986153'
2018/12/11 19:58:08 adding layer 'com.examples.buildpacks.ruby/ruby' with diffID 'sha256:c6cebb732d88a31ac20bcf4d05524109b2c8b559a8875fa5cb3f80563b4a92ec'
2018/12/11 19:58:08 setting metadata label 'io.buildpacks.lifecycle.metadata'
2018/12/11 19:58:08 setting env var 'PACK_LAYERS_DIR=/workspace'
2018/12/11 19:58:08 setting env var 'PACK_APP_DIR=/workspace/app'
2018/12/11 19:58:08 writing image
2018/12/11 19:58:10
*** Image: test-ruby-app@1a9649ff02b7ffe00ab2678120f9e5e760857121dbbb7ba419b017324c67870d
```

---
