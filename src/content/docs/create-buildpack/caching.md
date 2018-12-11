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
touch "$layersdir/bundler.toml"

bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin"
```

Your full build script should now look like this

```
#!/usr/bin/env bash
set -eo pipefail
# Set the layersdir variable to be the third argument from the build lifecycle
layersdir=$3 

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
touch "$layersdir/bundler.toml"

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
Step 1/5 : FROM packs/run
---> aebbb14d9529
Step 2/5 : ADD --chown=pack:pack /workspace/app /workspace/app
---> 218f662e7424
Step 3/5 : ADD --chown=pack:pack /workspace/config /workspace/config
---> 822b4af62763
Step 4/5 : ADD --chown=pack:pack /workspace/io.buildpacks.samples.ruby/bundler /workspace/io.buildpacks.samples.ruby/bundler  *** Added bundler layer ***
---> 6312ef1f72db
Step 5/5 : ADD --chown=pack:pack /workspace/io.buildpacks.samples.ruby/ruby /workspace/io.buildpacks.samples.ruby/ruby *** Added ruby layer ***
---> f30822d0d3e0
---> f30822d0d3e0
Successfully built f30822d0d3e0
Successfully tagged test-ruby-app:latest
Step 1/2 : FROM test-ruby-app
---> f30822d0d3e0
Step 2/2 : LABEL io.buildpacks.lifecycle.metadata='{"app":{"name":"","sha":"sha256:b6cf193d1e24768b5e6fedba9165156fc47ac68249549a079ab9611e546ed641"},"config":{"sha":"sha256:8a5961cc7bfdf64565631a31a6b70111bf65ac981f52ede8c6a5dca118f7fdc3"},"buildpacks":[{"key":"io.buildpacks.samples.ruby","name":"","layers":{"bundler":{"sha":"sha256:24b55bd13e0f34511639ccc3d9f8931f0a4a6d0206f51bce2af74822a9481975","data":{}},"ruby":{"sha":"sha256:56a9193f461c09ee566c5cece64cb3e1f0c87f8d95f1c0029ab8fbcf5208c71b","data":{}}}}],"runimage":{"name":"packs/run","sha":"sha256:2ace261ebe9f5936ea72b6290019cda476db6a0b3a4d5d64039c61b45e46091f"}}'
---> Running in b3b7cc1eafa0
---> d66d877f6442
---> d66d877f6442
Successfully built d66d877f6442
Successfully tagged test-ruby-app:latest
```

### Caching Gem Dependencies

Next we will start caching gem dependencies to help speed up the build if no new dependencies are needed.

Replace the bundle logic from the previous step

```
echo "---> Installing gems"
mkdir "$layersdir/bundler"
touch "$layersdir/bundler.toml"

bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin"
```

With this new logic that checks to see if any gems have been changed. This simply creates a checksum for the previous Gemfile and compares it to the checksum of the current Gemfile.  If they are the same, the gems are reused. If they are not, the new gems are installed.

```
### START BUNDLER LAYER

#Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .lock_checksum 2>/dev/null || echo 'not found')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum && $reused_ruby == 'true' ]] ; then
    #Determine no gem depencencies have changed, so can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$layersdir/bundler" >/dev/null 
    bundle config --local bin "$layersdir/bundler/bin" >/dev/null 
else
# Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing  and un-changed gems
	echo "---> Installing gems"
	mkdir -p "$layersdir/bundler"
	echo -e "cache=\"true\"\nbuild=\"false\"\nlaunch=\"true\"\nlock_checksum=\"$local_bundler_checksum\"" > "$layersdir/bundler.toml"
	bundle install --path "$layersdir/bundler" --binstubs "$layersdir/bundler/bin" && bundle clean
fi
### END BUNDLER LAYER
```

Your full build script will now look like this 

```
#!/usr/bin/env bash
set -eo pipefail
# Set the layersdir variable to be the third argument from the build lifecycle
layersdir=$3 

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

### START BUNDLER LAYER
#Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .lock_checksum 2>/dev/null || echo 'not found')
if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum && $reused_ruby == 'true' ]] ; then
    #Determine no gem depencencies have changed, so can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$layersdir/bundler" >/dev/null 
    bundle config --local bin "$layersdir/bundler/bin" >/dev/null 
else
# Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing  and un-changed gems
	echo "---> Installing gems"
	mkdir -p "$layersdir/bundler"
	echo -e "cache=\"true\"\nbuild=\"false\"\nlaunch=\"true\"\nlock_checksum=\"$local_bundler_checksum\"" > "$layersdir/bundler.toml"
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
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 2 seconds
1 gem installed
---> Reusing gems  *** Gems were successfully cached ***

