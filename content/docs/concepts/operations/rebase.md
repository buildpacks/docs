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

> Like [`build`](/docs/using-pack/building-app), `rebase` has a `--publish` flag. It will make the metadata change directly on the registry, without it the change happens on the daemon (which is actually slower, because the daemon is pretty inefficient for these types of operations).

### Example: Rebasing an app image

Consider an app image `my-app:my-tag` that was originally built using the default builder. That builder's stack has a
run image called `pack/run`. Running the following will update the base of `my-app:my-tag` with the latest version of
`pack/run`.

```bash
$ pack rebase my-app:my-tag
```

`rebase` has a `--publish` flag that can be used to publish the updated app image to a registry.
