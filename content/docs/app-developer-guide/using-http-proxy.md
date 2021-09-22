+++
title="Using Buildpacks with a Proxy"
weight=8
summary="Learn how to use buildpacks behind a HTTP proxy."
+++

Many university or corporate environments use a proxy to access HTTP and HTTPS resources on the web.  Proxies introduce two constraints on buildpack built applications:

1. `pack` needs to download buildpacks through the proxies, and
2. applications running in containers created by `pack` need to call APIs behind the proxy.

We show how to solve both of these constraints.

## Making `pack` Proxy Aware

You may need the `pack` command-line tool to download buildpacks and images via your proxy.  Building an application with an incorrectly configured proxy results in errors such as the following:

```console
$ pack build sample-app --path samples/apps/java-maven --builder cnbs/sample-builder:bionic
ERROR: failed to build: failed to fetch builder image 'index.docker.io/cnbs/sample-builder:bionic'
: Error response from daemon: Get "https//registry-1.docker.io/v2/": context deadline exceeded
```

The `pack` tool uses the Docker daemon to manage the local image registry on your machine.  The `pack` tool will ask the Docker daemon to download buildpacks and images for you.  Because of this relationship, between `pack` and the Docker daemon, we need to configure the Docker daemon to use a HTTP proxy.  The approach to setting the HTTP proxy depends on your platform:


### Docker Desktop (Windows and MacOS)
Docker's documetation states "Docker Desktop lets you configure HTTP/HTTPS Proxy Settings and automatically propagates these to Docker".  Set the system proxy using the [MacOS documentation](https://support.apple.com/en-gb/guide/mac-help/mchlp2591/mac) or [Windows documentation](https://www.dummies.com/computers/operating-systems/windows-10/how-to-set-up-a-proxy-in-windows-10/).  The system proxy settings will be used by Docker Desktop.

### Linux
The Docker project documents [how to configure configure the HTTP/HTTPS proxy](https://docs.docker.com/config/daemon/systemd/#httphttps-proxy) settings for the Docker daemon on Linux.  You should configure the `HTTP_PROXY` and `HTTPS_PROXY` environment variables as part of the Docker daemon startup.

## Proxy Settings for Buildpacks

Buildpacks may also need to be aware of your http and https proxies at build time.  For example python, java and nodejs buildpacks need to be aware of proxies in order to resolve dependencies.  To make buildpacks aware of proxies, export the `http_proxy` and `https_proxy` environment variables before invoking `pack`.  For example:

```console
export http_proxy=http://user:pass@my-proxy.example.com:3128
export https_proxy=https://my-proxy.example.com:3129
pack build sample-app --path samples/apps/java-maven --builder cnbs/sample-builder:bionic
```

## Making your Application Proxy Aware

Your application may need to use http or https proxies to access web-based APIs.  In order to make proxy settings available inside containers you should edit your `~/.docker/config.json` file (`%USERPROFILE%\.docker\config.json` on Windows) to contain the proxy information.  The `httpProxy`, `httpsProxy` and `noProxy` properties of this configuration file are injected into containers at build time and at run time as the `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` environment variables respectively.  Both the http and https proxy settings are also injected in their lower-case form as `http_proxy` and `https_proxy`.

```json
{
  "proxies": {
    "default": {
      "httpProxy":  "http://user:pass@my-proxy.example.com:3128",
      "httpsProxy": "https://my-proxy.example.com:3129",
      "noProxy":    "internal.mycorp.example.com"
    }
  }
}
```

If your application requires a http or https proxy, then you should prefer to read proxy information from the lower-case `http_proxy` and `https_proxy` variables.
