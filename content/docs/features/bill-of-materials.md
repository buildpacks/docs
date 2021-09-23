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

```
{
  "bom": [
    {
      "name": "jdk",
      "metadata": null,
      "buildpack": {
        "id": "samples/java-maven",
        "version": "0.0.1"
      }
    }
  ],
  "buildpacks": [
    {
      "homepage": "https://github.com/buildpacks/samples/tree/main/buildpacks/java-maven",
      "id": "samples/java-maven",
      "version": "0.0.1"
    }
  ],
  "launcher": {
    "version": "0.11.3",
    "source": {
      "git": {
        "repository": "github.com/buildpacks/lifecycle",
        "commit": "aa4bbac"
      }
    }
  },
  "processes": [
    {
      "type": "web",
      "command": "java -jar target/sample-0.0.1-SNAPSHOT.jar",
      "args": null,
      "direct": false,
      "buildpackID": "samples/java-maven"
    }
  ],
  "buildpack-default-process-type": "web"
}

```

[adding-bill-of-materials]: /docs/buildpack-author-guide/create-buildpack/adding-bill-of-materials/
