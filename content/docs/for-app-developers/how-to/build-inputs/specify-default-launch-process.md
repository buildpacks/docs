+++
title="Specify the default launch process"
weight=99
summary="Buildpacks can define multiple processes for an application image. Specify which process should be the default."
+++

While buildpacks usually define the default process type for an application, end users may specify the desired default process.

To specify the default process:

* You first need to know what named process types might be contributed by the buildpacks in your build; for more information, see docs for [running the application][Run the application]
* Append the following flag to the `pack build` command:

```bash
pack build --default-process <process name> <image name>` # <process name> must be a valid process name
```

[Run the application]: https://buildpacks.io/docs/for-app-developers/how-to/build-outputs/specify-launch-process/
