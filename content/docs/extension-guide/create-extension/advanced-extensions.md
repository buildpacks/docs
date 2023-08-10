+++
title="The finer points of image extensions"
weight=406
+++

TODO - move this to extension-guide/conventions?

# Guidance for extension authors

## During detect

### Expressing provided dependencies through the build plan

### Configuring build args

```
├── bin
│   ├── detect
├── generate
│   ├── build.Dockerfile
│   ├── run.Dockerfile
│   ├── extend-config.toml
├── extension.toml
```

## During generate

### Re-setting the user/group with build args

### Invalidating the build cache with the UUID build arg

### Making 'rebasable' changes

## In general

### Choosing an extension ID

### Expressing information in extension.toml

### Pre-populating output

The root directory for a typical extension might look like the following:

```
.
├── bin
│   ├── detect     <- similar to a buildpack ./bin/detect
│   ├── generate   <- similar to a buildpack ./bin/build
├── extension.toml <- similar to a buildpack buildpack.toml
```

But it could also look like any of the following:

#### ./bin/detect is optional!

```
.
├── bin
│   ├── generate
├── detect
│   ├── plan.toml
├── extension.toml
```

#### ./bin/generate is optional!

```
├── bin
│   ├── detect
├── generate
│   ├── build.Dockerfile
│   ├── run.Dockerfile
├── extension.toml
```

#### It's all optional!

```
├── detect
│   ├── plan.toml
├── generate
│   ├── build.Dockerfile
│   ├── run.Dockerfile
├── extension.toml
```
