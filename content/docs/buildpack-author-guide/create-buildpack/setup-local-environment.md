+++
title="Set up your local environment"
weight=401
+++

First, we'll create a sample Ruby app that you can use when developing your buildpack:

```bash
mkdir ruby-sample-app
```

Create a file in the current directory called `ruby-sample-app/app.rb` with the following contents:

```ruby
require 'sinatra'

set :bind, '0.0.0.0'
set :port, 8080

get '/' do
  'Hello World!'
end
```

Then, create a file called `ruby-sample-app/Gemfile` with the following contents:

```ruby
source "https://rubygems.org"

git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

gem "sinatra"
```

Finally, make sure your local Docker daemon is running by executing:

```bash
docker version
```

If you see output similar to the following, you're good to go! Otherwise, start Docker and check again.

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

<a href="/docs/buildpack-author-guide/create-buildpack/building-blocks-cnb" class="button bg-pink">Next Step</a>