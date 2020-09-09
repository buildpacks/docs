+++
title="Building your application"
weight=404
+++

<!-- test:suite=create-buildpack;weight=4 -->

Next, we'll make the build step install dependencies. This will require a few updates to the `build` script.

Let's change `ruby-buildpack/bin/build` to look like the following:

<!-- test:file=ruby-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# 1. GET ARGS
layersdir=$1

# 2. DOWNLOAD RUBY
echo "---> Downloading and extracting Ruby"
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
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
echo "---> Installing gems"
bundle install
```

If you build your app again:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```

you will see the following output:

<!-- test:assert=contains;ignore-lines=... -->
```
===> DETECTING
...
===> ANALYZING
...
===> RESTORING
===> BUILDING
[builder] ---> Ruby Buildpack
[builder] ---> Downloading and extracting Ruby
[builder] ---> Installing bundler
[builder] Successfully installed bundler-2.1.4
[builder] 1 gem installed
[builder] ---> Installing gems
[builder] Fetching gem metadata from https://rubygems.org/....
[builder] Resolving dependencies...
[builder] Using bundler 2.1.4
...
[builder] Bundle complete! 1 Gemfile dependency, 7 gems now installed.
...
Successfully built image test-ruby-app
```

You should now see a newly created image named `test-ruby-app` in your Docker daemon. However, your app
image is not yet runnable. We'll make the app image runnable in the next section.

---

<a href="/docs/buildpack-author-guide/create-buildpack/make-app-runnable" class="button bg-pink">Next Step</a>
