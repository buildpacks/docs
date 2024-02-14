+++
title="Launch"
weight=7
+++

The `launcher` is the entrypoint for the final OCI image, responsible for launching application processes.

<!--more-->

### Exit Codes

| Exit Code | Result                              |
|-----------|-------------------------------------|
| `11`      | Platform API incompatibility error  |
| `12`      | Buildpack API incompatibility error |
| `80-89`   | Launch-specific lifecycle errors    |
