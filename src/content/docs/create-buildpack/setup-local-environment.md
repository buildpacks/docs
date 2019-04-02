+++
title="Setup your local environment"
weight=401
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Danny Joyce"
lastmodifieremail = "djoyce@pivotal.io"
+++

First we will want to create a sample ruby app that you can use when developing the ruby cloud native buildpack

```
mkdir -p ~/workspace/ruby-sample-app
cd ~/workspace/ruby-sample-app
```

Create a file called `app.rb` with the following content:

```
require 'sinatra'

set :bind, '0.0.0.0'
set :port, 8080

get '/' do
  'Hello World!'
end
```

Create a `Gemfile` with the following content:
```
source "https://rubygems.org"

git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

gem "sinatra"
```

Next we want to create the directory where you will create your buildpack

```
mkdir -p ~/workspace/ruby-cnb
cd ~/workspace/ruby-cnb
```

Finally, make sure your local docker daemon is running by running the following command

```
docker version
```

Similar output should appear

```
Client: Docker Engine - Community
 Version:           18.09.2
 API version:       1.39
 Go version:        go1.10.8
 Git commit:        6247962
 Built:             Sun Feb 10 04:12:39 2019
 OS/Arch:           darwin/amd64
 Experimental:      false

Server: Docker Engine - Community
 Engine:
  Version:          18.09.2
  API version:      1.39 (minimum version 1.12)
  Go version:       go1.10.6
  Git commit:       6247962
  Built:            Sun Feb 10 04:13:06 2019
  OS/Arch:          linux/amd64
  Experimental:     true
```

---
