+++
title="Making your buildpack configurable"
weight=407
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Javier Romero"
lastmodifieremail = "jromero@pivotal.io"
+++

It's likely that not all Ruby apps will want to use the same version of Ruby. Let's make the Ruby version configurable.

## Select Ruby version

We'll allow buildpack users to define the desired Ruby version via a `.ruby-version` file in their app. We'll first update the `detect` script to check for
this file and record its contents into the build plan:

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
echo "requires = [{ name = \"ruby\", version = \"$version\" }]" >> "$plan"
# ======= /ADDED =======
```

Then you will need to update your `build` script to look for the recorded Ruby version in the build plan:

Your `build` script should look like the following:

```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# 0. DOWNLOAD TOOLS
wget -qO /tmp/jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 && chmod +x /tmp/jq
wget -qO /tmp/yj https://github.com/sclevine/yj/releases/download/v2.0/yj-linux && chmod +x /tmp/yj

# ======= MODIFIED =======
# 1. GET ARGS
layersdir=$1
plan=$3

# ======= MODIFIED =======
# 2. DOWNLOAD RUBY
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"
ruby_version=$(cat "$plan" | /tmp/yj -t | /tmp/jq -r '.entries[] | select(.name == "ruby") | .version')
echo "---> Downloading and extracting Ruby $ruby_version"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$rubylayer"

# 3. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e 'launch = true' > "$rubylayer.toml"
echo -e "launch = true\nmetadata = \"$ruby_version\"" > "$rubylayer.toml"

# 4. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="$rubylayer"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"$rubylayer/lib"

# 5. INSTALL BUNDLER
echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

# 6. INSTALL GEMS

# Compares previous Gemfile.lock checksum to the current Gemfile.lock
bundlerlayer="$layersdir/bundler"
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$bundlerlayer.toml" | /tmp/yj -t | /tmp/jq -r .metadata 2>/dev/null || echo 'not found')

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$bundlerlayer" >/dev/null
    bundle config --local bin "$bundlerlayer/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir "$bundlerlayer" || true
    echo -e "cache = true\nlaunch = true\nmetadata = \"$local_bundler_checksum\"" > "$bundlerlayer.toml"
    bundle install --path "$bundlerlayer" --binstubs "$bundlerlayer/bin"
fi

# 7. SET DEFAULT START COMMAND
echo 'processes = [{ type = "web", command = "bundle exec ruby app.rb"}]' > "$layersdir/launch.toml"
```

Finally, in your Ruby app directory, create a file named `.ruby-version` with the following contents:

```
2.5.0
```

Now when you run:

```bash
pack build test-ruby-app --path ~/workspace/ruby-sample-app --buildpack ~/workspace/ruby-cnb
```

You will notice that version of Ruby specified in the app's `.ruby-version` file is downloaded.

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