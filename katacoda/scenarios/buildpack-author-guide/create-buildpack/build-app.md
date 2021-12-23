# Building your application

<!-- test:suite=create-buildpack;weight=4 -->

Now we'll change the build step you created to install application dependencies. This will require updates to the `build` script such that it performs the following steps:

1. Creates a layer for the Ruby runtime
1. Downloads the Ruby runtime and installs it to the layer
1. Installs Bundler (the Ruby dependency manager)
1. Uses Bundler to install dependencies

By doing this, you'll learn how to create arbitrary layers with your buildpack, and how to read the contents of the app in order to perform actions like downloading dependencies.

Let's begin by changing the `ruby-buildpack/bin/build`{{open}} so that it creates a layer for Ruby.

### Creating a Layer

A Buildpack layer is represented by a directory inside the [layers directory][layers-dir] provided to our buildpack by the Buildpack execution environment. To create a new layer directory representing the Ruby runtime, change the `build` script to look like this:

<!-- file=ruby-buildpack/bin/build -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="replace">
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

layersdir=$1

rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"
</pre>

The `rubylayer` directory is a sub-directory of the directory provided as the first positional argument to the build script (the [layers directory][layers-dir]), and this is where we'll store the Ruby runtime.

Next, we'll download the Ruby runtime and install it into the layer directory. Add the following code to the end of the `build` script:

<!-- file=ruby-buildpack/bin/build data-target=append -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="append">
echo "---> Downloading and extracting Ruby"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$rubylayer"
</pre>

This code uses the `wget` tool to download the Ruby binaries from the given URL, and extracts it to the `rubylayer` directory.

The last step in creating a layer is writing a TOML file that contains metadata about the layer. The TOML file's name must match the name of the layer (in this example it's `ruby.toml`). Without this file, the Buildpack lifecycle will ignore the layer directory. For the Ruby layer, we need to ensure it is available in the launch image by setting the `launch` key to `true`. Add the following code to the build script:

<!-- file=ruby-buildpack/bin/build data-target=append -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="append">
echo -e '[types]\nlaunch = true' > "$layersdir/ruby.toml"
</pre>

### Installing Dependencies

Next, we'll use the Ruby runtime you installed to download the application's dependencies. First, we need to make the Ruby executables available to our script by putting it on the Path. Add the following code to the end of the `build` script:

<!-- file=ruby-buildpack/bin/build data-target=append -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="append">
export PATH="$rubylayer"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"$rubylayer/lib"
</pre>

Now we can install Bundler, a dependency manager for Ruby, and run the `bundle install` command. Append the following code to the script:

<!-- file=ruby-buildpack/bin/build data-target=append -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="append">
echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

echo "---> Installing gems"
bundle install
</pre>

Now the Buildpack is ready to test.

### Running the Build

Your complete `ruby-buildpack/bin/build`{{open}} script should look like this:


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

# 7. INSTALL GEMS
echo "---> Installing gems"
bundle install
</pre>

Build your app again:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```{{execute}}

You will see the following output:

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
...
[builder] ---> Installing gems
...
===> EXPORTING
...
Successfully built image 'test-ruby-app'
```

A new image named `test-ruby-app` was created in your Docker daemon with a layer containing the Ruby runtime. However, your app image is not yet runnable. We'll make the app image runnable in the next section.



[layers-dir]: https://buildpacks.io/docs/reference/spec/buildpack-api/#layers