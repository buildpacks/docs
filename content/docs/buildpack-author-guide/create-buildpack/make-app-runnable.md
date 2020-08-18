+++
title="Make your application runnable"
weight=405
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Javier Romero"
lastmodifieremail = "jromero@pivotal.io"
+++

To make your app runnable, we need to set a default start command. Add the following to the end of your `build` script:

```bash
# Set default start command
printf '%s\n' '[[processes]]' 'type = "web"' 'command = "bundle exec ruby app.rb"' > "$layersdir/launch.toml"
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
```

Then rebuild your app using the updated buildpack:

```bash
pack build test-ruby-app --path ~/workspace/ruby-sample-app --buildpack ~/workspace/ruby-cnb
```

You should then be able to run your new Ruby app:
 
```bash
docker run --rm -p 8080:8080 test-ruby-app
```

and see the server log output:

```text
[2019-04-02 18:04:48] INFO  WEBrick 1.4.2
[2019-04-02 18:04:48] INFO  ruby 2.5.1 (2018-03-29) [x86_64-linux]
== Sinatra (v2.0.5) has taken the stage on 8080 for development with backup from WEBrick
[2019-04-02 18:04:48] INFO  WEBrick::HTTPServer#start: pid=1 port=8080
```

Test it out by navigating to [localhost:8080](http://localhost:8080) in your favorite browser!

---

<a href="/docs/buildpack-author-guide/create-buildpack/specify-multiple-process-types" class="button bg-pink">Next Step</a>
