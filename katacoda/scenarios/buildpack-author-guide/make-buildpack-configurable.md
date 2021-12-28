# Making your buildpack configurable

<!-- test:suite=create-buildpack;weight=8 -->

It's likely that not all Ruby apps will want to use the same version of Ruby. Let's make the Ruby version configurable.

## Select Ruby version

We'll allow buildpack users to define the desired Ruby version via a `.ruby-version` file in their app. We'll first update the `detect` script to check for this file. We will then record the dependency we can `provide` (Ruby), as well as the specific dependency the application will `require`, in the `Build Plan`, a document the lifecycle uses to determine if the buildpack will provide everything the application needs.

Update `ruby-buildpack/bin/detect` to look like this:

<!-- test:file=ruby-buildpack/bin/detect -->
<pre class="file" data-filename="ruby-buildpack/bin/detect" data-target="replace">
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi

# ======= ADDED =======
plan=$2
version=2.5.1

if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi

echo "provides = [{ name = \"ruby\" }]" > "$plan"
echo "requires = [{ name = \"ruby\", metadata = { version = \"$version\" } }]" >> "$plan"
# ======= /ADDED =======
</pre>

Then you will need to update your `build` script to look for the recorded Ruby version in the build plan:

Your `ruby-buildpack/bin/build` script should look like the following:

<!-- test:file=ruby-buildpack/bin/build -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="replace">
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# ======= MODIFIED =======
# 1. GET ARGS
layersdir=$1
plan=$3

# 2. CREATE THE LAYER DIRECTORY
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"

# ======= MODIFIED =======
# 3. DOWNLOAD RUBY
ruby_version=$(cat "$plan" | yj -t | jq -r '.entries[] | select(.name == "ruby") | .metadata.version')
echo "---> Downloading and extracting Ruby $ruby_version"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$rubylayer"

# 4. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "$layersdir/ruby.toml"

# 5. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="$rubylayer"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"$rubylayer/lib"

# 6. INSTALL BUNDLER
echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

# 7. INSTALL GEMS
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
bundlerlayer="$layersdir/bundler"
local_bundler_checksum=$((sha256sum Gemfile.lock >/dev/null 2>&1 || echo 'DOES_NOT_EXIST') | cut -d ' ' -f 1)
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

Finally, create a file `ruby-sample-app/.ruby-version` with the following contents:

<!-- test:file=ruby-sample-app/.ruby-version -->
<pre class="file" data-filename="ruby-sample-app/.ruby-version" data-target="replace">
2.5.0
</pre>

Now when you run:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```<--+ "{{execute}}" +-->

You will notice that version of Ruby specified in the app's `.ruby-version` file is downloaded.

<!-- test:assert=contains -->
```text
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting Ruby 2.5.0
```

Next, let's see how buildpacks can store information about the dependencies provided in the output app image for introspection.

