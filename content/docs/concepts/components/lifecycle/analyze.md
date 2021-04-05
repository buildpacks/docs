+++
title="Analyze"
weight=2
summary="Restores files that buildpacks may use to optimize the build and export phases."
+++

### Exit Codes

| Exit Code       | Result|
|-----------------|-------|
| `0`             | Success
| `11`            | Platform API incompatibility error
| `12`            | Buildpack API incompatibility error
| `1-10`, `13-19` | Generic lifecycle errors
| `30-39`         | Analysis-specific lifecycle errors
