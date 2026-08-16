# vincecaldwell.github.io

Personal site and portfolio — [vincecaldwell.github.io](https://vincecaldwell.github.io)

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com),
deployed to GitHub Pages by GitHub Actions. Fully static: no runtime data fetching,
no backend, no third-party requests at build or view time.

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. Draft content is visible here only. |
| `npm run build` | Type check, then build to `dist/`. |
| `npm run preview` | Serve the built `dist/` — use this, not `dev`, for realistic testing. |
| `npm run check` | Type check only. |
| `npm run resume:pdf` | Regenerate the resume PDF (needs `preview` running). |
| `npm run audit:a11y` | Contrast, heading order and alt-text audit (needs `preview` running). |
| `npm run screenshot` | Capture routes in both themes to `.screenshots/`. |
| `npm run icons` | Regenerate favicons and the social card from `public/favicon.svg`. |
| `npm run fonts:vendor` | Refresh the vendored font files after bumping a font package. |

## Updating content

Everything you'd routinely change lives in four places.

**Identity and navigation** — `src/consts.ts`. Name, tagline, email, social links,
and which pages appear in the nav.

**Projects** — one Markdown file per project in `src/content/projects/`. Frontmatter
is validated at build time, so a typo fails the build rather than rendering wrong.
Set `featured: true` to surface a project on the home page, and `order` to control
its position. To add a cover image, drop it next to the Markdown file and reference
it as `cover: ./my-image.png`; `coverAlt` is then required.

**Resume** — `src/data/resume.yaml`. This is the single source for both the
`/resume/` page and the downloadable PDF, so they can never disagree. Never edit a
PDF by hand; edit the YAML and the next build regenerates it.

**Writing** — Markdown files in `src/content/posts/`. Posts are `draft: true` by
default in the sample. The blog is built and reachable at `/blog/` but deliberately
absent from the nav until it has something in it — add
`{ label: 'Writing', href: '/blog/' }` to `NAV_ITEMS` when you're ready.

Placeholder copy is marked `TODO:` throughout. To find everything left to write:

```bash
grep -rn "TODO:" src/
```

## Design system

Colours, type scale and spacing are defined as tokens in `src/styles/global.css`
in three layers, which is what makes theming work in Tailwind 4:

1. `@theme` — the raw palette (`--color-ink-*`, `--color-signal-*`) and static
   scales. Tailwind resolves these at build time, so nothing theme-dependent can
   live here.
2. `@layer base` — semantic tokens (`--t-bg`, `--t-text`, `--t-accent`) defined
   once per theme. These are the only values that change between light and dark.
3. `@theme inline` — bridges the semantic tokens into utilities. The `inline`
   keyword makes utilities emit `var(--t-bg)` literally instead of baking in a
   value.

The practical consequence: write `bg-bg text-content border-border-subtle` and it
follows the theme automatically. You almost never need a `dark:` variant.

The theme is applied before first paint by an inline script in `<head>`
(`src/components/ThemeScript.astro`), which also sets a `.js` class. The
scroll-reveal animation's hidden state is gated behind that class, so a failure to
run JavaScript means unanimated content rather than a blank page.

## Fonts

Inter and JetBrains Mono are vendored into `public/fonts/` as latin-subset variable
files (88KB total) and declared with plain `@font-face`.

This is deliberate. Astro's `fonts` config resolves files over the network during
the build, and the `fontsource` provider only *warns* when that fails — silently
shipping a site with no webfonts. Vendoring keeps the build hermetic. Run
`npm run fonts:vendor` after bumping either `@fontsource-variable` package.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds, generates
the resume PDF into `dist/`, runs the accessibility audit, and publishes to Pages.
The PDF must be generated after the build (`astro build` wipes `dist/`) and before
the artifact upload, which is why the workflow does not use `withastro/action` —
that action bundles build and upload into one step with no seam to insert into.

**One-time setup:** repository **Settings → Pages → Build and deployment → Source**
must be set to **GitHub Actions**. Until it is, the deploy job fails with
"Pages site not found". The `github-pages` environment is created by the first run,
so if run #1 fails for this reason, flip the setting and re-run it — the workflow's
`workflow_dispatch` trigger means no empty commit is needed.

### Moving to a custom domain

Three steps, no restructuring:

1. Add `public/CNAME` containing the bare domain on one line.
2. Change `site` in `astro.config.mjs`.
3. Set the domain in Settings → Pages and enable "Enforce HTTPS".

Do **not** set `base`. This is a user page served from the domain root, and adding
a base path would break every generated link.
