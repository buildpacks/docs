+++
title="Specify the default launch process"
weight=99
summary="Buildpacks can define multiple processes for an application image. Specify which process should be the default."
+++

Buildpacks usually define the default process type for an application, while retaining the ability for a user to specify their desired default process.

To configure the `build` to work differently from the default behavior:

* You first need to know what processes would be contributed by the buildpacks running in your build.
* Once known, you can append the following flag to the `pack build` command

```bash
pack build --default-process <process name> <image name>` # <process name> must be a valid process name in launch.toml
```

If this flag is not provided by the user, `pack` will provide the process type as `web` to the `lifecycle`.

>As an app developer, you can specify the default process for an application. However, buildpacks-built images can contain multiple process types, to see how to invoke each one, see the [Run the application] page.

[Run the application]: https://buildpacks.io/docs/for-app-developers/how-to/build-outputs/specify-launch-process/
