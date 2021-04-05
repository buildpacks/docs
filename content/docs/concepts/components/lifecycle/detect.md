+++
title="Detect"
weight=1
summary="Finds an ordered group of buildpacks to use during the build phase."
+++

### Exit Codes

| Exit Code       | Result|
|-----------------|-------|
| `0`             | Success
| `11`            | Platform API incompatibility error
| `12`            | Buildpack API incompatibility error
| `1-10`, `13-19` | Generic lifecycle errors
| `20`            | All buildpacks groups have failed to detect w/o error
| `21`            | All buildpack groups have failed to detect and at least one buildpack has errored
| `22-29`         | Detection-specific lifecycle errors
