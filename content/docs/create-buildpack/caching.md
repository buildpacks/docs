+++
title="Improving performance with caching"
weight=406
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Danny Joyce"
lastmodifieremail = "djoyce@pivotal.io"
+++

Next we want to separate the ruby interpreter and bundled gems into different layers.  This will allows us to cache the ruby layer and gem dependency layer separately, which helps speed up builds.

### Creating the Bundler Layer

To do this replace the line in the `bin/build` script

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
echo -e 'launch = true' > $layersdir/ruby.toml

ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"

# Make ruby accessible in this script
export PATH=$layersdir/ruby/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

echo "---> Installing gems"
mkdir "$layersdir/bundler"
echo -e 'launch = true' > "$layersdir/bundler.toml"
bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin"

# Set default start command
echo 'processes = [{ type = "web", command = "bundle exec ruby app.rb"}]' > "$layersdir/launch.toml"
```

Now when we run 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will see the a similar line added during the EXPORTING phase

```
[exporter] adding layer 'com.examples.buildpacks.ruby:bundler' with diffID 'sha256:7a0b5596acbb2c846a4f4f9a0fd44c2d5265e10b4949db1fd7f44dedd91244c5'
```

### Caching Gem Dependencies

Next we will start caching gem dependencies to help speed up the build if no new dependencies are needed.

First, we'll need to install some helpful tools at the top of the `bin/build` script

```
# Download some useful tools
wget -qO /tmp/jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 && chmod +x /tmp/jq
wget -qO /tmp/yj https://github.com/sclevine/yj/releases/download/v2.0/yj-linux && chmod +x /tmp/yj
```

Replace the bundle logic from the previous step

```
echo "---> Installing gems"
mkdir "$layersdir/bundler"
echo -e 'launch = true' > "$layersdir/bundler.toml"

bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin"
```

With this new logic that checks to see if any gems have been changed. This simply creates a checksum for the previous Gemfile and compares it to the checksum of the current Gemfile.  If they are the same, the gems are reused. If they are not, the new gems are installed.

We'll now write additional metadata to our `bundler.toml` of the form `cache = true`, `build = false`, and `launch = true`. This directs the lifecycle to cache our gems and provide them when launching our application. With `cache = true` the lifecycle can keep existing gems around so that build times are fast even with minor Gemfile changes.

```
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | /tmp/yj -t | /tmp/jq -r .metadata 2>/dev/null || echo 'not found')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
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
```

Your full build script will now look like this 

```
#!/usr/bin/env bash
set -eo pipefail

# Set the layersdir variable to be the first argument from the build lifecycle
layersdir=$1

# Download some useful tools
wget -qO /tmp/jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 && chmod +x /tmp/jq
wget -qO /tmp/yj https://github.com/sclevine/yj/releases/download/v2.0/yj-linux && chmod +x /tmp/yj

echo "---> Ruby Buildpack" 

echo "---> Downloading and extracting ruby"
mkdir -p $layersdir/ruby
echo -e 'launch = true' > $layersdir/ruby.toml

ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"

# Make ruby accessible in this script
export PATH=$layersdir/ruby/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

# Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | /tmp/yj -t | /tmp/jq -r .metadata 2>/dev/null || echo 'not found')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem depenencies have changed, so it can reuse existing gems without running bundle install
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