```

### Cache Ruby

Now we will add the logic to cache the ruby interpreter to speed up build times if a new version of ruby is not needed.

First we need to capture the cache directory from the build lifecycle. 

```
cachedir=$2
```

Next we will set a desired ruby version that we will support as a variable, in this instance `ruby 2.5.1`. 

```
ruby_version=2.5.1
```

Next we will update our ruby paths inside the script to point to the `$cachedir` instead of the `$layersdir`.

```
export PATH=$PATH:$cachedir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$cachedir/ruby/lib
```

Next we will add the ruby caching logic that checks to see if ruby has been successfully cached with the correct version.

This logic checks to see if the cached version captured in `ruby.toml` matches the desired version defined in the `ruby_version` variable. If it is the same - it reuses the cached version, if it is not (or does not exist) it will download and cache the correct version.

```
if [[ $ruby_version == $([[ -f $cachedir/ruby.toml ]] && cat "$cachedir/ruby.toml" | yj -t | jq -r .version) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby"
    rm -rf $cachedir/ruby
    mkdir -p $cachedir/ruby
    echo "version = \"$ruby_version\"" > "$cachedir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$cachedir/ruby"
    echo "---> Installing bundler"
    gem install bundler
fi
```

Next we check to see if the desired version of ruby matches the previous images version of ruby in the `$layersdir`. If it is the same, it is reused, if it is not it is copied to the `$layersdir` from the `$cachedir`

```
if [[ $ruby_version == $([[ -f $layersdir/ruby.toml ]] && cat "$layersdir/ruby.toml" | yj -t | jq -r .version) ]] ; then
    echo "---> Reusing ruby layer"
else
    echo "---> Adding ruby layer"
    cp $cachedir/ruby.toml $layersdir/ruby.toml
    cp -r $cachedir/ruby $layersdir/ruby
fi
```

Now your full build script will look like this

```
#!/usr/bin/env bash
set -eo pipefail
# Set the layersdir variable to be the third argument from the build lifecycle
cachedir=$2
layersdir=$3
echo "---> Ruby Buildpack"
ruby_version=2.5.1

# Make ruby and bundler accessible in this script
export PATH=$PATH:$layersdir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

if [[ $ruby_version == $([[ -f $layersdir/ruby.toml ]] && cat "$layersdir/ruby.toml" | yj -t | jq -r .version) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby - $ruby_version"
    rm -rf $layersdir/ruby
    mkdir -p $layersdir/ruby
    echo -e "cache=\"true\"\nbuild=\"false\"\nlaunch=\"true\"\nversion=\"$ruby_version\"" > "$layersdir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"
    echo "---> Installing bundler"
    gem install bundler
fi

### START BUNDLER LAYER
#Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .lock_checksum 2>/dev/null || echo 'not found') 
if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum && $reused_ruby == 'true' ]] ; then
    #Determine no gem depencencies have changed, so can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$layersdir/bundler" >/dev/null 
    bundle config --local bin "$layersdir/bundler/bin" >/dev/null
else
# Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing  and un-changed gems
	echo "---> Installing gems"
	mkdir -p "$layersdir/bundler"
	echo -e "cache=\"true\"\nbuild=\"false\"\nlaunch=\"true\"\nlock_checksum=\"$local_bundler_checksum\"" > "$layersdir/bundler.toml"
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
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby  *** Downloads Ruby ***
---> Installing bundler
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 2 seconds
1 gem installed
---> Adding ruby layer  *** Adding ruby to launch directory from cache ***
---> Reusing gems
```

If you rebuild your app with the cached version of ruby using 

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

You will now see the build is using the cached version of ruby. 

```
*** BUILDING:
---> Ruby Buildpack
---> Reusing ruby 2.5.1 *** Reusing cached ruby ***
---> Reusing ruby layer *** Reusing the ruby launch layer ***
---> Reusing gems
```

### Select Ruby Version

Next we will update the detect script to check for a specific version of ruby that the user has defined in their application via a `.ruby-version` file,

Append the following version check to the end of your detect script

```
version=2.5.1
if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi
echo "ruby = { version = \"$version\" }"
```

Your full script will now look like this

```
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi


version=2.5.1
if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi
echo "ruby = { version = \"$version\" }"
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
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 3 seconds
1 gem installed
---> Adding ruby layer
---> Reusing gems
```

---

That's it!  You've created your first Cloud Native Buildpack that uses detection, image layers and caching to create a runnable OCI image. In a seperate tutorial we will cover distributing this buildpack for developer use via a Cloud Native Buildpack `builder`.
