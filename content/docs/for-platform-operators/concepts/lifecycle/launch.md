+++
title="Launch"
weight=7
summary="The entrypoint for the final OCI image. Responsible for launching application processes."
+++

{{< param "summary" >}}

### Exit Codes

| Exit Code | Result|
|-----------|-------|
| `11`      | Platform API incompatibility error
| `12`      | Buildpack API incompatibility error
| `80-89`   |  Launch-specific lifecycle errors
