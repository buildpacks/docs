# Make your application runnable

<!-- test:suite=create-buildpack;weight=5 -->

To make your app runnable, a default start command must be set. You'll need to add the following to the end of your `build` script:

```bash
# ...

# Set default start command
cat > "$layersdir/launch.toml" <<EOL
[[processes]]
type = "web"
command = "bundle exec ruby app.rb"
default = true
EOL

# ...
```

Your full `ruby-buildpack/bin/build` {{open}} script should now look like the following:

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

# ========== ADDED ===========
# 8. SET DEFAULT START COMMAND
cat > "$layersdir/launch.toml" <<EOL
[[processes]]
type = "web"
command = "bundle exec ruby app.rb"
default = true
EOL
</pre>

Then rebuild your app using the updated buildpack:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```{{execute}}

You should then be able to run your new Ruby app:

```bash
docker run --rm -p 8080:8080 test-ruby-app
```{{execute}}

and see the server log output:

```text
[2019-04-02 18:04:48] INFO  WEBrick 1.4.2
[2019-04-02 18:04:48] INFO  ruby 2.5.1 (2018-03-29) [x86_64-linux]
== Sinatra (v2.0.5) has taken the stage on 8080 for development with backup from WEBrick
[2019-04-02 18:04:48] INFO  WEBrick::HTTPServer#start: pid=1 port=8080
```

Test it out by navigating to [localhost:8080](http://localhost:8080) in your favorite browser!

We can add multiple process types to a single app. We'll do that in the next section.

