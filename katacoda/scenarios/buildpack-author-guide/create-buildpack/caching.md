# Improving performance with caching

<!-- test:suite=create-buildpack;weight=7 -->

We can improve performance by caching dependencies between builds, only re-downloading when necessary. To begin, let's create a cacheable `bundler` layer.

## Creating the `bundler` layer

To do this, replace the following lines in the `build` script:

```bash
echo "---> Installing gems"
bundle install
```

with the following:

```bash
echo "---> Installing gems"
bundlerlayer="$layersdir/bundler"
mkdir -p "$bundlerlayer"
echo -e '[types]\ncache = true\nlaunch = true' > "$layersdir/bundler.toml"
bundle config set --local path "$bundlerlayer" && bundle install && bundle binstubs --all --path "$bundlerlayer/bin"

```

Your full `ruby-buildpack/bin/build`{{open}} script should now look like the following:

<!-- test:file=ruby-buildpack/bin/build -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="replace">
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# 1. GET ARGS
layersdir=$1

# 2. CREATE THE LAYER DIRECTORY
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"

# 3. DOWNLOAD RUBY
echo "---> Downloading and extracting Ruby"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$rubylayer"

# 4. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "$layersdir/ruby.toml"

# 5. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="$rubylayer"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"$rubylayer/lib"

# 6. INSTALL BUNDLER
echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

# ======= MODIFIED =======
# 7. INSTALL GEMS
echo "---> Installing gems"
bundlerlayer="$layersdir/bundler"
mkdir -p "$bundlerlayer"
echo -e '[types]\ncache = true\nlaunch = true' > "$layersdir/bundler.toml"
bundle config set --local path "$bundlerlayer" && bundle install && bundle binstubs --all --path "$bundlerlayer/bin"

# 8. SET DEFAULT START COMMAND
cat > "$layersdir/launch.toml" <<EOL
# our web process
[[processes]]
type = "web"
command = "bundle exec ruby app.rb"
default = true

# our worker process
[[processes]]
type = "worker"
command = "bundle exec ruby worker.rb"
EOL
</pre>

Now when we run:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```{{execute}}

You will see something similar to the following during the `EXPORTING` phase:

<!-- test:assert=contains -->
```text
[exporter] Adding layer 'examples/ruby:bundler'
```

## Caching dependencies

Now, let's implement the caching logic. We'll first need to create a `ruby-sample-app/Gemfile.lock`{{open}} file with the contents given below:

> Typically you would run `bundle install` locally to generate this file, but for the sake
> of simplicity we'll create `ruby-sample-app/Gemfile.lock` manually.

<!-- test:file=ruby-sample-app/Gemfile.lock -->
<pre class="file" data-filename="ruby-sample-app/Gemfile.lock" data-target="replace">
GEM
  remote: https://rubygems.org/
  specs:
    mustermann (1.0.3)
    rack (2.0.7)
    rack-protection (2.0.7)
      rack
    sinatra (2.0.7)
      mustermann (~> 1.0)
      rack (~> 2.0)
      rack-protection (= 2.0.7)
      tilt (~> 2.0)
    tilt (2.0.9)

PLATFORMS
  ruby

DEPENDENCIES
  sinatra

BUNDLED WITH
   2.0.2
</pre>

Replace the gem installation logic from the previous step:

```bash
# ...

echo "---> Installing gems"
bundlerlayer="$layersdir/bundler"
mkdir -p "$bundlerlayer"
echo -e '[types]\ncache = true\nlaunch = true' > "$layersdir/bundler.toml"
bundle config set --local path "$bundlerlayer" && bundle install && bundle binstubs --all --path "$bundlerlayer/bin"


# ...
```

with the new logic below that checks to see if any gems have been changed. This simply creates a checksum for the previous `Gemfile.lock` and compares it to the checksum of the current `Gemfile.lock`. If they are the same, the gems are reused. If they are not, the new gems are installed.

We'll now write additional metadata to our `bundler.toml` of the form `cache = true` and `launch = true`. This directs the lifecycle to cache our gems and provide them when launching our application. With `cache = true` the lifecycle can keep existing gems around so that build times are fast, even with minor `Gemfile.lock` changes.

Note that there may be times when you would want to clean the cached layer from the previous build, in which case you should always ensure to remove the contents of the layer before proceeding with the build. In the case below this can be done using a simple `rm -rf "$bundlerlayer"/*` after the `mkdir -p "$bundlerlayer"` command.

```bash
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
bundlerlayer="$layersdir/bundler"
local_bundler_checksum=$((sha256sum Gemfile.lock || echo 'DOES_NOT_EXIST') | cut -d ' ' -f 1)
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .metadata.checksum 2>/dev/null || echo 'DOES_NOT_EXIST')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$bundlerlayer" >/dev/null
    bundle config --local bin "$bundlerlayer/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$bundlerlayer"
    cat > "$layersdir/bundler.toml" <<EOL
[types]
cache = true
launch = true

[metadata]
checksum = "$local_bundler_checksum"
EOL
    bundle config set --local path "$bundlerlayer" && bundle install && bundle binstubs --all --path "$bundlerlayer/bin"

fi
```

Your full `ruby-buildpack/bin/build`{{open}} script will now look like this:

<!-- test:file=ruby-buildpack/bin/build -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="replace">
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# 1. GET ARGS
layersdir=$1

# 2. CREATE THE LAYER DIRECTORY
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"

# 3. DOWNLOAD RUBY
echo "---> Downloading and extracting Ruby"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$rubylayer"

# 4. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "$layersdir/ruby.toml"

# 5. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="$rubylayer"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"$rubylayer/lib"

# 6. INSTALL BUNDLER
echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

# ======= MODIFIED =======
# 7. INSTALL GEMS
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
bundlerlayer="$layersdir/bundler"
local_bundler_checksum=$((sha256sum Gemfile.lock || echo 'DOES_NOT_EXIST') | cut -d ' ' -f 1)
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .metadata.checksum 2>/dev/null || echo 'DOES_NOT_EXIST')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$bundlerlayer" >/dev/null
    bundle config --local bin "$bundlerlayer/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$bundlerlayer"
    cat > "$layersdir/bundler.toml" <<EOL
[types]
cache = true
launch = true

[metadata]
checksum = "$local_bundler_checksum"
EOL
    bundle config set --local path "$bundlerlayer" && bundle install && bundle binstubs --all --path "$bundlerlayer/bin"

fi

# 8. SET DEFAULT START COMMAND
cat > "$layersdir/launch.toml" <<EOL
# our web process
[[processes]]
type = "web"
command = "bundle exec ruby app.rb"
default = true

# our worker process
[[processes]]
type = "worker"
command = "bundle exec ruby worker.rb"
EOL
</pre>

Now when you build your app:

<!-- test:exec -->
```text
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```{{execute}}

it will download the gems:

<!-- test:assert=contains;ignore-lines=... -->
```text
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting Ruby
[builder] ---> Installing bundler
...
[builder] ---> Installing gems
```

If you build the app again:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```{{execute}}

you will see the new caching logic at work during the `BUILDING` phase:

<!-- test:assert=contains;ignore-lines=... -->
```text
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting Ruby
[builder] ---> Installing bundler
...
[builder] ---> Reusing gems
```

Next, let's see how buildpack users may be able to provide configuration to the buildpack.

