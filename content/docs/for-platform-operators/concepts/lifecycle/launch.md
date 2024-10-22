+++
title="Launch"
weight=7
+++

The `launcher` is the entrypoint for the final OCI image, responsible for launching application processes.

<!--more-->

### Exit Codes

If the `launcher` errors before executing the process, it will have one of the following error codes:

| Exit Code | Result                              |
|-----------|-------------------------------------|
| `11`      | Platform API incompatibility error  |
| `12`      | Buildpack API incompatibility error |
| `80-89`   | Launch-specific lifecycle errors    |

Otherwise, the exit code shall be the exit code of the launched process.

***

For more information about the `launcher`, see the [Platform API spec](https://github.com/buildpacks/spec/blob/main/platform.md#launcher).
