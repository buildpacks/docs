# Specify multiple process types

<!-- test:suite=create-buildpack;weight=6 -->

One of the benefits of buildpacks is that they are multi-process - an image can have multiple entrypoints for each operational mode. Let's see how this works. We will extend our app to have a worker process.

Let's create a worker file, `ruby-sample-app/worker.rb`, with the following contents:

<!-- test:file=ruby-sample-app/worker.rb -->
<pre class="file" data-filename="ruby-sample-app/worker.rb" data-target="replace">
for i in 0..5
    puts "Running a worker task..."
end
</pre>

After building our app, we could run the resulting image with the `web` process (currently the default) or our new worker process.

To enable running the worker process, we'll need to have our buildpack define a "process type" for the worker.  Modify the section where processes are defined to:

```bash
# ...

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

# ...
```

Your full `ruby-buildpack/bin/build` script should now look like the following:

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

# ========== MODIFIED ===========
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

Now if you rebuild your app using the updated buildpack:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```<--+ "{{execute}}" +-->

You should then be able to run your new Ruby worker process:

<!-- test:exec -->
```bash
docker run --rm --entrypoint worker test-ruby-app
```<--+ "{{execute}}" +-->

and see the worker log output:

<!-- test:assert=contains -->
```text
Running a worker task...
Running a worker task...
Running a worker task...
Running a worker task...
Running a worker task...
Running a worker task...
```

Next, we'll look at how to improve our buildpack by leveraging cache.

