+++
title="Specify multiple process types"
weight=407
creatordisplayname = "Natalie Arellano"
creatoremail = "narellano@vmware.com"
lastmodifierdisplayname = "Natalie Arellano"
lastmodifieremail = "narellano@vmware.com"
+++

One of the benefits of buildpacks is that they are multi-process - an image can have multiple entrypoints for each operational mode.

Let's see how this works. We will extend our app to have a worker process.

Create a file in the app directory called `worker.rb` with the following contents:

```ruby
for i in 0..5
    puts "Running a worker task..."
end
```

After building our app, we could run the resulting image with the `web` process (currently the default) or our new worker process. 

To enable running the worker process, we'll need to have our buildpack define a "process type" for the worker. Add the following to the end of your `build` script:

```bash
# Specify the worker process
printf '%s\n' '[[processes]]' 'type = "worker"' 'command = "bundle exec ruby worker.rb"' >> "$layersdir/launch.toml"
```

Your full `build` script should now look like the following:

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

# ========== ADDED ===========
# 7. SET DEFAULT START COMMAND
printf '%s\n' '[[processes]]' 'type = "web"' 'command = "bundle exec ruby app.rb"' > "$layersdir/launch.toml"
printf '%s\n' '[[processes]]' 'type = "worker"' 'command = "bundle exec ruby worker.rb"' >> "$layersdir/launch.toml"
```

Now if you rebuild your app using the updated buildpack:

```bash
pack build test-ruby-app --path ~/workspace/ruby-sample-app --buildpack ~/workspace/ruby-cnb
```

You should then be able to run your new Ruby worker process:

```bash
docker run --rm --entrypoint worker test-ruby-app
```

and see the worker log output:

```text
Running a worker task...
Running a worker task...
Running a worker task...
Running a worker task...
Running a worker task...
Running a worker task...
```

---

<a href="/docs/buildpack-author-guide/create-buildpack/caching" class="button bg-pink">Next Step</a>
