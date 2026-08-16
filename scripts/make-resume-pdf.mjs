/**
 * Renders /resume/print/ to dist/vince-caldwell-resume.pdf.
 *
 * Must run AFTER `astro build` (which wipes dist/) and BEFORE the Pages
 * artifact is uploaded, so the PDF ships as part of the site.
 *
 *   npm run build
 *   npm run preview &        # serve dist/
 *   npm run resume:pdf
 *
 * The PDF is generated rather than committed so it can never drift from the
 * resume page: src/data/resume.yaml is the single source for both.
 */
import { access, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { launchChromium } from './lib/browser.mjs';

const BASE = process.env.PDF_BASE_URL ?? 'http://localhost:4321';
const OUT = resolve(process.env.PDF_OUT ?? 'dist/vince-caldwell-resume.pdf');
const SOURCE_PATH = '/resume/print/';

// Fail loudly if dist/ is missing — otherwise we would emit a PDF into a
// directory that is not about to be deployed.
try {
  await access(dirname(OUT));
} catch {
  await mkdir(dirname(OUT), { recursive: true });
}

const url = new URL(SOURCE_PATH, BASE).href;
const browser = await launchChromium();

try {
  const page = await browser.newPage();

  const response = await page.goto(url, { waitUntil: 'networkidle' });

  if (!response || !response.ok()) {
    throw new Error(
      `Could not load ${url} (${response ? response.status() : 'no response'}). ` +
        'Is the preview server running against a fresh build?',
    );
  }

  // Guard against silently producing a blank or partial PDF.
  const headingCount = await page.locator('h1').count();
  if (headingCount === 0) {
    throw new Error(`${url} rendered without an <h1> — refusing to write a PDF.`);
  }

  // Web fonts must be resolved before printing or the PDF falls back to a
  // system face with different metrics.
  await page.evaluate(() => document.fonts.ready);

  await page.emulateMedia({ media: 'print', colorScheme: 'light' });

  await page.pdf({
    path: OUT,
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true, // honour the @page rule in PrintLayout
  });

  console.log(`resume PDF written to ${OUT}`);
} finally {
  await browser.close();
}
