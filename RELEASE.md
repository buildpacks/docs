# Releases

This repository automatically deploys any changes made to the `main` branch.

## Lump Changes

In the event, that you'd like to stage changes to be released together (aka lump) we suggest the following process.

Some use cases in which this may be desired...

1. A new version of `pack` may require some options in our guides to change and we'd like to coordinate the docs changes with the release of the new version.
2. A spec change may require a migration guide, some guides to change, and/or a new guide altogether. We want to update the docs all in one swoop.


### Process

1. A milestone in the following format is created: `<component(s)>/<version>` <sup>*</sup>
1. Issues are created and tagged with appropriete milestone.
1. A release branch in the following format is created off of `main`: `release/<component(s)>/<version>` <sup>*</sup>
1. As changes are completed, PRs would target the release branch and merged using the same guidelines as merging to `main`.
1. Once all issues and/or the associated component release is shipped, the release branch is merged into `main` by subteam maintainers.

_* may require a [project contributor or maintainer](https://github.com/buildpacks/community/blob/main/TEAMS.md) intervention._


##### Example Namings

Branches:

- `release/pack/1.2.3`
- `release/spec/buildpack/0.9`
- `release/spec/extension/bindings/0.3`
- `release/tekton/task/buildpacks/0.5`

Milestones:

- `pack/1.2.3`
- `spec/buildpack/0.9`
- `spec/extension/bindings/0.3`
- `tekton/task/buildpacks/0.5`


##### Example Workflow

Let's imagine `pack` is releasing version `1.2.3`. It is known that there will be a decent amount of changes to a few guides and we'd like to seperate the entire set of changes per guide. The steps that would be taken are as follows:

1. A milestone `pack/1.2.3` would be created.
1. Issues for the necessary changes would be tagged with milestone `pack/1.2.3`.
1. A release branch `release/pack/1.2.3` would be created.
1. As changes are completed, PRs would target `release/pack/1.2.3` and merged.
1. Once all issues and/or release of `pack` version `1.2.3` is shipped, the `release/pack/1.2.3` branch would be merged into `main`.
