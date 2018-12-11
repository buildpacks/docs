+++

title="Managing stacks"
weight=4
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"

+++
## Managing stacks

As mentioned [previously](/docs/using-pack/building-app/#building-explained), a stack is associated with a build image and a run image. Stacks in
`pack`'s configuration can be managed using the following commands:

```bash
$ pack add-stack <stack-name> --build-image <build-image-name> --run-image <run-image-name1,run-image-name2,...>
```

```bash
$ pack update-stack <stack-name> --build-image <build-image-name> --run-image <run-image-name1,run-image-name2,...>
```

```bash
$ pack delete-stack <stack-name>
```

```bash
$ pack set-default-stack <stack-name>
```

> Technically, a stack can be associated with multiple run images, as a variant is needed for each registry to
> which an app image might be published when using `--publish`.

### Example: Adding a stack

In this example, a new stack called `org.example.my-stack` is added and associated with build image `my-stack/build`
and run image `my-stack/run`.

```bash
$ pack add-stack org.example.my-stack --build-image my-stack/build --run-image my-stack/run
```

### Example: Updating a stack

In this example, an existing stack called `org.example.my-stack` is updated with a new build image `my-stack/build:v2`
and a new run image `my-stack/run:v2`.

```bash
$ pack add-stack org.example.my-stack --build-image my-stack/build:v2 --run-image my-stack/run:v2
```

### Example: Deleting a stack

In this example, the existing stack `org.example.my-stack` is deleted from `pack`'s configuration.

```bash
$ pack delete-stack org.example.my-stack
```

### Example: Setting the default stack

In this example, the default stack, used by [`create-builder`](/docs/using-pack/working-with-builders), is set to
`org.example.my-stack`.

```bash
$ pack set-default-stack org.example.my-stack
```

### Listing stacks

To inspect available stacks and their names (denoted by `id`), run:

```bash
$ cat ~/.pack/config.toml

...

[[stacks]]
  id = "io.buildpacks.stacks.bionic"
  build-images = ["packs/build"]
  run-images = ["packs/run"]

[[stacks]]
  id = "org.example.my-stack"
  build-images = ["my-stack/build"]
  run-images = ["my-stack/run"]

...
```

> Note that this method of inspecting available stacks will soon be replaced by a new command. The format of
> `config.toml` is subject to change at any time.
