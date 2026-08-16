import type { APIRoute } from 'astro';
import { SITE_NOINDEX } from '../consts';

/**
 * Generated rather than a static file so the sitemap URL follows `site` in
 * astro.config.mjs — moving to a custom domain needs no edit here.
 *
 * Note the sitemap is `sitemap-index.xml`, not `sitemap.xml`: that is what
 * @astrojs/sitemap emits, and pointing at the wrong name is a silent no-op.
 */
export const GET: APIRoute = ({ site }) => {
  const lines = [
    'User-agent: *',
    // Crawling stays allowed even while SITE_NOINDEX is on. This looks wrong
    // but is deliberate: `noindex` only works if the crawler can fetch the page
    // and read the meta tag. `Disallow: /` would block the fetch, so the URL
    // could still be indexed from external links — with no snippet and no way
    // for us to say "don't index it". Blocking crawling and preventing indexing
    // are different things, and only the meta tag does the latter.
    'Allow: /',
    // Exists only as the source for the generated resume PDF.
    'Disallow: /resume/print/',
    '',
  ];

  // Don't advertise a sitemap for pages we're asking not to be indexed.
  if (!SITE_NOINDEX) {
    lines.push(`Sitemap: ${new URL('sitemap-index.xml', site)}`, '');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
