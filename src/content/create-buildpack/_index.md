+++

title="Creating a Cloud Native Buildpack"
weight=2
type="page"
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
alwaysopen=true

+++


This is a step by step tutorial for creating a Ruby Cloud Native Buildpack. 

Before we get started make sure you have the following installed on your system 

- [Docker Community Edition](https://store.docker.com/search?type=edition&offering=community)
- [pack](https://github.com/buildpack/pack/releases)   

### Setup Your Local Environment

First we will want to clone a sample ruby app that you can use when developing the ruby cloud native buildpack

```
cd ~
git clone <path to sample ruby app>
```

Next we want to create the directory where you will create your buildpack

```
mkdir ~/ruby-cnb
```

Finally, make sure your local docker daemon is running by running the following command

```
docker version
```

The following output should appear

```
Client:
 Version:           18.06.1-ce
 API version:       1.38
 Go version:        go1.10.3
 Git commit:        e68fc7a
 Built:             Tue Aug 21 17:21:31 2018
 OS/Arch:           darwin/amd64
 Experimental:      false

Server:
 Engine:
  Version:          18.06.1-ce
  API version:      1.38 (minimum version 1.12)
  Go version:       go1.10.3
  Git commit:       e68fc7a
  Built:            Tue Aug 21 17:29:02 2018
  OS/Arch:          linux/amd64
  Experimental:     true
```


### Create the Building Blocks of a Cloud Native Buildpack 

Now we will setup the buildpack scaffolding. You will need to make these files in your `ruby-cnb` directory

```
cd ~/ruby-cnb
```

#### buildpack.toml
Once you are in the directory. You will need to create a `buildpack.toml` file in that directory. This file must exist in the root directory of your buildpack so the `pack` cli knows it is a buildpack and it can apply the build lifecycle to it.  

Create the `buildpack.toml` file and copy the following into it 

```
#Buidpack ID and metadata
[buildpack]
id = "com.examples.buildpacks.ruby"
version = "0.0.1"
name = "Ruby Buildpack"

#Stack the buildpack will work with
[[stacks]]
id = ["io.buildpacks.stacks.bionic"]

```

You will notice two specific fields in the file: buildpack ID and stack ID. The buildpack ID is the way you will reference the buildpack when you create buildpack groups, builders, etc.  The stack ID is the root file system in which the buildpack will be built.  This example is bulit on ubuntu bionic.

---
#### Detect and Build 

Next you will need to create the detect and build scripts.  These files must exist in a `bin` directory in your buildpack directory.

Create your `bin` directory and the change to that directory.

```
mkdir bin
cd bin
```

Now create your `detect` file in the `bin` directory and copy in the following content

```
#!/usr/bin/env bash
set -eo pipefail

exit 1
```

Now create your `build` file in the `bin` directory and copy in the following content

```
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"
exit 1
```

You will need to make both of these files executable, so run the following command.

```
chmod +x detect build
```

These two files are now executable detect and build scripts.  Now you can run your use your buildpack.

---
#### Using your buildpack with pack

In order to test your buildpack, you will need to run the buildpack against your sample ruby app using the `pack` cli.

Run the following pack command

```
pack build test-ruby-app --buildpack ~/ruby-cnb --path ~/ruby-sample-app 
```

The `pack build` command takes in your buildpack directory as the `--buildpack` argument and the ruby sample app as the `--path` argument

After successfully running the command you should see the following output. You should see that it failed to detect because the detect script was setup to fail 

```
2018/10/16 09:59:00 Selected run image 'packs/run' from stack 'io.buildpacks.stacks.bionic'
*** DETECTING:
2018/10/16 14:59:04 Group: Ruby Buildpack: error (1)
2018/10/16 14:59:04 Error: failed to detect
Error: run detect container: failed with status code: 6
```

### Detecting Your Ruby App

Next you will want to actually detect that the app your are building is a ruby app. In order to do this you will need to check for a Gemfile.

Replace `exit 1` with the following check in your detect script

```
if [[ ! -f Gemfile ]]; then
   exit 100
fi
```
And now your detect script will look like this

```
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi
```

---

Next, rebuild your app with your updated buildpack

```
pack build test-ruby-app --buildpack ~/ruby-cnb  --path ~/ruby-sample-app/ 
```

You will see the following output

```
2018/10/16 10:16:36 Selected run image 'packs/run' from stack 'io.buildpacks.stacks.bionic'
*** DETECTING:
2018/10/16 15:16:40 Group: Ruby Buildpack: pass
*** ANALYZING: Reading information from previous image for possible re-use
2018/10/16 10:16:41 WARNING: skipping analyze, image not found
*** BUILDING:
---> Ruby Buildpack
2018/10/16 15:16:42 Error: failed to : exit status 1
Error: failed with status code: 7
```

Notice that `detect` now passes because there is a valid Gemfile in the ruby app at `~/ruby-sample-app`, but now `build` fails because it is coded to do so.

You will also notice `ANALYZE` now appears in the build output.  This step is part of the buildpack lifecycle that looks to see if any previous image builds have layers that the buildpack can re-use. We will get into this topic in more detail later.



### Building Your Ruby App

Next we will make the build step work.  This will a few updates to the build script.

We need to read the launch directory passed in by build lifecycle - learn more about the lifecycle [here](https://github.com/buildpack/lifecycle)

```
launchdir=$3 
```

We need to create a ruby layer in the image

```
mkdir -p $launchdir/ruby
touch $launchdir/ruby.toml
```

We will need to download ruby

```
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-2.5.1.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$launchdir/ruby"
```

We will need to download bundler

```
bundler_url=https://buildpacks.cloudfoundry.org/dependencies/bundler/bundler-1.16.6-any-stack-77354698.tgz
mkdir -p $launchdir/bundler
wget -q -O - "$bundler_url" | tar -xzf - -C "$launchdir/bundler"
```

Finalluy, we will need to install bundle and then run bundle install

```
gem install bundler
bundle install
```


Your build script will now look like this

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
```

---

Now if you build your app again 

```
pack build test-ruby-app --buildpack ~/ruby-cnb  --path ~/ruby-sample-app/ 
```

You will see the following output

```
2018/10/16 14:20:47 Selected run image 'packs/run' from stack 'io.buildpacks.stacks.bionic'
*** DETECTING:
2018/10/16 19:20:49 Group: Ruby Buildpack: pass
*** ANALYZING: Reading information from previous image for possible re-use
2018/10/16 14:20:50 WARNING: skipping analyze, image not found
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby
---> Installing bundler
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 3 seconds
1 gem installed
---> Installing gems
Fetching gem metadata from https://rubygems.org/..............
Using bundler 1.16.6
Fetching rack 2.0.5
Installing rack 2.0.5
Fetching roda 3.13.0
Installing roda 3.13.0
Bundle complete! 1 Gemfile dependency, 3 gems now installed.
Use `bundle info [gemname]` to see where a bundled gem is installed.
```
After building the ruby app, the buildpack now creates a docker file based on the output of build and then runs it

```

*** EXPORTING:
Step 1/4 : FROM packs/run *** This is the run image from your stack ***
---> aebbb14d9529
Step 2/4 : ADD --chown=pack:pack /workspace/app /workspace/app  *** This is the app ***
---> f248b539eb0b
Step 3/4 : ADD --chown=pack:pack /workspace/config /workspace/config ** Metadata for runtime **
---> 74fb93aaa030
Step 4/4 : ADD --chown=pack:pack  /workspace/io.buildpacks.samples.ruby/ruby /workspace/io.buildpacks.samples.ruby/ruby *** This is the ruby interpreter that the buildpack placed as a layer ***
---> 3d096514cf24
---> 3d096514cf24
Successfully built 3d096514cf24
Successfully tagged test-ruby-app:latest
Step 1/2 : FROM test-ruby-app  *** Set metadata labels of the image ***
---> 3d096514cf24
Step 2/2 : LABEL io.buildpacks.lifecycle.metadata='{"app":{"name":"","sha":"sha256:1e13e329d407844821c3aa5bd22d74feb5cae32af5aa85c82b5271a20e51615d"},"config":{"sha":"sha256:45f0d1cb7eee98d807a7932b4fcf8a5c0c5b2c1aad0a223994922d68885457ad"},"buildpacks":[{"key":"io.buildpacks.samples.ruby","name":"","layers":{"ruby":{"sha":"sha256:f5fa2b809b8847000234da59c2f346e066736efbcd5a84ffddf02993b0fd23e9","data":{}}}}],"runimage":{"name":"packs/run","sha":"sha256:2ace261ebe9f5936ea72b6290019cda476db6a0b3a4d5d64039c61b45e46091f"}}'
---> Running in 49bca3c53f9f
---> af8d138f6c96
---> af8d138f6c96
Successfully built af8d138f6c96
Successfully tagged test-ruby-app:latest
```

### Making the Application Runnable

Next we want to set a default start command for the application in the image.  You will want to add the following code to then end of your build script. 

```
# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080 -o 0.0.0.0"}]' > "$launchdir/launch.toml"
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
echo 'processes = [{ type = "web", command = "rackup -p 8080 -o 0.0.0.0"}]' > "$launchdir/launch.toml"
```

Now you will rebuild your app using the updated buildpack with the launch command

```
pack build test-ruby-app --buildpack ~/ruby-cnb  --path ~/ruby-sample-app/ 
```

And when you run `docker run -p 8080:8080 test-ruby-app` you should see you the WEBRICK webserver startup

```
[2018-10-17 15:05:38] INFO  WEBrick 1.4.2
[2018-10-17 15:05:38] INFO  ruby 2.5.1 (2018-03-29) [x86_64-linux]
[2018-10-17 15:05:38] INFO  WEBrick::HTTPServer#start: pid=1 port=8080
```

And you should be able to access the app via your web browser at `localhost:8080`

### Improving Buildpack Performance Through Caching

Next we want to separate the ruby interpreter and bundled gems into different layers.  This will allows us to cache the ruby layer and gem dependency layer separate, which help speed up builds.

To do this replace the line

```
echo "---> Installing gems"
bundle install
```

With the following

```
echo "---> Installing gems"
mkdir "$launchdir/bundler"
touch "$launchdir/bundler.toml"

bundle install --path "$launchdir/bundler" --binstubs "$launchdir/bundler/bin"
```

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
mkdir "$launchdir/bundler"
touch "$launchdir/bundler.toml"

bundle install --path "$launchdir/bundler" --binstubs "$launchdir/bundler/bin"


# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080 -o 0.0.0.0"}]' > "$launchdir/launch.toml"
```

Now when we run 

```
pack build test-ruby-app --buildpack ~/ruby-cnb  --path ~/ruby-sample-app/
```

You will see the following change during EXPORT

```
*** EXPORTING:
Step 1/5 : FROM packs/run
---> aebbb14d9529
Step 2/5 : ADD --chown=pack:pack /workspace/app /workspace/app
---> 218f662e7424
Step 3/5 : ADD --chown=pack:pack /workspace/config /workspace/config
---> 822b4af62763
Step 4/5 : ADD --chown=pack:pack /workspace/io.buildpacks.samples.ruby/bundler /workspace/io.buildpacks.samples.ruby/bundler  *** Added bundler layer ***
---> 6312ef1f72db
Step 5/5 : ADD --chown=pack:pack /workspace/io.buildpacks.samples.ruby/ruby /workspace/io.buildpacks.samples.ruby/ruby *** Added ruby layer ***
---> f30822d0d3e0
---> f30822d0d3e0
Successfully built f30822d0d3e0
Successfully tagged test-ruby-app:latest
Step 1/2 : FROM test-ruby-app
---> f30822d0d3e0
Step 2/2 : LABEL io.buildpacks.lifecycle.metadata='{"app":{"name":"","sha":"sha256:b6cf193d1e24768b5e6fedba9165156fc47ac68249549a079ab9611e546ed641"},"config":{"sha":"sha256:8a5961cc7bfdf64565631a31a6b70111bf65ac981f52ede8c6a5dca118f7fdc3"},"buildpacks":[{"key":"io.buildpacks.samples.ruby","name":"","layers":{"bundler":{"sha":"sha256:24b55bd13e0f34511639ccc3d9f8931f0a4a6d0206f51bce2af74822a9481975","data":{}},"ruby":{"sha":"sha256:56a9193f461c09ee566c5cece64cb3e1f0c87f8d95f1c0029ab8fbcf5208c71b","data":{}}}}],"runimage":{"name":"packs/run","sha":"sha256:2ace261ebe9f5936ea72b6290019cda476db6a0b3a4d5d64039c61b45e46091f"}}'
---> Running in b3b7cc1eafa0
---> d66d877f6442
---> d66d877f6442
Successfully built d66d877f6442
Successfully tagged test-ruby-app:latest
```

Next we will start caching gem dependencies to help speed up the build if no new dependencies are needed

Replace the bundle logic from the previous step

```
echo "---> Installing gems"
mkdir "$launchdir/bundler"
touch "$launchdir/bundler.toml"

bundle install --path "$launchdir/bundler" --binstubs "$launchdir/bundler/bin"
```
With this new logic that checks to see if any gems have been changed


```
### START BUNDLER LAYER
#Create a checksum for the Gemfile.lock to determine if Gemfile.lock has changed
local_bundler_checksum=$(md5sum Gemfile.lock | cut -d' ' -f1)
#Gets the checksum for the previous images Gemfile.lock
if [[ -f $launchdir/bundler.toml ]]; then
    remote_bundler_checksum=$(cat "$launchdir/bundler.toml" | yj -t | jq -r .lock_checksum)
fi

#Compares previous Gemfile.lock checksum to the current Gemfile.lock
if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    #Determine no gem depencencies have changed, so can reuse existing gems without running bundle install
	echo "---> Reusing gems"
else
	#Determine there has been a gem dependency change and will create a new version of the bundler layer to install new gems
    echo "---> Installing gems"
    mkdir "$launchdir/bundler"
    echo "lock_checksum = \"$local_bundler_checksum\"" > "$launchdir/bundler.toml"
    bundle install --path "$launchdir/bundler" --binstubs "$launchdir/bundler/bin"
fi
### END BUNDLER LAYER
```

Your full build script will now look like this 

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

### START BUNDLER LAYER
#Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) remote_bundler_checksum=$(cat "$launchdir/bundler.toml" | yj -t | jq -r .lock_checksum 2>/dev/null || echo 'not found')
if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum && $reused_ruby == 'true' ]] ; then
    #Determine no gem depencencies have changed, so can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$launchdir/bundler" >/dev/null 
    bundle config --local bin "$launchdir/bundler/bin" >/dev/null 
else
    #Determine there has been a gem dependency change and will create a new version of the bundler layer to install new gems
    echo "---> Installing gems"
    mkdir "$launchdir/bundler"
    echo "lock_checksum = \"$local_bundler_checksum\"" > "$launchdir/bundler.toml"
    bundle install --path "$launchdir/bundler" --binstubs "$launchdir/bundler/bin"
fi
### END BUNDLER LAYER


# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080 -o 0.0.0.0"}]' > "$launchdir/launch.toml"
```

And if you run 

`pack build test-ruby-app --buildpack ~/Dev/cnb/ruby-cnb  --path ~/Dev/ruby-sample-app/`

it will build your app and generate the Gemfile checksum for the first time and store it in the image

And now if you run the command again

`pack build test-ruby-app --buildpack ~/Dev/cnb/ruby-cnb  --path ~/Dev/ruby-sample-app/` 

you will see the new caching logic work

```
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby
---> Installing bundler
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 2 seconds
1 gem installed
---> Reusing gems  *** Gems were successfully cached ***

```

 Now we will add the logic to cache the ruby interpreter to speed up build times if a new version of ruby s not needed

First we need to capture the cache directory from the build lifecycle. 

```
cachedir=$2
```

Next we will set a desired ruby version that we will support as a variable, in this instance ruby 2.5.1 

```
ruby_version=2.5.1
```

Next we will update our ruby paths inside the script to point to the cachedir instead of the launchdir

```
export PATH=$PATH:$cachedir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$cachedir/ruby/lib
```

Next we will add the ruby caching logic that checks to see if ruby has been successfully cached with the correct version

This logic checks to see if version cached version captured in ruby.toml matches the desired version defined in the ruby_version variable

If it is the same - it reuses the cached version, if it is not (or does not exist) it will download and cache the correct version

```
if [[ $ruby_version == $([[ -f $cachedir/ruby.toml ]] && cat "$cachedir/ruby.toml" | yj -t | jq -r .version) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby"
    rm -rf $cachedir/ruby
    mkdir -p $cachedir/ruby
    echo "version = \"$ruby_version\"" > "$cachedir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$cachedir/ruby"
    echo "---> Installing bundler"
    gem install bundler
fi
```

Next we check to see if the desired version of ruby matches the previous images version of ruby in the `$launchdir`. If it is the same, it is reused, if it is not it is copied to the `$launchdir` from the `$cachedir`

```
if [[ $ruby_version == $([[ -f $launchdir/ruby.toml ]] && cat "$launchdir/ruby.toml" | yj -t | jq -r .version) ]] ; then
    echo "---> Reusing ruby layer"
else
    echo "---> Adding ruby layer"
    cp $cachedir/ruby.toml $launchdir/ruby.toml
    cp -r $cachedir/ruby $launchdir/ruby
fi
```

Now your full build script will look like this

```
#!/usr/bin/env bash
set -eo pipefail
# Set the launchdir variable to be the third argument from the build lifecycle
cachedir=$2
launchdir=$3
echo "---> Ruby Buildpack"
ruby_version=2.5.1
# Make ruby and bundler accessible in this script
export PATH=$PATH:$cachedir/ruby/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}$cachedir/ruby/lib
if [[ $ruby_version == $([[ -f $cachedir/ruby.toml ]] && cat "$cachedir/ruby.toml" | yj -t | jq -r .version) ]] ; then
    echo "---> Reusing ruby $ruby_version"
else
    echo "---> Downloading and extracting ruby - $ruby_version"
    rm -rf $cachedir/ruby
    mkdir -p $cachedir/ruby
    echo "version = \"$ruby_version\"" > "$cachedir/ruby.toml"
    ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
    wget -q -O - "$ruby_url" | tar -xzf - -C "$cachedir/ruby"
    echo "---> Installing bundler"
    gem install bundler
fi
if [[ $ruby_version == $([[ -f $launchdir/ruby.toml ]] && cat "$launchdir/ruby.toml" | yj -t | jq -r .version) ]] ; then
    echo "---> Reusing ruby layer"
else
    echo "---> Adding ruby layer"
    cp $cachedir/ruby.toml $launchdir/ruby.toml
    cp -r $cachedir/ruby $launchdir/ruby
fi

### START BUNDLER LAYER
#Compares previous Gemfile.lock checksum to the current Gemfile.lock
local_bundler_checksum=$(sha256sum Gemfile.lock | cut -d ' ' -f 1) 
remote_bundler_checksum=$(cat "$launchdir/bundler.toml" | yj -t | jq -r .lock_checksum 2>/dev/null || echo 'not found') 
if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum && $reused_ruby == 'true' ]] ; then
    #Determine no gem depencencies have changed, so can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$launchdir/bundler" >/dev/null 
    bundle config --local bin "$launchdir/bundler/bin" >/dev/null
