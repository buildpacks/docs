# Development

##### Prerequisites

* [jq](https://stedolan.github.io/jq/)
    * macOS: `brew install jq`
    * Windows: `choco install jq`
    * Ubuntu: `sudo apt install jq`
* Make
    * macOS: `xcode-select --install`
    * Windows: `choco install make`
    * Ubuntu: `sudo apt install make`

#### Serve

Serve docs at http://localhost:1313

```bash
make serve
```

#### Build

```bash
make build
```

#### Clean

```bash
make clean
```