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

`make serve` and `make build` download [Hugo](https://gohugo.io/) and [Dart Sass](https://sass-lang.com/dart-sass/)
(which Hugo uses to compile the site's styles) into `tools/bin` for you. If you run `hugo` directly instead,
[install Dart Sass](https://sass-lang.com/install/) and make sure `sass` is on your `PATH`.

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