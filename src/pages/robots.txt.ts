import type { APIRoute } from 'astro';

/**
 * Generated rather than a static file so the sitemap URL follows `site` in
 * astro.config.mjs — moving to a custom domain needs no edit here.
 *
 * Note the sitemap is `sitemap-index.xml`, not `sitemap.xml`: that is what
 * @astrojs/sitemap emits, and pointing at the wrong name is a silent no-op.
 */
export const GET: APIRoute = ({ site }) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    // Exists only as the source for the generated resume PDF.
    'Disallow: /resume/print/',
    '',
    `Sitemap: ${new URL('sitemap-index.xml', site)}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
