+++
title="Building app images with `build`"
weight=1
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
+++

`pack build` enables app developers to create runnable app images from source code using buildpacks.

```bash
$ pack build <image-name>
```

### Example: Building using the default builder image

In the following example, an app image is created from Node.js application source code.

```bash
$ cd /path/to/node/app
$ pack build my-app:my-tag

# ... Detect, analyze and build output

Successfully built 2452b4b1fce1
Successfully tagged my-app:my-tag
```

In this case, the default [builder](#working-with-builders-using-create-builder) is used, and an appropriate buildpack
is automatically selected from the builder based on the app source code. To understand more about what builders are and
how to create or use them, see the
[Working with builders using `create-builder`](#working-with-builders-using-create-builder) section.

To publish the produced image to an image registry, include the `--publish` flag:

```bash
$ pack build private-registry.example.com/my-app:my-tag --publish
```

### Example: Building using a specified buildpack

In the following example, an app image is created from Node.js application source code, using a buildpack chosen by the
user.

```bash
$ cd /path/to/node/app
$ pack build my-app:my-tag --buildpack path/to/some/buildpack

# ...
*** DETECTING WITH MANUALLY-PROVIDED GROUP:
2018/10/29 18:31:05 Group: Name Of Some Buildpack: pass
# ...

Successfully built 2452b4b1fce1
Successfully tagged my-app:my-tag
```

The message `DETECTING WITH MANUALLY-PROVIDED GROUP` indicates that the buildpack was chosen by the user, rather than
by the automated detection process.

The `--buildpack` parameter can be
- a path to a directory
- a path to a `.tgz` file
- a URL to a `.tgz` file, or
- the ID of a buildpack located in a builder

### Building explained

![build diagram](/docs/using-pack/build.svg)

To create an app image, `build` executes one or more buildpacks against the app's source code.
Each buildpack inspects the source code and provides relevant dependencies. An image is then generated
from the app's source code and these dependencies.

Buildpacks are compatible with one or more [stacks](#managing-stacks). A stack designates a **build image**
and a **run image**. During the build process, a stack's build image becomes the environment in which buildpacks are
executed, and its run image becomes the base for the final app image. For more information on working with stacks, see
the [Managing stacks](#managing-stacks) section.

Buildpacks can be bundled together with a specific stack's build image, resulting in a
[builder](#working-with-builders-using-create-builder) image (note the "er" ending). Builders provide the most
convenient way to distribute buildpacks for a given stack. For more information on working with builders, see the
[Working with builders using `create-builder`](#working-with-builders-using-create-builder) section.
