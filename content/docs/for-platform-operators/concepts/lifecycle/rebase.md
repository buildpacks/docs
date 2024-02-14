+++
title="Rebase"
weight=8
+++

The `rebaser` places application layers atop a new version of the runtime base image.

<!--more-->

### Exit Codes

| Exit Code       | Result                              |
|-----------------|-------------------------------------|
| `0`             | Success                             |
| `11`            | Platform API incompatibility error  |
| `12`            | Buildpack API incompatibility error |
| `1-10`, `13-19` | Generic lifecycle errors            |
| `70-79`         | Rebase-specific lifecycle errors    |
