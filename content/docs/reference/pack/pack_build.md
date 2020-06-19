+++
title="pack build"
+++
## pack build

Generate app image from source code

### Synopsis

Generate app image from source code

```
pack build <image-name> [flags]
```

### Options

```
  -B, --builder string           Builder image (default "gcr.io/paketo-buildpacks/builder:full-cf")
  -b, --buildpack strings        Buildpack reference in the form of '<buildpack>@<version>',
                                   path to a buildpack directory (not supported on Windows),
                                   path/URL to a buildpack .tar or .tgz file, or
                                   the name of a packaged buildpack image
                                 Repeat for each buildpack in order,
                                   or supply once by comma-separated list
      --clear-cache              Clear image's associated cache before building
  -D, --default-process string   Set the default process type
  -d, --descriptor string        Path to the project descriptor file
  -e, --env stringArray          Build-time environment variable, in the form 'VAR=VALUE' or 'VAR'.
                                 When using latter value-less form, value will be taken from current
                                   environment at the time this command is executed.
                                 This flag may be specified multiple times and will override
                                   individual values defined by --env-file.
      --env-file stringArray     Build-time environment variables file
                                 One variable per line, of the form 'VAR=VALUE' or 'VAR'
                                 When using latter value-less form, value will be taken from current
                                   environment at the time this command is executed
  -h, --help                     Help for 'build'
      --network string           Connect detect and build containers to network
      --no-pull                  Skip pulling builder and run images before use
  -p, --path string              Path to app dir or zip-formatted file (defaults to current working directory)
      --publish                  Publish to registry
      --run-image string         Run image (defaults to default stack's run image)
      --trust-builder            Trust the provided builder
                                 All lifecycle phases will be run in a single container (if supported by the lifecycle).
      --volume stringArray       Mount host volume into the build container, in the form '<host path>:<target path>'. Target path will be prefixed with '/platform/'
                                 Repeat for each volume in order,
                                   or supply once by comma-separated list
```

### Options inherited from parent commands

```
      --no-color     Disable color output
  -q, --quiet        Show less output
      --timestamps   Enable timestamps in output
  -v, --verbose      Show more output
```

### SEE ALSO

* [pack](/docs/reference/pack/pack/)	 - CLI for building apps using Cloud Native Buildpacks

