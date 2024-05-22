+++
title="Community"
weight=2
layout="community"
summary="Join other users, contributors and providers of Cloud Native Buildpacks."
+++

# Help us build Cloud Native Buildpacks

Cloud Native Buildpacks is better because of our contributors and maintainers. It is because of you that we can bring great software to the community. See below for further details on the several ways you can get more involved with the project.

## Check out GitHub

You can follow the work we do, be part of on-going discussions, and examine our improvement ideas on each [respective repo’s](https://github.com/buildpacks) GitHub issues page.

If you're a newcomer, check out the good first issue label in each repository, take [pack](https://github.com/buildpacks/pack/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) for example.

If you are ready to jump in and add code, tests, or help with documentation, follow the guidelines in the contributing documentation in the respective repository.

## Join our Slack channels

Join any of our several channels within the [Cloud Native Computing Foundation’s Slack workspace](https://cloud-native.slack.com/) and talk to us and over 1,000 other community members:

- [#buildpacks](https://cloud-native.slack.com/archives/C033DV8D9FB)
- [#buildpacks-authors](https://cloud-native.slack.com/archives/C0333LG1E68)
- [#buildpacks-implementation](https://cloud-native.slack.com/archives/C0331B5QS02)
- [#buildpacks-kpack](https://cloud-native.slack.com/archives/C05GETJ2NP7)
- [#buildpacks-learning-team](https://cloud-native.slack.com/archives/C032LNSTUNB)
- [#buildpacks-maintainers](https://cloud-native.slack.com/archives/C0333LG7C9J)
- [#buildpacks-mentoring](https://cloud-native.slack.com/archives/C032LNSKPP1)
- [#buildpacks-pack-cli](https://cloud-native.slack.com/archives/C0331B61A1Y)
- [#buildpacks-platform](https://cloud-native.slack.com/archives/C033DV9CSAD)
- [#buildpacks-spec](https://cloud-native.slack.com/archives/C033DV9EBDF)

## Attend our Working Group meetings

Working Group Meetings are held every 1st and 3rd Thursday at 10am Pacific Time ([convert to your time zone](https://dateful.com/time-zone-converter?t=08:00&tz=PT%20%28Pacific%20Time%29)) and every 2nd and 4th Thursday at 7am Pacific Time ([convert to your time zone](https://dateful.com/time-zone-converter?t=08:00&tz=PT%20%28Pacific%20Time%29)).

{{< calendar >}}

Attend working group meetings to hear the latest development updates, provide feedback, ask questions, meet the maintainers, and get to know other members of the community.

Join our [Mailing List](https://lists.cncf.io/g/cncf-buildpacks) to get updates on the project and invitations to working group meetings.

- [Meeting Zoom Link](https://zoom.us/j/91289548697?pwd=SzNzaHdmVUVBZGhJM20weThIdGdkUT09)
- See previous community meetings on our [YouTube Playlist](https://www.youtube.com/playlist?list=PL1p8pquzNvRpDbbgZ0db0MRA-W5_w0G1U)
- [Meeting agenda](https://docs.google.com/document/d/18gkdfJsy8AQWsOgzPbLRnxN4a-WtUoaCM2Lh7-08rdo/edit#heading=h.3kg2wwvbnkb3)

Topics should be added to the agenda in the public [Google Doc](https://docs.google.com/document/d/18gkdfJsy8AQWsOgzPbLRnxN4a-WtUoaCM2Lh7-08rdo/edit#heading=h.3kg2wwvbnkb3) the day prior to the meeting. The list of topics will be finalized by the meeting organizers. If any scheduled topics are covered in less than the allotted time, additional topics may be covered.

## Contributing

#### How can I start contributing?

If you are new to the project, the first thing you should do is gain some understanding of the project. This normally entails doing the following:

1. Watch a few [talks (videos)][talks].
2. Next, run through some [tutorials][tutorials].

If you run into issues or unexpected behaviour, that's probably the best place to start adding your first contribution.

If you didn't find anything you'd like to improve while going through the tutorials you can browse the repositories below (some of those repositories may even have ["good first issues"][good-first-issues]):

| Component                | Tech Stack             | Description
|---                       |---                     |---
| [`pack`][pack]           | Go, Docker             | CLI providing build and utility functions to end-users.
| [`lifecycle`][lifecycle] | Go, Docker             | Executables that implement the main [specifications][spec] and are used by [platforms][platforms] such as `pack`.
| [`docs`][docs]           | Hugo, HTML, JavaScript | Main website and documentation.

> Depending our your depth of understanding or desires some components may be more ideal than others.

[talks]: /docs/talks
[tutorials]: /docs/#tutorials
[spec]: /docs/reference/spec/
[platforms]: /docs/for-app-developers/concepts/platform/
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

## Donate your project to Buildpacks Community, our vendor-neutral GitHub organization

As our adopters and contributors have grown substantially over the last several years, we created a new GitHub organization to allow us to foster partner projects. The [Buildpacks Community organization](https://github.com/buildpacks-community/) is a vendor-neutral Github organization where the community provides trusted Cloud Native Buildpacks tooling, platforms, and integrations.

​​For a project to be admitted to the Buildpacks community organization, it must meet several criteria, but the first step is to create a Github issue in the Buildpacks Community repository. Once it is mature enough to be part of the core Buildpacks organization, the project maintainers can request for the project to be graduated into the core Buildpacks organization. Kpack was the first project to be donated into this new org and you can read more about the first major community project donation [here](https://medium.com/buildpacks/kpack-joins-the-buildpacks-community-organization-223e59bda951).

If you want to know more and how you can donate your own project, you can find all the details in the [RFC](https://github.com/buildpacks/rfcs/blob/main/text/0117-buildpacks-community.md).

##### Thank you for your interest in making this project even better.
