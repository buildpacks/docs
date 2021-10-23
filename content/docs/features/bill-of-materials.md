+++
title="Bill of Materials"
summary="A Software `Bill-of-Materials` (`BOM`) gives you a layer-by-layer view of what's inside your container in a variety of formats including `JSON`."
+++

## Summary

A Software **Bill-of-Materials** (`BOM`) provides information necessary to know what's inside your container and how it was constructed.
Cloud Native Buildpacks provide two forms of Bill-of-Materials.

1. Buildpacks can populate `BOM` information about the dependencies they have provided.
2. A list of what buildpacks were used to build the application.

## Adding Bill of Materials

Use the following tutorial to add a `Bill-of-Materials` using buildpacks. <br/>
[Adding bill of materials][adding-bill-of-materials]

## Viewing Bill of Materials

You can use this command to inspect your app for it's `Bill-of-Materials`.

```bash
pack inspect-image your-image-name --bom
```

It can also be accessed by looking at the label `io.buildpacks.build.metadata`. For example, running Docker CLI, jq and using the following command.

```bash
docker inspect your-image-name | jq -r '.[0].Config.Labels["io.buildpacks.build.metadata"] | fromjson'
```

Following is the the information listed in `io.buildpacks.build.metadata` for [Sample Java App](https://github.com/buildpacks/samples/tree/main/apps/java-maven) obtained by building the app using buildpacks and running the above command.

For this output:

1. `bom` is the buildpack populated bom.
2. `buildpacks` is the list of buildpacks.

```json
{
  "bom": [
    {
      "name": "java",
      "metadata": {
        "version": "11.0.12+7"
      },
      "buildpack": {
        "id": "google.java.runtime",
        "version": "0.9.1"
      }
    }
  ],
  "buildpacks": [
    {
      "id": "google.java.runtime",
      "version": "0.9.1"
    },
    {
      "id": "google.java.maven",
      "version": "0.9.0"
    },
    {
      "id": "google.java.entrypoint",
      "version": "0.9.0"
    },
    {
      "id": "google.utils.label",
      "version": "0.0.1"
    }
  ],
  "launcher": {
    "version": "0.11.1",
    "source": {
      "git": {
        "repository": "github.com/buildpacks/lifecycle",
        "commit": "75df86c"
      }
    }
  },
  "processes": [
    {
      "type": "web",
      "command": "java",
      "args": ["-jar", "/workspace/target/sample-0.0.1-SNAPSHOT.jar"],
      "direct": true,
      "buildpackID": "google.java.entrypoint"
    }
  ],
  "buildpack-default-process-type": "web"
}
```

[adding-bill-of-materials]: /docs/buildpack-author-guide/create-buildpack/adding-bill-of-materials/
