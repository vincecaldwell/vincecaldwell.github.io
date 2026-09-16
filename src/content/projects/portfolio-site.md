---
title: This Portfolio Site
summary: >-
  A statically generated personal site with a build pipeline that generates my
  resume PDF from the same data as the web page and fails CI on accessibility
  regressions.
stack:
  - Astro
  - TypeScript
  - Tailwind CSS
  - Playwright
  - GitHub Actions
role: Designer and engineer
timeframe:
  start: 2026-08-01
  end: null
repoUrl: https://github.com/vincecaldwell/vincecaldwell.github.io
liveUrl: https://vincecaldwell.github.io
featured: true
order: 1
status: shipped
---

## The problem

Most developer portfolios drift. The resume on the page and the PDF people
actually download fall out of sync, content lives in hand-edited HTML, and
nothing catches it when a change quietly breaks contrast or heading order.

I wanted a site where adding a project means writing one Markdown file, and
where the things that usually rot are enforced by the build instead of by
memory.

## Approach

**One source of truth for the resume.** `resume.yaml` feeds both the web resume
and the downloadable PDF. The PDF is generated during CI by driving Chromium
against a dedicated print route, so it cannot disagree with the page. A
page-count assertion fails the build if the resume ever spills past one page —
a regression that is otherwise invisible until someone opens the file.

**Content validated at build time.** Projects and posts are Zod-validated
collections. Alt text is required whenever an image is set, a project's end date
cannot precede its start, and cross-references between posts and projects are
checked, so a rename fails the build rather than leaving a dead link.

**Accessibility as a gate, not a checklist.** A Playwright audit walks every
route in both colour themes, measuring contrast from real computed styles rather
than trusting the palette, plus heading order, alt text, accessible names and
the skip link. It runs in CI and exits non-zero. It has already caught a real
defect: project cards were fixed at `h3`, so the projects index skipped from
`h1` straight to `h3`.

## Architecture

Astro builds 11 static routes. Theming uses a three-layer token system, which
Tailwind 4 requires because `@theme` values resolve at build time and therefore
cannot hold anything theme-dependent: a raw palette, semantic variables defined
per theme, and an `inline` bridge into utilities. The practical result is that
markup uses `bg-bg text-content` and follows the theme automatically, with
almost no `dark:` variants anywhere.

Fonts are vendored rather than fetched. Astro's font integration resolves files
over the network at build time and only warns when that fails, which would
silently ship a site with no webfonts — so the two latin variable faces are
committed and declared with plain `@font-face`, keeping the build hermetic.

Deployment runs on GitHub Actions: build, generate the PDF into the output
directory, run the audit, then publish. Pull requests run everything except the
deploy.

## Outcome

Total shipped JavaScript is about 2.4KB — an inline theme bootstrap, a theme
toggle, and an IntersectionObserver for scroll reveals. No framework runtime, no
client-side data fetching, no third-party requests at build or view time.

The scroll-reveal work produced the lesson I keep: hiding content by default in
CSS meant any failure to run the reveal script left the page permanently blank.
The hidden state is now gated behind a class set by a guaranteed inline script,
so no JavaScript means an unanimated page rather than an empty one.
