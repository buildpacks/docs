+++
title="Building blocks of a Cloud Native Buildpack"
weight=402
+++

<!-- test:suite=create-buildpack;weight=2 -->

Now we will set up the buildpack scaffolding. 

Let's create the directory where your buildpack will live:

<!-- test:exec -->
```bash
mkdir ruby-buildpack
```

### buildpack.toml

You will now need a `buildpack.toml` to describe our buildpack.

Create the `ruby-buildpack/buildpack.toml` file and copy the following into it:

<!-- test:file=ruby-buildpack/buildpack.toml -->
```toml
# Buildpack API version
api = "0.2"

# Buildpack ID and metadata
[buildpack]
id = "com.examples.buildpacks.ruby"
version = "0.0.1"
name = "Ruby Buildpack"

# Stacks that the buildpack will work with
[[stacks]]
id = "io.buildpacks.samples.stacks.bionic"
```

You will notice two specific fields in the file: `buildpack.id` and `stack.id`. The buildpack ID is the way you will reference the buildpack when you create buildpack groups, builders, etc. The stack ID is the root file system in which the buildpack will be run. This example can be run on one of two different stacks, both based upon Ubuntu Bionic.

### `detect` and `build`

Next you will need to create the `detect` and `build` scripts. These files must exist in a `bin` directory in your buildpack directory.

Create your `bin` directory and then change to that directory.

<!-- test:exec -->
```bash
mkdir ruby-buildpack/bin
```

Now create your `ruby-buildpack/bin/detect` file and copy in the following contents:

<!-- test:file=ruby-buildpack/bin/detect -->
```bash
#!/usr/bin/env bash
set -eo pipefail

exit 1
```

Now create your `ruby-buildpack/bin/build` and copy in the following contents:

<!-- test:file=ruby-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"
exit 1
```

You will need to make both of these files executable, so run the following command:

<!-- test:exec -->
```bash
chmod +x ruby-buildpack/bin/detect ruby-buildpack/bin/build
```

These two files are now executable `detect` and `build` scripts. You are now able to use this buildpack.

### Using your buildpack with `pack`

In order to test your buildpack, you will need to run the buildpack against your sample Ruby app using the `pack` CLI.

Set your default [builder][builder] by running the following:

<!-- test:exec -->
```bash
pack config default-builder cnbs/sample-builder:bionic
```

Then run the following `pack` command:

<!-- test:exec;exit-code=1 -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```

The `pack build` command takes in your Ruby sample app as the `--path` argument and your buildpack as the `--buildpack` argument.

After running the command, you should see that it failed to detect, as the `detect` script is currently written to simply error out.

<!-- test:assert=contains -->
```
===> DETECTING
[detector] err:  com.examples.buildpacks.ruby@0.0.1 (1)
[detector] ERROR: No buildpack groups passed detection.
[detector] ERROR: failed to detect: buildpack(s) failed with err
```

---

<a href="/docs/buildpack-author-guide/create-buildpack/detection" class="button bg-pink">Next Step</a>

[builder]: /docs/concepts/components/builder