+++
title="Building blocks of a Cloud Native Buildpack"
weight=402
+++

<!-- test:suite=create-buildpack;weight=2 -->

Now we will set up the buildpack scaffolding. 

Let's create the directory where your buildpack will live:

## Using the Pack CLI

The `buildpack new <id>` command will create a directory named for the buildpack ID.

Example:
<!-- test:exec -->
```bash
pack buildpack new examples/ruby \
    --api 0.6 \
    --path ruby-buildpack \
    --version 0.0.1 \
    --stacks io.buildpacks.samples.stacks.bionic
```
This command will create `ruby-buildpack` directory which contains `buildpack.toml`, `bin/build`,  `bin/detect` files.

### Additional Parameters
- `-a, --api` Buildpack API compatibility of the generated buildpack
- `-h, --help` Help for 'new'
- `--path` the location on the filesystem to generate the artifacts.
- `--stacks` Stack(s) this buildpack will be compatible with. Repeat for each stack in order, or supply once by comma-separated list
- `-V, --version` the version of the buildpack in buildpack.toml



### buildpack.toml

You will have `buildpack.toml` in your buildpack directory to describe our buildpack.

<!-- test:file=ruby-buildpack/buildpack.toml -->
```toml
# Buildpack API version
api = "0.6"

# Buildpack ID and metadata
[buildpack]
  id = "examples/ruby"
  version = "0.0.1"

# Stacks that the buildpack will work with
[[stacks]]
  id = "io.buildpacks.samples.stacks.bionic"

```

You will notice two specific fields in the file: `buildpack.id` and `stack.id`. The buildpack ID is the way you will reference the buildpack when you create buildpack groups, builders, etc. The stack ID is the root file system in which the buildpack will be run. This example can be run on one of two different stacks, both based upon Ubuntu Bionic.

### `detect` and `build`

Next, we will cover the `detect` and `build` scripts. These files are created in `bin` directory in your buildpack directory.


Now update your `ruby-buildpack/bin/detect` file and copy in the following contents:

<!-- test:file=ruby-buildpack/bin/detect -->
```bash
#!/usr/bin/env bash
set -eo pipefail

exit 1
```

Also update your `ruby-buildpack/bin/build` file and copy in the following contents:

<!-- test:file=ruby-buildpack/bin/build -->
```bash
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"
exit 1
```

These two files are executable `detect` and `build` scripts. You are now able to use this buildpack.

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
[detector] err:  examples/ruby@0.0.1 (1)
[detector] ERROR: No buildpack groups passed detection.
[detector] ERROR: failed to detect: buildpack(s) failed with err
```

---

<a href="/docs/buildpack-author-guide/create-buildpack/detection" class="button bg-pink">Next Step</a>

[builder]: /docs/concepts/components/builder