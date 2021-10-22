+++
title="Create"
weight=6
summary="Runs analyze, detect, restore, build, and export in a single command."
+++

{{< param "summary" >}}

### Exit Codes

| Exit Code       | Result|
|-----------------|-------|
| `0`             | Success
| `11`            | Platform API incompatibility error
| `12`            | Buildpack API incompatibility error
| `1-10`, `13-19` | Generic lifecycle errors
| `20-29`         |  Detection-specific lifecycle errors
| `30-39`         |  Analysis-specific lifecycle errors
| `40-49`         |  Restoration-specific lifecycle errors
| `50-59`         |  Build-specific lifecycle errors
| `60-69`         |  Export-specific lifecycle errors
