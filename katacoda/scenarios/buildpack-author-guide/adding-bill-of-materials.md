# Adding Bill-of-Materials

<!-- test:suite=create-buildpack;weight=9 -->

One of the benefits of buildpacks is they can also populate the app image with metadata from the build process, allowing you to audit the app image for information like:

* The process types that are available and the commands associated with them
* The run-image the app image was based on
* The buildpacks were used to create the app image
* And more...!

You can find some of this information using `pack` via its `inspect-image` command.  The bill-of-materials information will be available using `pack sbom download`.

<!-- test:exec -->
```bash
pack inspect-image test-ruby-app
```{{execute}}
You should see the following:

<!-- test:assert=contains -->
```text
Run Images:
  cnbs/sample-stack-run:bionic

Buildpacks:
  ID                   VERSION        HOMEPAGE
  examples/ruby        0.0.1          -

Processes:
  TYPE                 SHELL        COMMAND                           ARGS        WORK DIR
  web (default)        bash         bundle exec ruby app.rb                       /workspace
  worker               bash         bundle exec ruby worker.rb                    /workspace
```

Apart from the above standard metadata, buildpacks can also populate information about the dependencies they have provided in form of a `Bill-of-Materials`. Let's see how we can use this to populate information about the version of `ruby` that was installed in the output app image.

To add the `ruby` version to the output of `pack download sbom`, we will have to provide a [Software `Bill-of-Materials`](https://en.wikipedia.org/wiki/Software_bill_of_materials) (`SBOM`) containing this information. There are three "standard" ways to report SBOM data.  You'll need to choose to use on of [CycloneDX](https://cyclonedx.org/), [SPDX](https://spdx.dev/) or [Syft](https://github.com/anchore/syft) update the `ruby.sbom.<ext>` (where `<ext>` is the extension appropriate for your SBOM standard, one of `cdx.json`, `spdx.json` or `syft.json`) at the end of your `build` script.  Discussion of which SBOM format to choose is outside the scope of this tutorial, but we will note that the SBOM format you choose to use is likely to be the output format of any SBOM scanner (eg: [`syft cli`](https://github.com/anchore/syft)) you might choose to use.  In this example we will use the CycloneDX json format.

First, annotate the `buildpack.toml` to specify that it emits CycloneDX:

<!-- test:file=ruby-buildpack/buildpack.toml -->
<pre class="file" data-filename="ruby-buildpack/buildpack.toml" data-target="replace">
# Buildpack API version
api = "0.7"

# Buildpack ID and metadata
[buildpack]
  id = "examples/ruby"
  version = "0.0.1"
  sbom-formats = [ "application/vnd.cyclonedx+json" ]

# Stacks that the buildpack will work with
[[stacks]]
  id = "io.buildpacks.samples.stacks.bionic"
</pre>

Then, in our buildpack implemetnation we will generate the necessary SBOM metadata:

```bash
# ...

# Append a Bill-of-Materials containing metadata about the provided ruby version
cat >> "$layersdir/ruby.sbom.cdx.json" << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "ruby",
      "version": "$ruby_version"
    }
  ]
}
EOL
```

We can also add an SBOM entry for each dependency listed in `Gemfile.lock`.  Here we use `jq` to add a new record to the `components` array in `bundler.sbom.cdx.json`:

```bash
crubybom="${layersdir}/ruby.sbom.cdx.json"
cat >> ${rubybom} << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "ruby",
      "version": "$ruby_version"
    }
  ]
}
EOL
if [[ -f Gemfile.lock ]] ; then
  for gem in $(gem dep -q | grep ^Gem | sed 's/^Gem //')
  do
    version=${gem##*-}
    name=${gem%-${version}}
    DEP=$(jq --arg name "${name}" --arg version "${version}" \
      '.components[.components| length] |= . + {"type": "library", "name": $name, "version": $version}' \
      "${rubybom}")
    echo ${DEP} > "${rubybom}"
  done
fi
```

Your `ruby-buildpack/bin/build`{{open}} script should look like the following:

<!-- test:file=ruby-buildpack/bin/build -->
<pre class="file" data-filename="ruby-buildpack/bin/build" data-target="replace">
#!/usr/bin/env bash
set -eo pipefail

echo "---> Ruby Buildpack"

# 1. GET ARGS
layersdir=$1
plan=$3

# 2. CREATE THE LAYER DIRECTORY
rubylayer="$layersdir"/ruby
mkdir -p "$rubylayer"

# 3. DOWNLOAD RUBY
ruby_version=$(cat "$plan" | yj -t | jq -r '.entries[] | select(.name == "ruby") | .metadata.version')
echo "---> Downloading and extracting Ruby $ruby_version"
ruby_url=https://s3-external-1.amazonaws.com/heroku-buildpack-ruby/heroku-18/ruby-$ruby_version.tgz
wget -q -O - "$ruby_url" | tar -xzf - -C "$rubylayer"

# 4. MAKE RUBY AVAILABLE DURING LAUNCH
echo -e '[types]\nlaunch = true' > "$layersdir/ruby.toml"

# 5. MAKE RUBY AVAILABLE TO THIS SCRIPT
export PATH="$rubylayer"/bin:$PATH
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+${LD_LIBRARY_PATH}:}"$rubylayer/lib"

