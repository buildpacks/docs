+++
title="CircleCI"
+++

[CircleCI][circleci] is a continuous integration and delivery platform. The CNB project maintains an integration, called an [orb](https://circleci.com/orbs/), 
which allows users to run [pack][pack] commands inside their pipelines.

<!--more-->

## Use
To use the CNB integration, you need to declare that you are using the [`buildpacks/pack` orb](https://circleci.com/developer/orbs/orb/buildpacks/pack), and then use
it in your workflow.

For instance, your `.circleci/config.yml` file may look like this:
```yaml
version: 2.1
orbs:
  pack: buildpacks/pack@0.2.0
workflows:
  main:
    jobs:
      - pack/build:
          image-name: sample
          builder: 'paketobuildpacks/builder:base'
```

For more precise steps, see the `pack-orb` [documentation][pack-orb-docs]

## References

- [Source Code][pack-orb-source]
- [Pack Orb Documentation][pack-orb-docs]

[pack]: /docs/install-pack
[circleci]: https://circleci.com/
[pack-orb-source]: https://github.com/buildpacks/pack-orb
[pack-orb-docs]: https://circleci.com/developer/orbs/orb/buildpacks/pack
