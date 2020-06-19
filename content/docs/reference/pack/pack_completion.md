+++
title="pack completion"
+++
## pack completion

Outputs completion script location

### Synopsis

Generates bash completion script and outputs its location.

To configure your bash shell to load completions for each session, add the following to your '.bashrc' or '.bash_profile':

	. $(pack completion)

To configure your zsh shell to load completions for each session, add the following to your '.zshrc':

	. $(pack completion --shell zsh)
  
	

```
pack completion [flags]
```

### Options

```
  -h, --help           help for completion
  -s, --shell string   Generates completion file for [bash|zsh] (default "bash")
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

