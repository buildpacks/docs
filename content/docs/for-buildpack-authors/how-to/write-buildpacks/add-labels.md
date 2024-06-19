+++
title="Add labels to the application image"
weight=99
+++

<!--more-->

Labels are key-value pairs, stored as strings, that are attached to an image (i.e., arbitrary metadata). Labels are used to add helpful descriptions or attributes to an application image, which are meaningful to users.

Labels are usually added at the time an image is created and can also be modified at a later time. Images can have multiple labels; however, each key must be unique.

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

* General syntax of `LABEL` instruction is as follows:

    `LABEL <key-string>=<value-string>`

    `LABEL version="1.0"`

### Examples  

1. A `run.Dockerfile` SHOULD set the label `io.buildpacks.rebasable` to `true` to indicate that any new run image layers are safe to rebase on top of new runtime base images

    * For the final image to be rebasable, all applied Dockerfiles must set this label to `true`

2. A buildpack ID, buildpack version, and at least one stack MUST be provided in the OCI image config as a Label.

    Label: `io.buildpacks.buildpackage.metadata`

```json
{
  "id": "<entrypoint buildpack ID>",
  "version": "<entrypoint buildpack version>",
  "stacks": [
    {
      "id": "<stack ID>",
      "mixins": ["<mixin name>"]
    }
  ]
}
```