# Set default start command
echo 'processes = [{ type = "web", command = "bundle exec ruby app.rb"}]' > "$layersdir/launch.toml"
```

Now when you build your app it will now generate the Gemfile checksum for the first time and store it in the image

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

And if you build the app again

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will see the new caching logic at work during the BUILDING phase

```
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting ruby
[builder] ---> Installing bundler
[builder] Successfully installed bundler-2.0.1
[builder] 1 gem installed
[builder] ---> Reusing gems
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
# Check to see if the desired ruby version is available for re-use
if [[ $ruby_version == $([[ -f $layersdir/ruby.toml ]] && cat "$layersdir/ruby.toml" | /tmp/yj -t | /tmp/jq -r .metadata) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby - $ruby_version"
    rm -rf $layersdir/ruby
    mkdir -p $layersdir/ruby
    echo -e "cache = true \nbuild = false\nlaunch = true\nmetadata = \"$ruby_version\"" > "$layersdir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"
    
    echo "---> Installing bundler"
    gem install bundler --no-ri --no-rdoc
fi
```

Now your full build script will look like this

```
#!/usr/bin/env bash
set -eo pipefail

# Set the layersdir variable to be the first argument from the build lifecycle
layersdir=$1

# Download some useful tools
wget -qO /tmp/jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 && chmod +x /tmp/jq
wget -qO /tmp/yj https://github.com/sclevine/yj/releases/download/v2.0/yj-linux && chmod +x /tmp/yj

# Set the default ruby version
ruby_version=2.5.1

echo "---> Ruby Buildpack"

# Make ruby accessible in this script
export PATH=$layersdir/ruby/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

# Check to see if the desired ruby version is available for re-use
if [[ $ruby_version == $([[ -f $layersdir/ruby.toml ]] && cat "$layersdir/ruby.toml" | /tmp/yj -t | /tmp/jq -r .metadata) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby - $ruby_version"
    rm -rf $layersdir/ruby
    mkdir -p $layersdir/ruby
    echo -e "cache = true \nbuild = false\nlaunch = true\nmetadata = \"$ruby_version\"" > "$layersdir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"
    
    echo "---> Installing bundler"
    gem install bundler --no-ri --no-rdoc
fi

# Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | /tmp/yj -t | /tmp/jq -r .metadata 2>/dev/null || echo 'not found')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$layersdir/bundler" >/dev/null 
    bundle config --local bin "$layersdir/bundler/bin" >/dev/null 
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$layersdir/bundler"
    echo -e "cache = true\nbuild = false\nlaunch = true\nmetadata.checksum = \"$local_bundler_checksum\"" > "$layersdir/bundler.toml"
    bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin" && bundle clean
fi

# Set default start command
echo 'processes = [{ type = "web", command = "bundle exec ruby app.rb"}]' > "$layersdir/launch.toml"
```

Now when you run 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will notice that the ruby layer is both exported and cached.

```
===> EXPORTING
...
[exporter] adding layer 'com.examples.buildpacks.ruby:ruby' with diffID 'sha256:2fe78024e6cec6037c774bdad0b79d160188ea6b074405b9467e2a1eaeec173d'
...
===> CACHING
...
[cacher] adding layer 'com.examples.buildpacks.ruby:ruby' with diffID 'sha256:2fe78024e6cec6037c774bdad0b79d160188ea6b074405b9467e2a1eaeec173d'
...
```

If you rebuild your app with the cached version of ruby using 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will now see the build is using the cached version of ruby. 

```
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Reusing ruby 2.5.1
[builder] ---> Reusing gems
```

### Select Ruby Version

Next we will update the detect script to check for a specific version of ruby that the user has defined in their application via a `.ruby-version` file,

Add the following version check to the end of your detect script.

```
plan=$2
version=2.5.1

if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi

echo "ruby = { version = \"$version\" }" > "$plan"
```

This new version needs to be written to the build plan to be utilized by the lifecycle throughout the build process. To achieve this, you will need to get the build plan file (the second argument passed into the detect step) and then write to it with the desired ruby version. 

Your full script will now look like this

```
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi

plan=$2
version=2.5.1

if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi

echo "ruby = { version = \"$version\" }" > "$plan"
```

Then you will need to update your build script to look for this version from the detect script

Replace 

```
# Set the default ruby version
ruby_version=2.5.1 
```

With this

```
# Get the desired version of ruby
ruby_version=$(/tmp/yj -t | /tmp/jq -r .ruby.version)
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
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting ruby - 2.5.0
[builder] ---> Installing bundler
[builder] Successfully installed bundler-2.0.1
[builder] 1 gem installed
[builder] ---> Reusing gems
```

That's it!  You've created your first Cloud Native Buildpack that uses detection, image layers and caching to create a runnable OCI image.

---
