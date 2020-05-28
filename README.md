![](https://github.com/buildpacks/docs/workflows/Deploy/badge.svg)

# docs
Website for [Cloud Native Buildpacks](https://buildpacks.io)

## Development

##### Prerequisites

* [jq](https://stedolan.github.io/jq/)
    * macOS: `brew install jq`
    * Windows: `choco install jq`
* Make
    * macOS: `xcode-select --install`
    * Windows: `choco install make`

#### Serve

Serve docs at http://localhost:1313

```bash
make serve
```

#### Build

```bash
make build
```
