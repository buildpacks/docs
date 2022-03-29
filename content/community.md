+++
title="Community"
weight=2
layout="community"
summary="Join other users, contributors and providers of Cloud Native Buildpacks."
+++

## Calendar

Partake in one or many of our following public events:

{{< calendar >}}

## Contributing

#### How can I start contributing?

If you are new to the project, the first thing you should do is gain some understanding of the project. This normaly entails doing the following:

1. Watch a few [talks (videos)][talks].
2. Next, run through some [tutorials][tutorials].

If you run into issues or unexpected behaviour, that's probably the best place to start adding your first contribution.

If you didn't find anything you'd like to improve while going through the tutorials you can browse the repositories below (some of those repositories may even have ["good first issues"][good-first-issues]):

| Component                | Tech Stack             | Description
|---                       |---                     |---
| [`pack`][pack]           | Go, Docker             | CLI providing build and utility functions to end-users.
| [`lifecycle`][lifecycle] | Go, Docker             | Executables that implement the main [specifications][spec] and are used by [platforms][platforms] such as `pack`.
| [`docs`][docs]           | Hugo, HTML, JavaScript | Main website and documentation.

> Dependending our your depth of understading or desires some components may be more ideal than others.

[talks]: /docs/#talks
[tutorials]: /docs/#tutorials
[spec]: /docs/reference/spec/
[platforms]: /docs/concepts/components/platform/
[pack]: https://github.com/buildpacks/pack
[lifecycle]: https://github.com/buildpacks/lifecycle
[docs]: https://github.com/buildpacks/docs
[good-first-issues]: https://github.com/search?q=org%3Abuildpacks+label%3A%22good+first+issue%22+state%3Aopen&type=Issues

#### What type of contributions can I make?

Buildpacks welcomes all types of contributions, not just those related to code. We value any help that you can provide, and are more than happy to guide you through the process.

{{< tabs active="Code">}}

{{< tab name="Code" >}}

Code contributions are always welcome to any Buildpacks repository.

The following repositories are good starting points for code contributions:

- [libcnb](https://github.com/buildpacks/libcnb)
- [lifecycle](https://github.com/buildpacks/lifecycle)
- [pack](https://github.com/buildpacks/pack)

Other, more specialized, repositories include:

- [tekton-integration](https://github.com/buildpacks/tekton-integration)
- [pack-orb](https://github.com/buildpacks/pack-orb)

{{< /tab >}}

{{< tab name="Documentation" >}}

This involves documenting any aspect of the project. We have various open issues for you to start off with. Another good starting point would revolve around your comprehension or desired area of expertise.

Some examples where we'd value documentation contributions are:

- Providing additional tutorials/guides to our [docs site](https://buildpacks.io/)
- Adding additional information or examples to our [samples repo](https://github.com/buildpacks/samples)
- Working on open issues, such as on our
  - [Documentation repo](https://github.com/buildpacks/docs/issues)
  - [Samples repo](https://github.com/buildpacks/samples/issues)
- Adding GoDocs to codebases, such as
  - [libcnb](https://github.com/buildpacks/libcnb)
  - [lifecycle](https://github.com/buildpacks/lifecycle)
  - [pack](https://github.com/buildpacks/pack)
- Writing posts for our [Medium blog](https://medium.com/buildpacks). Please discuss blog proposals with the [learning team on Slack, #buildpacks-learning-team](https://cloud-native.slack.com/app_redirect?channel=buildpacks-learning-team).

If you have any other ideas where documentation would be useful, please feel free to open up an issue in the related repository, or drop a message at the [#buildpacks-learning-team channel on Slack!](https://cloud-native.slack.com/app_redirect?channel=buildpacks-learning-team)

{{< /tab >}}

{{< tab name="RFCs" >}}

RFCs, or Request For Comments, is the process we employ to review project-wide changes. By proposing changes via RFCs, it allows for the entire community to partake in the brainstorming process of applying changes, considering alternatives, impact, and limitations.

Contributions to the RFC process can take any or all of the following forms:

- Reviewing and commenting on [RFC Pull Requests](https://github.com/buildpacks/rfcs/pulls)
- Partaking in discussions in [Working Group](https://github.com/buildpacks/community/#working-group) meetings
- Proposing changes via [RFCs](https://github.com/buildpacks/rfcs)

{{< /tab >}}

{{< tab name="Triage" >}}

Triaging issues is the process of looking at newly created issues (or following up on issues). There are many benefits our community gains from our current triage process, such as:

- The community receives reasonable response times.
- Minimize the number of open "stale" issues.
- Ongoing efforts aren't disrupted.

To learn more about how you can help triage issues, check out our dedicated [triage](https://github.com/buildpacks/community/blob/main/contributors/triage.md) page.

If you're looking at open issues but unsure where to start, try looking for issues with the "good first issue" or "help wanted" labels!

{{< /tab >}}

{{< /tabs >}}

#### How do I submit a pull request?

If your contribution requires changes to a project repository, look at the DEVELOPMENT.md file if the repo has one to ensure you have the prerequisites installed. It may also include other necessary steps (such as instructions on running tests), but broadly, you will have to carry out the following steps:

- [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the repository.
- [Clone](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github/cloning-a-repository) your fork repository.
- Create a branch for the issue: `git checkout -b {{BRANCH_NAME}}`
- Make any changes deemed necessary.
- Commit your changes with a sign-off: `git commit -s`

A sign-off is a single line added to your commit messages that certifies that you wrote and/or have the right to the contributed changes. The signature should look as such:

```
Signed-off-by: John Doe <john.doe@email.com>
```

Also, git can automatically add the signature by adding the -s flag to the commit command,
`git commit -s`

The full text of the certification is available [here](https://developercertificate.org/).

- Push to GitHub: `git push origin {{BRANCH_NAME}}`
- [Create the pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork).
