+++
title="Rebase"
weight=8
summary="Rebase application layers onto a new run image."
+++

{{< param "summary" >}}

### Exit Codes

| Exit Code       | Result|
|-----------------|-------|
| `0`             | Success
| `11`            | Platform API incompatibility error
| `12`            | Buildpack API incompatibility error
| `1-10`, `13-19` | Generic lifecycle errors
| `70-79`         |  Rebase-specific lifecycle errors
