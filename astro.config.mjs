// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // This is a GitHub *user* page (repo is named <user>.github.io), so it is served
  // from the domain root. Do NOT add `base` — it would prefix every generated URL
  // with a path segment that does not exist and break the whole site.
  //
  // To move to a custom domain later: change this line, add `public/CNAME`
  // containing the bare domain, and set it in Settings -> Pages. Nothing else.
  site: 'https://vincecaldwell.github.io',

  integrations: [
    mdx(),
    sitemap({
      // /resume/print/ exists only as the source for the generated PDF.
      filter: (page) => !page.includes('/resume/print'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // NOTE: fonts are deliberately NOT configured through Astro's `fonts` API.
  // Every provider it offers (including `npm`) resolves font files over the
  // network during the build, and the `fontsource` provider only *warns* when
  // that fails — silently shipping a site with no webfonts. A deploy should not
  // depend on a third-party font API being reachable.
  //
  // Instead the two latin variable faces are vendored into `public/fonts/` and
  // declared with plain @font-face in `src/styles/global.css`, with matching
  // preloads in BaseHead. Fully hermetic, 88KB total, and refreshable via
  // `npm run fonts:vendor`.

  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
