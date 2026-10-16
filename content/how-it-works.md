+++
title="How it Works"
layout="how-it-works"
summary="Follow your source code through the buildpacks lifecycle, from detection to a production-ready, rebasable container image."
lead="From source code to a production-ready container image, without writing a Dockerfile. Scroll to follow a build from start to finish."

# Each step drives one scene of the 3D walkthrough, in order.
# Keep the number and order of steps in sync with the scene in assets/js/how-it-works.js.

[[steps]]
phase = "Source"
title = "It starts with your source code"
body = "Point a platform such as `pack` at your app. There's no Dockerfile to write or maintain: buildpacks work out what your app needs and how to package it."
link = "/docs/for-app-developers/concepts/platform/"
linkText = "What is a platform?"

[[steps]]
phase = "Builder"
title = "A builder brings the tools"
body = "A builder is an image that bundles an ordered set of buildpacks, a build-time base image to run them in, the lifecycle that orchestrates every phase, and a reference to the runtime base image your app will ship on."
link = "/docs/for-app-developers/concepts/builder/"
linkText = "What is a builder?"

[[steps]]
phase = "Detect"
title = "Buildpacks decide if they apply"
body = "After analyzing any previously built image, the lifecycle asks each buildpack, in order, whether it recognizes your app. A `package.json` lets the Node.js buildpack pass, a `requirements.txt` lets Python pass, and optional buildpacks with nothing to do simply opt out."
link = "/docs/for-platform-operators/concepts/lifecycle/detect/"
linkText = "Learn about detection"

[[steps]]
phase = "Restore"
title = "Cached layers come back"
body = "The lifecycle restores layers saved by earlier builds from the cache, so dependencies that haven't changed don't have to be downloaded or compiled again. Rebuilds stay fast."
link = "/docs/for-platform-operators/concepts/lifecycle/restore/"
linkText = "Learn about restoring"

[[steps]]
phase = "Build"
title = "Each buildpack contributes layers"
body = "The lifecycle runs each participating buildpack inside the build-time base image, and each one contributes its own layers: a language runtime, installed dependencies, your compiled app. Every layer is isolated, cacheable and can be described in a software bill of materials."
link = "/docs/for-platform-operators/concepts/lifecycle/build/"
linkText = "Learn about the build phase"

[[steps]]
phase = "Export"
title = "Out comes an OCI image"
body = "The lifecycle stacks those layers on top of the runtime base image and exports a standard OCI image, ready to push to any registry, with no build tools left inside."
link = "/docs/for-platform-operators/concepts/lifecycle/export/"
linkText = "Learn about exporting"

[[steps]]
phase = "Rebase"
title = "Patch the OS in seconds"
body = "When a vulnerability is fixed in the runtime base image, `pack rebase` swaps the base layers underneath your app without rebuilding it. Your app layers stay exactly as they were."
link = "/docs/for-app-developers/concepts/rebase/"
linkText = "What happens during rebase?"

[[steps]]
phase = "Run"
title = "Run it anywhere"
body = "The result is a reproducible, well-structured container image that runs wherever containers do: on Kubernetes, on a cloud platform, or on your own machine."
link = "/docs/app-journey"
linkText = "Try it in the tutorial"
+++
