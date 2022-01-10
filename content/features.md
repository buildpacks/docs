+++
title="Features"
weight=1
layout="standalone"
summary="Cloud Native Buildpacks provide a unique solution to the image build process. See how it compares to the alternatives."
+++

<div class='grid'>

{{< feature title="Advanced Caching" align="right" >}}
Robust caching is used to improve performance.
{{</>}}

{{< feature title="Auto-detection" align="right" >}}
Images can be built directly from application source without additional instructions.
{{</>}}
  
{{< feature title="Bill-of-Materials" >}}
Insights into the contents of the app image through standard build-time SBOMs in <a href="https://cyclonedx.org/">CycloneDX</a>, <a href="https://spdx.dev/">SPDX</a> and <a href="https://github.com/anchore/syft">Syft JSON</a> formats.
{{</>}}

{{< feature title="Modular / Pluggable" >}}
Multiple buildpacks can be used to create an app image.
{{</>}}

{{< feature title="Multi-language" >}}
Supports more than one programming language family.
{{</>}}

{{< feature title="Multi-process" >}}
Image can have multiple entrypoints for each operational mode.
{{</>}}

{{< feature title="Minimal app image" >}}
Image contains only what is necessary.
{{</>}}

{{< feature title="Rebasing" >}}
Instant updates of base images without re-building.
{{</>}}

{{< feature title="Reproducibility" >}}
Reproduces the same app image digest by re-running the build.
{{</>}}

{{< feature title="Reusability" >}}
Leverage production-ready buildpacks maintained by the community.
{{</>}}

</div>

## Comparison

{{< comparison-table >}}