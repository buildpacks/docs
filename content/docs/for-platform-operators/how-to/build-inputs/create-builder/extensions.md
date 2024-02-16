
+++
title="Specify an image extension in a builder"
aliases=[
  "/docs/extension-guide/consume-extension/in-builder"
]
weight=101
+++

If you are using extensions, here is how to include them in a builder.

<!--more-->

You're pretty sharp, and you know what your buildpack users will need.

That's why you're going to add something similar to the following lines directly to `builder.toml`:

```
[[order-extensions]]
[[order-extensions.group]]
id = "foo"
version = "0.0.1"

[[extensions]]
id = "foo"
version = "0.0.1"
uri = "/local/path/to/extension/foo" # can be relative or absolute
```
