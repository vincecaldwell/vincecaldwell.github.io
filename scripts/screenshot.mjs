/**
 * Dev helper: screenshots pages of the built site in both themes.
 *
 *   npm run preview &   # or: npx astro preview
 *   node scripts/screenshot.mjs /about/ /projects/
 *
 * Writes PNGs to .screenshots/ (gitignored). Not part of the build.
 */
import { mkdir } from 'node:fs/promises';
import { launchChromium } from './lib/browser.mjs';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321';
const routes = process.argv.slice(2);
const paths = routes.length > 0 ? routes : ['/'];
const outDir = '.screenshots';

await mkdir(outDir, { recursive: true });

const browser = await launchChromium();

try {
  for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: theme === 'dark' ? 'dark' : 'light',
    });

    for (const path of paths) {
      const page = await context.newPage();
      const url = new URL(path, BASE).href;
      const response = await page.goto(url, { waitUntil: 'load' });

      if (!response || !response.ok()) {
        throw new Error(`${url} -> ${response ? response.status() : 'no response'}`);
      }

      // Let fonts settle so text is not captured mid-swap.
      await page.evaluate(() => document.fonts.ready);

      // Force scroll-reveal elements into their settled state before capturing.
      //
      // A fullPage screenshot is not a real viewport, so IntersectionObserver
      // does not reliably fire for below-the-fold content during scripted
      // scrolling — the capture then shows blank regions that look like a
      // rendering bug but are just un-triggered animation. Applying the class
      // directly captures the state a real visitor ends up in, deterministically.
      await page.evaluate(() => {
        document
          .querySelectorAll('[data-reveal]')
          .forEach((el) => el.classList.add('is-visible'));
      });

      // Let the reveal transitions (0.6s) and their stagger delays finish.
      await page.waitForTimeout(1100);

      const slug = path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
      const file = `${outDir}/${slug}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${url} [${theme}] -> ${file}`);
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}
