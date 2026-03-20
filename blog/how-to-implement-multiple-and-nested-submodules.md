---
authors: matt2ology
categories:
  - blog
  - problems-and-questions
date: 2026-03-20T02:22:47-07:00
draft: false
tags:
  - git-submodules
  - github-actions
  - repository-management
  - system-design
  - git-workflows
title: How Do I Structure a Hugo Blog with Nested Submodules?
---

## How to implement multiple and nested submodules

<!-- A blog is about communicating outward (you → readers) -->

I don't know...

I have a repository that uses nested submodules. I want to make sure they all work where `content` is a submodule to the main project repo, but `content` has a submodule of its own `journal`. Both `content` and `journal` are private repos to the main project repo.

Where the `content` repo to **manage its own submodule (`journal`) independently** and **not have the `journal` submodule tracked by the main repo**. That is `content` repo to control its own submodules, but the main repo should only track `content` as a submodule, without the nested submodule (`journal`) being tracked directly by the main repo.

All together:

- **Main repo** tracks `content` as a submodule.
- **`content` repo** contains its own submodule `journal`.
- Main repo does not track the `journal` submodule directly.

```
+---.github
|   \---workflows
+---archetypes
+---content (submodule)
|   +---.github
|   |   \---workflows
|   +---.obsidian
|   +---archives
|   +---atomic
|   +---blog
|   +---collections
|   +---highlights
|   +---journal (submodule)
|   +---literature
|   +---search
|   \---templates
+---layouts
|   +---shortcodes
|   +---_markup
|   \---_partials
|       +---article
|       \---obsidian
\---themes
    \---hugo-theme-stack (submodule)
```
