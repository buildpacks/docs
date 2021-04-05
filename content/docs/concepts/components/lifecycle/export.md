+++
title="Export"
weight=5
summary="Creates the final OCI image."
+++

### Exit Codes

| Exit Code       | Result|
|-----------------|-------|
| `0`             | Success
| `11`            | Platform API incompatibility error
| `12`            | Buildpack API incompatibility error
| `1-10`, `13-19` | Generic lifecycle errors
| `60-69`         |  Export-specific lifecycle errors
