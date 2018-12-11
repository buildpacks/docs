+++
title="Improving performance with caching"
weight=8
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
+++

Next we want to separate the ruby interpreter and bundled gems into different layers.  This will allows us to cache the ruby layer and gem dependency layer separately, which helps speed up builds.

### Creating the Bundler Layer

To do this replace the line

```
echo "---> Installing gems"
bundle install
```

With the following

```
echo "---> Installing gems"
mkdir "$layersdir/bundler"
echo -e 'launch = true' > "$layersdir/bundler.toml"

bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin"
```

Your full build script should now look like this

```
#!/usr/bin/env bash
set -eo pipefail
# Set the layersdir variable to be the first argument from the build lifecycle
layersdir=$1

echo "---> Ruby Buildpack" 

echo "---> Downloading and extracting ruby"
mkdir -p $layersdir/ruby
touch $layersdir/ruby.toml

ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"


# Make ruby and bundler accessible in this script
export PATH=$PATH:$layersdir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

echo "---> Installing bundler"
gem install bundler

echo "---> Installing gems"
mkdir "$layersdir/bundler"
echo -e 'launch = true' > "$layersdir/bundler.toml"

bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin"


# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080 --host 0.0.0.0"}]' > "$layersdir/launch.toml"
```

Now when we run 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will see the following change during EXPORT

```
*** EXPORTING:
2018/12/11 20:01:24 removing uncached layer 'com.examples.buildpacks.ruby/bundler'
2018/12/11 20:01:24 removing uncached layer 'com.examples.buildpacks.ruby/ruby'
2018/12/11 20:01:24 adding app layer with diffID 'sha256:1c2f0054971ea2cbb62b79e028ce1a85975e7e25e556d7740206693f41fa431a'
2018/12/11 20:01:24 adding config layer with diffID 'sha256:d9f220af3d63e3cc42833703d199d952d8de39e587666e7d64cb97b5330c9b90'
2018/12/11 20:01:24 adding layer 'com.examples.buildpacks.ruby/bundler' with diffID 'sha256:3b9e650eb89e681aff825f3fa4d3cc408467c79c7b69371c42d73faae854eeb1'
2018/12/11 20:01:24 adding layer 'com.examples.buildpacks.ruby/ruby' with diffID 'sha256:e8c6c857d25abd0f16f2541e4d787913fde0efec1a265116655baa51e79a9ea0'
2018/12/11 20:01:24 setting metadata label 'io.buildpacks.lifecycle.metadata'
2018/12/11 20:01:24 setting env var 'PACK_LAYERS_DIR=/workspace'
2018/12/11 20:01:24 setting env var 'PACK_APP_DIR=/workspace/app'
2018/12/11 20:01:24 writing image
2018/12/11 20:01:27
*** Image: test-ruby-app@d91760eb14ef46772d4b61754942014f9263ccf8a96d8bedaf33be8f59ca5586
```

### Caching Gem Dependencies

Next we will start caching gem dependencies to help speed up the build if no new dependencies are needed.

Replace the bundle logic from the previous step

```
echo "---> Installing gems"
mkdir "$layersdir/bundler"
echo -e 'launch = true' > "$layersdir/bundler.toml"

bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin"
```

With this new logic that checks to see if any gems have been changed. This simply creates a checksum for the previous Gemfile and compares it to the checksum of the current Gemfile.  If they are the same, the gems are reused. If they are not, the new gems are installed.

We now write additional metadata to our `bundler.toml` of the form `cache = true`, `build = false`, and `launch = true`. This directs the lifecycle to cache our gems and provide them when launching our application. With `cache = true` the lifecycle can keep existing gems around so that build times are fast even with minor Gemfile changes.

```
### START BUNDLER LAYER

#Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .metadata 2>/dev/null || echo 'not found')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem depencencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$layersdir/bundler" >/dev/null 
    bundle config --local bin "$layersdir/bundler/bin" >/dev/null 
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$layersdir/bundler"
    echo -e "cache = true\nbuild = false\nlaunch = true\nmetadata = \"$local_bundler_checksum\"" > "$layersdir/bundler.toml"
    bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin" && bundle clean
fi
### END BUNDLER LAYER
```

Your full build script will now look like this 

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

### START BUNDLER LAYER
# Compare the previous Gemfile.lock checksum to the current Gemfile.lock checksum
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .metadata 2>/dev/null || echo 'not found')
if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem depencencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$layersdir/bundler" >/dev/null 
    bundle config --local bin "$layersdir/bundler/bin" >/dev/null 
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing  and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$layersdir/bundler"
    echo -e "cache = true \nbuild = false\nlaunch = true\nmetadata = \"$local_bundler_checksum\"" > "$layersdir/bundler.toml"
    bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin" && bundle clean
fi
### END BUNDLER LAYER


# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080 -o 0.0.0.0"}]' > "$layersdir/launch.toml"
```

Now when you build your app it will now generate the Gemfile checksum for the first time and store it in the image

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

And if you build the app again

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will see the new caching logic work

```
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby
---> Installing bundler
Successfully installed bundler-1.17.2
Parsing documentation for bundler-1.17.2
Installing ri documentation for bundler-1.17.2
Done installing documentation for bundler after 2 seconds
1 gem installed
---> Reusing gems

