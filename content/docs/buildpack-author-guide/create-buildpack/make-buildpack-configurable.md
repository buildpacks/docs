+++
title="Making your buildpack configurable"
weight=408
+++

<!-- test:suite=create-buildpack;weight=8 -->

It's likely that not all Ruby apps will want to use the same version of Ruby. Let's make the Ruby version configurable.

## Select Ruby version

We'll allow buildpack users to define the desired Ruby version via a `.ruby-version` file in their app. We'll first update the `detect` script to check for this file. We will then record the dependency we can `provide` (Ruby), as well as the specific dependency the application will `require`, in the `Build Plan`, a document the lifecycle uses to determine if the buildpack will provide everything the application needs.

Update `ruby-buildpack/bin/detect` to look like this:

<!-- test:file=ruby-buildpack/bin/detect -->
```bash
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
```

Then you will need to update your `build` script to look for the recorded Ruby version in the build plan:

Your `ruby-buildpack/bin/build` script should look like the following:

<!-- test:file=ruby-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# ======= MODIFIED =======
# 1. GET ARGS
layersdir=$1
plan=$3

# ======= MODIFIED =======
# 2. DOWNLOAD RUBY
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"
ruby_version=$(cat "$plan" | yj -t | jq -r '.entries[] | select(.name == "ruby") | .metadata.version')
echo "---> Downloading and extracting Ruby $ruby_version"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
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
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
bundlerlayer="$layersdir/bundler"
local_bundler_checksum=$((sha256sum Gemfile.lock >/dev/null 2>&1 || echo 'DOES_NOT_EXIST') | cut -d ' ' -f 1)
remote_bundler_checksum=$(cat "$bundlerlayer.toml" | yj -t | jq -r .metadata.checksum 2>/dev/null || echo 'DOES_NOT_EXIST')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$bundlerlayer" >/dev/null
    bundle config --local bin "$bundlerlayer/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$bundlerlayer"
    cat > "$bundlerlayer.toml" <<EOL
cache = true
launch = true

[metadata]
checksum = "$local_bundler_checksum"
EOL
    bundle config set --local path "$bundlerlayer" && bundle install && bundle binstubs --all --path "$bundlerlayer/bin"

fi

# 7. SET DEFAULT START COMMAND
cat > "$layersdir/launch.toml" <<EOL
# our web process
[[processes]]
type = "web"
command = "bundle exec ruby app.rb"

# our worker process
[[processes]]
type = "worker"
command = "bundle exec ruby worker.rb"
EOL
```

Finally, create a file `ruby-sample-app/.ruby-version` with the following contents:

<!-- test:file=ruby-sample-app/.ruby-version -->
```
2.5.0
```

Now when you run:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```

You will notice that version of Ruby specified in the app's `.ruby-version` file is downloaded.

<!-- test:assert=contains -->
```text
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting Ruby 2.5.0
```

Congratulations! You've created your first configurable Cloud Native Buildpack that uses detection, image layers, and caching to create a runnable OCI image.

## Going further

Now that you've finished your buildpack, how about extending it? Try:

- Caching the downloaded Ruby version
- [Packaging your buildpack for distribution][package-a-buildpack]

[package-a-buildpack]: /docs/buildpack-author-guide/package-a-buildpack/
