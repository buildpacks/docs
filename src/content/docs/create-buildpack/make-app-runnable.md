+++
title="Make your application runnable"
weight=7
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
+++

Next we want to set a default start command for the application in the image.  You will want to add the following code to then end of your build script. 

```
# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080 --host 0.0.0.0"}]' > "$launchdir/launch.toml"
```

This sets your default start command.

Your full build script should now look like this

```
#!/usr/bin/env bash
set -eo pipefail
# Set the launchdir variable to be the third argument from the build lifecycle
launchdir=$3 

echo "---> Ruby Buildpack" 

echo "---> Downloading and extracting ruby"
mkdir -p $launchdir/ruby
touch $launchdir/ruby.toml

ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$launchdir/ruby"


# Make ruby and bundler accessible in this script
export PATH=$PATH:$launchdir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$launchdir/ruby/lib

echo "---> Installing bundler"
gem install bundler

echo "---> Installing gems"
bundle install

# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080 --host 0.0.0.0"}]' > "$launchdir/launch.toml"
```

Now you will rebuild your app using the updated buildpack with the launch command

```
pack build test-ruby-app --buildpack workspace/ruby-cnb  --path workspace/ruby-sample-app/
```

And when you run `docker run -p 8080:8080 test-ruby-app` you should see you the WEBRICK webserver startup

```
[2018-10-17 15:05:38] INFO  WEBrick 1.4.2
[2018-10-17 15:05:38] INFO  ruby 2.5.1 (2018-03-29) [x86_64-linux]
[2018-10-17 15:05:38] INFO  WEBrick::HTTPServer#start: pid=1 port=8080
```

You should also be able to access the app via your web browser at `localhost:8080`.

---