# 6. INSTALL BUNDLER
echo "---> Installing bundler"
gem install bundler --no-ri --no-rdoc

# 7. INSTALL GEMS
# Compares previous Gemfile.lock checksum to the current Gemfile.lock
bundlerlayer="$layersdir/bundler"
local_bundler_checksum=$((sha256sum Gemfile.lock || echo 'DOES_NOT_EXIST') | cut -d ' ' -f 1)
remote_bundler_checksum=$(cat "$layersdir/bundler.toml" | yj -t | jq -r .metadata.checksum 2>/dev/null || echo 'DOES_NOT_EXIST')
# Always set the types table so that we re-use the appropriate layers
echo -e '[types]\ncache = true\nlaunch = true' >> "$layersdir/bundler.toml"

if [[ -f Gemfile.lock && $local_bundler_checksum == $remote_bundler_checksum ]] ; then
    # Determine if no gem dependencies have changed, so it can reuse existing gems without running bundle install
    echo "---> Reusing gems"
    bundle config --local path "$bundlerlayer" >/dev/null
    bundle config --local bin "$bundlerlayer/bin" >/dev/null
else
    # Determine if there has been a gem dependency change and install new gems to the bundler layer; re-using existing and un-changed gems
    echo "---> Installing gems"
    mkdir -p "$bundlerlayer"
    cat >> "$layersdir/bundler.toml" << EOL
[metadata]
checksum = "$local_bundler_checksum"
EOL
    bundle config set --local path "$bundlerlayer" && bundle install && bundle binstubs --all --path "$bundlerlayer/bin"

fi

# 8. SET DEFAULT START COMMAND
cat > "$layersdir/launch.toml" << EOL
# our web process
[[processes]]
type = "web"
command = "bundle exec ruby app.rb"
default = true

# our worker process
[[processes]]
type = "worker"
command = "bundle exec ruby worker.rb"
EOL

# ========== ADDED ===========
# 9. ADD A SBOM
rubybom="${layersdir}/ruby.sbom.cdx.json"
cat >> ${rubybom} << EOL
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "ruby",
      "version": "$ruby_version"
    }
  ]
}
EOL
if [[ -f Gemfile.lock ]] ; then
  for gem in $(gem dep -q | grep ^Gem | sed 's/^Gem //')
  do
    version=${gem##*-}
    name=${gem%-${version}}
    DEP=$(jq --arg name "${name}" --arg version "${version}" \
      '.components[.components| length] |= . + {"type": "library", "name": $name, "version": $version}' \
      "${rubybom}")
    echo ${DEP} > "${rubybom}"
  done
fi
</pre>

Then rebuild your app using the updated buildpack:

<!-- test:exec -->
```bash
pack build test-ruby-app --path ./ruby-sample-app --buildpack ./ruby-buildpack
```{{execute}}

Viewing your bill-of-materials requires extracting (or `download`ing) the bill-of-materials from your local image.  This command can take some time to return.

<!-- test:exec -->
```bash
pack sbom download test-ruby-app
```{{execute}}

The SBOM information is now downloaded to the local file system:

<!-- test:exec -->
```bash
cat layers/sbom/launch/examples_ruby/ruby/sbom.cdx.json | jq -M
```

You should find that the included `ruby` version is `2.5.0` as expected.

<!-- test:assert=contains;ignore-lines=... -->
```text
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "ruby",
      "version": "2.5.0"
    },
...
  ]
}
```

Congratulations! You’ve created your first configurable Cloud Native Buildpack that uses detection, image layers, and caching to create an introspectable and runnable OCI image.

## Going further

Now that you've finished your buildpack, how about extending it? Try:

- Caching the downloaded Ruby version
- [Packaging your buildpack for distribution][package-a-buildpack]

[package-a-buildpack]: https://buildpacks.io/docs/buildpack-author-guide/package-a-buildpack/