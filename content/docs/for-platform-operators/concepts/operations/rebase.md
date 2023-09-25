+++
title="Rebase"
weight=2
summary="Rebase allows app developers or operators to rapidly update an app image when its stack's run image has changed."
aliases=[
    "/docs/using-pack/update-app-rebase/"
]
+++

### Rebasing explained

{{< param "summary" >}} By using image layer rebasing, this command avoids the need to fully rebuild the app.

![rebase diagram](/docs/concepts/operations/rebase.svg)

At its core, image rebasing is a simple process. By inspecting an app image, `rebase` can determine whether or not a
newer version of the app's base image exists (either locally or in a registry). If so, `rebase` updates the app image's
layer metadata to reference the newer base image version.

### Example: Rebasing an app image

Consider an app image `my-app:my-tag` that was originally built using the default builder. That builder's stack has a
run image called `pack/run`. Running the following will update the base of `my-app:my-tag` with the latest version of
`pack/run`.

```bash
$ pack rebase my-app:my-tag
```

> **TIP:** `pack rebase` has a `--publish` flag that can be used to publish the updated app image directly to a registry. 
> Using `--publish` is optimal when using a registry in comparison to the docker daemon.

[build]: /docs/app-developer-guide/build-an-app/