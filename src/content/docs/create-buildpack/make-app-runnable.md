+++
title="Make your application runnable"
weight=405
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Danny Joyce"
lastmodifieremail = "djoyce@pivotal.io"
+++

Next we want to set a default start command for the application in the image.  You will want to add the following code to then end of your `build` script. 

```
# Set default start command
echo 'processes = [{ type = "web", command = ""bundle exec ruby app.rb""}]' > "$layersdir/launch.toml"
```

This sets your default start command.

Your full `build` script should now look like this

```
#!/usr/bin/env bash
set -eo pipefail

# Set the layersdir variable to be the first argument from the build lifecycle
layersdir=$1

echo "---> Ruby Buildpack" 

echo "---> Downloading and extracting ruby"
mkdir -p $layersdir/ruby
echo -e 'launch = true' > $layersdir/ruby.toml

ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$layersdir/ruby"

# Make ruby accessible in this script
export PATH=$layersdir/ruby/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$layersdir/ruby/lib

echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

echo "---> Installing gems"
bundle install

# Set default start command
echo 'processes = [{ type = "web", command = "bundle exec ruby app.rb"}]' > "$layersdir/launch.toml"
```

Now you will rebuild your app using the updated buildpack with the launch command

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

And when you run `docker run -p 8080:8080 test-ruby-app` you should see you the server logs

```
[2019-04-02 18:04:48] INFO  WEBrick 1.4.2
[2019-04-02 18:04:48] INFO  ruby 2.5.1 (2018-03-29) [x86_64-linux]
== Sinatra (v2.0.5) has taken the stage on 8080 for development with backup from WEBrick
[2019-04-02 18:04:48] INFO  WEBrick::HTTPServer#start: pid=1 port=8080
```

You should also be able to access the app via your web browser at `localhost:8080`.

---
