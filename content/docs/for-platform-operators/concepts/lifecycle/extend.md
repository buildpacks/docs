+++
title="Extend"
weight=9
+++

The `extender` applies Dockerfiles output by image extensions to the build or runtime base image.

<!--more-->

### Exit Codes

| Exit Code       | Result                              |
|-----------------|-------------------------------------|
| `0`             | Success                             |
| `11`            | Platform API incompatibility error  |
| `12`            | Buildpack API incompatibility error |
| `1-10`, `13-19` | Generic lifecycle errors            |
| `100-109`       | Extension-specific lifecycle errors |
