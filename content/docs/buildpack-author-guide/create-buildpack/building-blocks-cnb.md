
+++
title="Building blocks of a Cloud Native Buildpack"
weight=402
+++

Now we will set up the buildpack scaffolding. You will need to make these files in your `ruby-cnb` directory

```bash
cd ~/workspace/ruby-cnb
```

### buildpack.toml
Once you are in the `ruby-cnb` directory, you will need to create a `buildpack.toml` file in that directory. This file must exist in the root directory of your buildpack so the `pack` CLI knows it is a buildpack and it can apply the build lifecycle to it.

Create the `buildpack.toml` file and copy the following into it:

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

```bash
mkdir bin
cd bin
```

Now create your `detect` file in the `bin` directory and copy in the following contents:

```bash
#!/usr/bin/env bash
set -eo pipefail

exit 1
```

Now create your `build` file in the `bin` directory and copy in the following contents:

```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"
exit 1
```

You will need to make both of these files executable, so run the following command:

```bash
chmod +x detect build
```

These two files are now executable `detect` and `build` scripts. Now you can use your buildpack.

### Using your buildpack with `pack`

In order to test your buildpack, you will need to run the buildpack against your sample Ruby app using the `pack` CLI.

Set your default [builder][builder] by running the following:

```bash
pack set-default-builder cnbs/sample-builder:bionic
```

Then run the following `pack` command:

```bash
pack build test-ruby-app --path ~/workspace/ruby-sample-app --buildpack ~/workspace/ruby-cnb
```

The `pack build` command takes in your Ruby sample app as the `--path` argument and your buildpack as the `--buildpack` argument.

After running the command, you should see that it failed to detect, as the `detect` script is currently written to simply error out.

```
===> DETECTING
[detector] ERROR: No buildpack groups passed detection.
[detector] ERROR: Please check that you are running against the correct path.
[detector] ERROR: failed to detect: no buildpacks participating
```

---

<a href="/docs/buildpack-author-guide/create-buildpack/detection" class="button bg-pink">Next Step</a>

[builder]: /docs/concepts/components/builder