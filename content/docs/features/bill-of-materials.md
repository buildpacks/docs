+++
title="Bill of Materials"
summary="A Software `Bill-of-Materials` (`BOM`) gives you a layer-by-layer view of what's inside your container in a variety of formats including `JSON`."
+++

## Summary
A Software `Bill-of-Materials` (`BOM`) gives you a layer-by-layer view of what's inside your container in a variety of formats including `JSON`. Buildpacks can also populate your app image with metadata from the build process, allowing you to audit the app image for information like, the process types that are available and the commands associated with them, buildpacks which were used to create the app image etc. Apart from the above standard metadata, buildpacks can also populate information about the dependencies they have provided in form of a `Bill-of-Materials` (`BOM`).

## Adding Bill of Materials
Use the following tutorial to add a `Bill-of-Materials` using buildpacks. <br/>
[Adding bill of materials][adding-bill-of-materials]

## Viewing Bill of Materials
You can use this command to inspect your app for it's `Bill-of-Materials`.

```bash
pack inspect-image your-image-name --bom
```


[adding-bill-of-materials]: /docs/buildpack-author-guide/create-buildpack/adding-bill-of-materials/

