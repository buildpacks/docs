+++
title="pack untrust-builder"
+++
## pack untrust-builder

Stop trusting builder

### Synopsis

Stop trusting builder.

When building with this builder, all lifecycle phases will be no longer be run in a single container using the builder image.

```
pack untrust-builder <builder-name> [flags]
```

### Options

```
  -h, --help   Help for 'untrust-builder'
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

