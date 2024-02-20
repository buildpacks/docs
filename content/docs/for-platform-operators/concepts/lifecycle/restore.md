+++
title="Restore"
weight=3
+++

The `restorer` copies layers from the cache into the build container.

<!--more-->

### Exit Codes

| Exit Code       | Result                                |
|-----------------|---------------------------------------|
| `0`             | Success                               |
| `11`            | Platform API incompatibility error    |
| `12`            | Buildpack API incompatibility error   |
| `1-10`, `13-19` | Generic lifecycle errors              |
| `40-49`         | Restoration-specific lifecycle errors |