else
    #Determine there has been a gem dependency change and will create a new version of the bundler layer to install new gems
    echo "---> Installing gems"
    mkdir "$launchdir/bundler"
    echo "lock_checksum = \"$local_bundler_checksum\"" > "$launchdir/bundler.toml"
    bundle install --path "$launchdir/bundler" --binstubs "$launchdir/bundler/bin"
fi
### END BUNDLER LAYER


# Set default start command
echo 'processes = [{ type = "web", command = "rackup -p 8080"}]' > "$launchdir/launch.toml"
```

Now when you run 

```
pack build test-ruby-app --buildpack ~/Dev/cnb/ruby-cnb  --path ~/Dev/ruby-sample-app/
```

You will noticed that the ruby layer is being added to the cache and then added to the launch directory

```
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby  *** Downloads Ruby ***
---> Installing bundler
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 2 seconds
1 gem installed
---> Adding ruby layer  *** Adding ruby to launch directory from cache ***
---> Reusing gems
```

If you rebuild your app with the cached version of ruby using 

```
pack build test-ruby-app --buildpack ~/Dev/cnb/ruby-cnb  --path ~/Dev/ruby-sample-app/
```

You will now see the build is using the cached version of ruby 

```
*** BUILDING:
---> Ruby Buildpack
---> Reusing ruby 2.5.1 *** Reusing cached ruby ***
---> Reusing ruby layer *** Reusing the ruby launch layer ***
---> Reusing gems
```
Next we will update the detect script to check for a specific version of ruby that the user has defined in their application via a `.ruby-version` file

Append the following version check to the end of your detect script

```
version=2.5.1
if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi
echo "ruby = { version = \"$version\" }"
```

Your full script will now look like this

```
#!/usr/bin/env bash
set -eo pipefail