```

### Cache Ruby

Now we will add the logic to cache the ruby interpreter to speed up build times if a new version of ruby is not needed.

First, we will set a desired ruby version that we will support as a variable, in this instance `ruby 2.5.1`. 

```
ruby_version=2.5.1
```

Next we will add the ruby caching logic that checks to see if ruby has been successfully cached with the correct version.

This logic checks to see if the cached version captured in `ruby.toml` matches the desired version defined in the `ruby_version` variable. If it is the same - it reuses the cached version, if it is not (or does not exist) it will download and cache the correct version.

We also write the additional metadata to our `ruby.toml` of the form `cache = true`, `build = false`, and `launch = true` to leverage the cache from the lifecycle.

```
if [[ $ruby_version == $([[ -f $layersdir/ruby.toml ]] && cat "$layersdir/ruby.toml" | yj -t | jq -r .metadata) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby"
    rm -rf $layersdir/ruby
    mkdir -p $layersdir/ruby
    echo "cache = true\nbuild = false\nlaunch = true\nmetadata = \"$ruby_version\"" > "$layersdir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"
    echo "---> Installing bundler"
    gem install bundler
fi
```

Now your full build script will look like this

```
#!/usr/bin/env bash
set -eo pipefail
# Set the layersdir variable to be the first argument from the build lifecycle
layersdir=$1
echo "---> Ruby Buildpack"
ruby_version=2.5.1

# Make ruby and bundler accessible in this script
export PATH=$PATH:$layersdir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

if [[ $ruby_version == $([[ -f $layersdir/ruby.toml ]] && cat "$layersdir/ruby.toml" | yj -t | jq -r .metadata) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby - $ruby_version"
    rm -rf $layersdir/ruby
    mkdir -p $layersdir/ruby
    echo -e "cache = true \nbuild = false\nlaunch = true\nmetadata = \"$ruby_version\"" > "$layersdir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"
    echo "---> Installing bundler"
    gem install bundler
fi

### START BUNDLER LAYER
#Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .metadata 2>/dev/null || echo 'not found') 
if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem depencencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$layersdir/bundler" >/dev/null 
    bundle config --local bin "$layersdir/bundler/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing  and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$layersdir/bundler"
    echo -e "cache = true \nbuild = false\nlaunch = true\nmetadata = \"$local_bundler_checksum\"" > "$layersdir/bundler.toml"
    bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin" && bundle clean
fi
### END BUNDLER LAYER


# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080"}]' > "$layersdir/launch.toml"
```

Now when you run 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will notice that the ruby layer is being added to the cache and then added to the launch directory.

```
*** EXPORTING:
2018/12/11 20:13:04 caching launch layer 'com.examples.buildpacks.ruby/bundler' with sha 'sha256:4dd0befcac1580e9f3a6b432d40bcabae40dc82dda8d91e734473b9359a82620'
2018/12/11 20:13:05 caching launch layer 'com.examples.buildpacks.ruby/ruby' with sha 'sha256:e240e89a4dc266170a1fad8464e63b44c3efe3ca559e12e980ffbcbe67534341'
2018/12/11 20:13:05 adding app layer with diffID 'sha256:2fdb94281b4d0d549684e96d91b86ad88d227bf987a5081cb57c5a2b41d14f5f'
2018/12/11 20:13:05 adding config layer with diffID 'sha256:f27f7ca0ec85fcf13087cccbb0989a701f59dfea2a6f60f751cf82c4942f7ca1'
2018/12/11 20:13:05 reusing layer 'com.examples.buildpacks.ruby/bundler' with diffID 'sha256:4dd0befcac1580e9f3a6b432d40bcabae40dc82dda8d91e734473b9359a82620'
2018/12/11 20:13:09 adding layer 'com.examples.buildpacks.ruby/ruby' with diffID 'sha256:e240e89a4dc266170a1fad8464e63b44c3efe3ca559e12e980ffbcbe67534341'
2018/12/11 20:13:09 setting metadata label 'io.buildpacks.lifecycle.metadata'
2018/12/11 20:13:09 setting env var 'PACK_LAYERS_DIR=/workspace'
2018/12/11 20:13:09 setting env var 'PACK_APP_DIR=/workspace/app'
2018/12/11 20:13:09 writing image
2018/12/11 20:13:13
*** Image: test-ruby-app@4f9a768d791908071ed40f2bca1b875ab2450d7917ab18eebcc6777505c92972
```

If you rebuild your app with the cached version of ruby using 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will now see the build is using the cached version of ruby. 

```
*** BUILDING:
---> Ruby Buildpack
---> Reusing ruby 2.5.1
---> Reusing gems
```

### Select Ruby Version

Next we will update the detect script to check for a specific version of ruby that the user has defined in their application via a `.ruby-version` file,

Append the following version check to the end of your detect script.

```
plandir=$2
version=2.5.1
if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi
echo "ruby = { version = \"$version\" }" > "$plandir/ruby.toml"
```

This new version needs to be written to the build plan to be utilized by the lifecycle throughout the build process. To achieve this, you will need to get the build plan file (the second argument passed into the detect step) and then write to it with the desired ruby version. 

Your full script will now look like this

```
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi

planfile=$2
version=2.5.1
if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi
echo "ruby = { version = \"$version\" }" > "$planfile"
```

Then you will need to update your build script to look for this version from the detect script

Replace 

```
ruby_version=2.5.1 
```

With this

```
ruby_version=$(yj -t | jq -r .ruby.version)
```


Now in your ruby app, create a file named `.ruby-version` and add the following line to it

```
2.5.0
```


Now when run

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will see the new ruby version downloaded and installed

```
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby - 2.5.0
---> Installing bundler
Successfully installed bundler-1.17.2
Parsing documentation for bundler-1.17.2
Installing ri documentation for bundler-1.17.2
Done installing documentation for bundler after 3 seconds
1 gem installed
---> Reusing gems
```

---

That's it!  You've created your first Cloud Native Buildpack that uses detection, image layers and caching to create a runnable OCI image. In a seperate tutorial we will cover distributing this buildpack for developer use via a Cloud Native Buildpack `builder`.
