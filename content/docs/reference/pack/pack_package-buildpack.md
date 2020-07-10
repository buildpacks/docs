+++
title="pack package-buildpack"
+++
## pack package-buildpack

Package buildpack in OCI format.

### Synopsis

Package buildpack in OCI format.

```
pack package-buildpack <name> --config <package-config-path> [flags]
```

### Options

```
  -c, --config string   Path to package TOML config (required)
  -f, --format string   Format to save package as ("image" or "file")
  -h, --help            Help for 'package-buildpack'
      --no-pull         Skip pulling packages before use
      --publish         Publish to registry (applies to "--image" only)
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

