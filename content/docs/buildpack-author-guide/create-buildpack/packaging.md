+++
title="Packaging your buildpack for distribution"
weight=408
creatordisplayname = "Natalie Arellano"
creatoremail = "narellano@vmware.com"
lastmodifierdisplayname = "Natalie Arellano"
lastmodifieremail = "narellano@vmware.com"
+++

Buildpacks can be packaged as OCI images on an image registry or Docker daemon.

### package.toml
You will need to create a `package.toml` file to package your buildpack.

`cd ~/workspace`

Create the `package.toml` file and copy the following into it:

```toml
[buildpack]
uri = "./ruby-cnb/"
```

Package your buildpack:

`pack package-buildpack my-buildpack --package-config ./package.toml`

If you run `docker images`, you should see `my-buildpack` in the output. 

That's it! Your buildpack is now packaged for distribution.

---

## Going further

Now that you've finished your buildpack, how about extending it? Try:

- Caching the downloaded Ruby version
