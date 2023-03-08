+++
title="Set up your local environment"
weight=401
+++

<!-- test:suite=create-buildpack;weight=1 -->

<!-- test:setup:exec;exit-code=-1 -->
<!--
```bash
docker rmi test-ruby-app
pack config trusted-builders add cnbs/sample-builder:bionic
```
-->

<!-- test:teardown:exec -->
<!--
```bash
docker rmi test-ruby-app
```
-->

First, we'll create a sample Ruby app that you can use when developing your buildpack:

<!-- test:exec -->
```bash
mkdir ruby-sample-app
```
<!--+- "{{execute}}"+-->

Create a file in the current directory called `ruby-sample-app/app.rb`<!--+"{{open}}"+--> with the following contents:

<!-- test:file=ruby-sample-app/app.rb -->
```ruby
require 'sinatra'

set :bind, '0.0.0.0'
set :port, 8080

get '/' do
  'Hello World!'
end
```

Then, create a file called `ruby-sample-app/Gemfile`<!--+"{{open}}"+--> with the following contents:

<!-- test:file=ruby-sample-app/Gemfile -->
```ruby
source 'https://rubygems.org'

git_source(:github) {|repo_name| "https://github.com/#{repo_name}" }

gem 'sinatra'
gem 'webrick'
```

Finally, make sure your local Docker daemon is running by executing:

<!-- test:exec -->
```bash
docker version
```
<!--+- "{{execute}}"+-->

If you see output similar to the following, you're good to go! Otherwise, start Docker and check again.

```
Client: Docker Engine - Community
 Version:           20.10.9
 API version:       1.41
 Go version:        go1.16.8
 Git commit:        c2ea9bc
 Built:             Mon Oct  4 16:08:29 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server: Docker Engine - Community
 Engine:
  Version:          20.10.9
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.16.8
  Git commit:       79ea9d3
  Built:            Mon Oct  4 16:06:34 2021
  OS/Arch:          linux/amd64
  Experimental:     false
```

<!--+ if false +-->
---

<a href="/docs/buildpack-author-guide/create-buildpack/building-blocks-cnb" class="button bg-pink">Next Step</a>
<!--+ end+-->