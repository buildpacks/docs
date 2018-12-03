+++
title="Building your application"
weight=6
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
+++


Next we will make the build step work.  This will a few updates to the build script.

We need to read the launch directory passed in by build lifecycle - learn more about the lifecycle [here](https://github.com/buildpack/lifecycle)

```
launchdir=$3 
```

We need to create a ruby layer in the image

```
mkdir -p $launchdir/ruby
touch $launchdir/ruby.toml
```

We will need to download ruby

```
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$launchdir/ruby"
```

We will need to download bundler

```
bundler_url=https://buildpacks.cloudfoundry.org/dependencies/bundler/bundler-1.16.6-any-stack-77354698.tgz
mkdir -p $launchdir/bundler
wget -q -O - "$bundler_url" | tar -xzf - -C "$launchdir/bundler"
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
# Set the launchdir variable to be the third argument from the build lifecycle
launchdir=$3 

echo "---> Ruby Buildpack" 

echo "---> Downloading and extracting ruby"
mkdir -p $launchdir/ruby
touch $launchdir/ruby.toml

ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$launchdir/ruby"


# Make ruby and bundler accessible in this script
export PATH=$PATH:$launchdir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$launchdir/ruby/lib

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
2018/10/16 14:20:47 Selected run image 'packs/run' from stack 'io.buildpacks.stacks.bionic'
*** DETECTING:
2018/10/16 19:20:49 Group: Ruby Buildpack: pass
*** ANALYZING: Reading information from previous image for possible re-use
2018/10/16 14:20:50 WARNING: skipping analyze, image not found
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby
---> Installing bundler
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 3 seconds
1 gem installed
---> Installing gems
Fetching gem metadata from https://rubygems.org/..............
Using bundler 1.16.6
Fetching rack 2.0.5
Installing rack 2.0.5
Fetching roda 3.13.0
Installing roda 3.13.0
Bundle complete! 1 Gemfile dependency, 3 gems now installed.
Use `bundle info [gemname]` to see where a bundled gem is installed.
```

After building the ruby app, the buildpack now creates a docker file based on the output of build and then runs it


```
*** EXPORTING:
Step 1/4 : FROM packs/run *** This is the run image from your stack ***
---> aebbb14d9529
Step 2/4 : ADD --chown=pack:pack /workspace/app /workspace/app  *** This is the app ***
---> f248b539eb0b
Step 3/4 : ADD --chown=pack:pack /workspace/config /workspace/config ** Metadata for runtime **
---> 74fb93aaa030
Step 4/4 : ADD --chown=pack:pack  /workspace/io.buildpacks.samples.ruby/ruby /workspace/io.buildpacks.samples.ruby/ruby *** This is the ruby interpreter that the buildpack placed as a layer ***
---> 3d096514cf24
---> 3d096514cf24
Successfully built 3d096514cf24
Successfully tagged test-ruby-app:latest
Step 1/2 : FROM test-ruby-app  *** Set metadata labels of the image ***
---> 3d096514cf24
Step 2/2 : LABEL io.buildpacks.lifecycle.metadata='{"app":{"name":"","sha":"sha256:1e13e329d407844821c3aa5bd22d74feb5cae32af5aa85c82b5271a20e51615d"},"config":{"sha":"sha256:45f0d1cb7eee98d807a7932b4fcf8a5c0c5b2c1aad0a223994922d68885457ad"},"buildpacks":[{"key":"io.buildpacks.samples.ruby","name":"","layers":{"ruby":{"sha":"sha256:f5fa2b809b8847000234da59c2f346e066736efbcd5a84ffddf02993b0fd23e9","data":{}}}}],"runimage":{"name":"packs/run","sha":"sha256:2ace261ebe9f5936ea72b6290019cda476db6a0b3a4d5d64039c61b45e46091f"}}'
---> Running in 49bca3c53f9f
---> af8d138f6c96
---> af8d138f6c96
Successfully built af8d138f6c96
Successfully tagged test-ruby-app:latest
```

---
