---
title: Notes on building this site
description: >-
  TODO: A sample post so the blog plumbing has something to render. Replace or
  delete it before linking the blog from the nav.
pubDate: 2026-08-16
tags:
  - astro
  - meta
draft: true
---

This post exists so the blog templates, the index and the RSS feed have
something to render against. It is marked `draft: true`, so it is excluded from
production builds and from the feed — it shows up only in `astro dev`.

## Writing a post

Drop a Markdown file in `src/content/posts/`. The frontmatter is validated at
build time, so a missing `description` or a malformed `pubDate` fails the build
rather than shipping broken output.

Set `draft: false` when a post is ready. Once you have one real post worth
reading, add `{ label: 'Writing', href: '/blog/' }` to `NAV_ITEMS` in
`src/consts.ts` and the section becomes visible in the nav.

## Linking to a project

The `relatedProjects` field takes project IDs and is checked against the
projects collection at build time, so a typo or a renamed project fails loudly
instead of producing a dead link.
