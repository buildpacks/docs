+++
title="Add labels to the application image"
weight=99
+++

<!--more-->

Labels are key-value pairs, stored as strings, that are attached to an image (i.e., arbitrary metadata). Labels are used to add helpful descriptions or attributes to an application image, which are meaningful to users.

Labels are usually added at the time an image is created. Images can have multiple labels; however, each key must be unique.

## Key Points

A `LABEL`

* MUST specify a unique key for a given image
* MUST specify a value to be set in the image label  
* MUST be added as an image label on the created image metadata
* If one key is given multiple values, the last value overwrites  

## Use Cases

Since adding labels to application images is optional and not needed to run containers, this property is often overlooked. The following are few reasons to why labels should be widely adopted  

* Documenting versioning
* Record licensing information
* Including information about a project maintainer
* Including a description of the image and  additional metadata related to the image
* Labels can also be used to organize images  

## Implementation Steps

Taking the perspective of a buildpack author, labels are added to the `launch.toml` file in the `<layers>/<layer>` directory as follows:

```toml
[[labels]]
key1 = "key1-string"
value1 = "value1-string"

[[labels]]
key2 = "key2-string"
value2 = "value2-string"
```

Going back to the example in the [Buildpack Author's Guide](/docs/for-buildpack-authors/tutorials/basic-buildpack/01_setup-local-environment), this means writing to`"${CNB_LAYERS_DIR}"/node-js/launch.toml`.  

### Examples  

A `shell` example looks as follows:

```shell
cat << EOF > "${CNB_LAYERS_DIR}"/node-js/launch.toml
[[labels]]
key = "key"
value = "value"
EOF
```

While a `Go` example would set the `Labels` field in a `libcnb.BuildResult` as returned by the `build` binary:  

```Go
func (b Build) Build(context libcnb.BuildContext) (libcnb.BuildResult, error) {
    result := libcnb.BuildResult{}

    result.Labels = append(result.Labels, libcnb.Label{Key: "key", Value: "value"})

    return result
}
```

The `libcnb` library will automatically take care of writing the `launch.toml` file to the right place.
