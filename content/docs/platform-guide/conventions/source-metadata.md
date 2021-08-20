+++
title="Source Metadata"
weight=1
summary="Conventions for declaring app source information in the app image."
tags=["spec:platform/0.6", "spec:project-descriptor/0.2"]
+++

## Summary

The following are conventions for declaring different type of source inputs. This information is provided to the [lifecycle][lifecycle] using [project-metadata.toml][project-metadata].

## Sources

### Types

The following types are concrete source types and can use any keys as long as they don't overlap with [additive](#additive) sources.

#### Git

- #### `type` _(string, required)_
  Must be `git`

- #### `source` _(required)_

  - `version` _(required)_
    
    - `commit` _(string, required)_\
      Full commit hash

    - `describe` _(string, optional)_\
      Description of commit (see `git describe`)

  - `metadata`  _(optional)_
    
    - `repository` _(string, optional)_\
      Repository URL

    - `refs` _(list of strings, optional)_\
      Additional relevant Git references

###### Example

```toml
[source]
type = "git"

  [source.version]
  commit = "63a73f1b0f2a4f6978c19184b0ea33ad3f092913"
  describe = "v0.18.1-2-g3f092913"

  [source.metadata]
  repository = "https://github.com/myorg/myrepo.git"
  refs = ["master", "v3.0"]
```

#### Image

- #### `type` _(string, required)_
  Must be `image`

- #### `source` _(required)_

  - `version` _(required)_
    
    - `digest` _(string, required)_\
      Image digest

  - `metadata`  _(optional)_
    
    - `path` _(string, optional)_\
      Absolute path to source in image

    - `repository` _(string, optional)_\
      Fully-qualified image name

    - `refs` _(list of strings, optional)_\
      Additional relevant image names/tags

###### Example

```toml
[source]
type = "image"

  [source.version]
  digest = "146c4bce42545e6a4575283b32a7f01924ef86ce848273079693a42b52b27321"

  [source.metadata]
   path = "/source"
   repository =  "index.docker.io/example/image:latest"
   refs = ["index.docker.io/example/image:mytag", "index.docker.io/example/image@sha256:146c4bce42545e6a4575283b32a7f01924ef86ce848273079693a42b52b27321"]
```

### Additive

The following source information is considered additive and should not overlap with source [types](#types).

#### `project.toml`

- #### `type` _(string, required)_
  Must be `project` **(only if no other type is present)**

- #### `source` _(required)_

  - `version` _(required)_
    
    - `version` _(string, optional)_\
      Version as declared in `_.version`

  - `metadata`  _(optional)_
    
    - `url` _(string, optional)_\
      URL as declared in `_.source-url`

###### Example (standalone)

```toml
[source]
type = "project"

  [source.version]
  version = "1.2.3"

  [source.metadata]
  url = "https://github.com/example/repo"
```

###### Example (w/ Image)

```toml
[source]
type = "image"

  [source.version]
  digest = "146c4bce42545e6a4575283b32a7f01924ef86ce848273079693a42b52b27321"
  version = "1.2.3"

  [source.metadata]
  path = "/source"
  repository =  "index.docker.io/example/image:latest"
  refs = ["index.docker.io/example/image:mytag", "index.docker.io/example/image@sha256:146c4bce42545e6a4575283b32a7f01924ef86ce848273079693a42b52b27321"]
  url = "https://github.com/example/repo"
```

[lifecycle]: /docs/concepts/components/lifecycle/
[project-metadata]: https://github.com/buildpacks/spec/blob/platform/0.7/platform.md#project-metadatatoml-toml