if [[ ! -f Gemfile ]]; then
   exit 100
fi


version=2.5.1
if [[ -f .ruby-version ]]; then
    version=$(cat .ruby-version | tr -d '[:space:]')
fi
echo "ruby = { version = \"$version\" }"
```

Then you will need to update your build script to look for this version from the detect script

Replace 

```
ruby_version=2.5.1 
```

With this

```
ruby_version=$(yj -t | jq -r .ruby.version)
```


Now in your ruby app - create a file named `.ruby-version` and add the following line to it

```
2.5.0
```


Now when run

```
pack build test-ruby-app --buildpack ~/Dev/cnb/ruby-cnb  --path ~/Dev/ruby-sample-app/
```

You will see the new ruby version downloaded and installed

```
*** BUILDING:
---> Ruby Buildpack
---> Downloading and extracting ruby - 2.5.0
---> Installing bundler
Successfully installed bundler-1.16.6
Parsing documentation for bundler-1.16.6
Installing ri documentation for bundler-1.16.6
Done installing documentation for bundler after 3 seconds
1 gem installed
---> Adding ruby layer
---> Reusing gems
```

That's it!  You've created your first buildpack.

There are a handful of advanced concepts we will cover in other articles. Specifically :

- Adding your buildpack to a builder
- TBD