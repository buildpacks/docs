+++
title="Build"
weight=4
summary="Transforms application source code into runnable artifacts that can be packaged into a container."
+++

{{< param "summary" >}}

### Exit Codes

| Exit Code       | Result|
|-----------------|-------|
| `0`             | Success
| `11`            | Platform API incompatibility error
| `12`            | Buildpack API incompatibility error
| `1-10`, `13-19` | Generic lifecycle errors
| `51`            | Buildpack build error
| `50`, `52-59`   |  Build-specific lifecycle errors
