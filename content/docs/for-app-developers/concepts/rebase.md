
+++
title="What happens during rebase?"
aliases=[
  "/docs/concepts/operations/rebase",
  "/docs/using-pack/update-app-rebase/"
]
weight=4
+++

`Rebase` allows app developers or operators to rapidly update an app image when its [runtime base image] has changed.

<!--more-->

### Rebasing explained

By using image layer rebasing, this command avoids the need to fully rebuild the app.

![rebase diagram](/images/rebase.svg)

At its core, image rebasing is a simple process. By inspecting an app image, `rebase` can determine whether or not a
newer version of the app's base image exists (either locally or in a registry).
If so, `rebase` updates the app image's layer metadata to reference the newer base image version.

### Example: Rebasing an app image

Consider an app image `registry.example.com/example/my-app:my-tag` that was originally built using the default builder.
That builder has a reference to a run image called `registry.example.com/example/run`.
Running the following will update the base of `registry.example.com/example/my-app:my-tag` with the latest version of
`registry.example.com/example/run`.

```bash
$ pack rebase registry.example.com/example/my-app:my-tag
```

> **TIP:** `pack rebase` has a `--publish` flag that can be used to publish the updated app image directly to a registry. 
> Using `--publish` is optimal when using a registry in comparison to the docker daemon.

[runtime base image]: /docs/for-app-developers/concepts/base-images/run/
