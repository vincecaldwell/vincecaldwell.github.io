/**
 * Accessibility audit over the built site, in both themes.
 *
 *   npm run preview &
 *   node scripts/audit-a11y.mjs / /projects/ /resume/
 *
 * Checks contrast of real computed colours (not palette theory), heading
 * order, image alt text, link names, and the skip link. Exits non-zero on
 * failure so it can gate a build.
 */
import { launchChromium } from './lib/browser.mjs';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321';
const routes =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : ['/', '/projects/', '/about/', '/resume/', '/contact/', '/blog/'];

const AUDIT = () => {
  /** sRGB channel -> linear */
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const parse = (str) => {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: parts.slice(0, 3), a: parts.length > 3 ? parts[3] : 1 };
  };
  const ratio = (fg, bg) => {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Walks up for the first non-transparent background. */
  const effectiveBg = (el) => {
    let node = el;
    while (node && node !== document.documentElement.parentNode) {
      const parsed = parse(getComputedStyle(node).backgroundColor);
      if (parsed && parsed.a > 0.95) return parsed.rgb;
      node = node.parentElement;
    }
    return [0, 0, 0];
  };

  const issues = [];

  // --- contrast on text-bearing elements ---
  const textSel = 'p, li, h1, h2, h3, h4, a, span, button, dt, dd, time, code';
  for (const el of document.querySelectorAll(textSel)) {
    if (!el.textContent || !el.textContent.trim()) continue;
    // Only leaf-ish nodes, to avoid double-reporting containers.
    if (el.querySelector(textSel)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const fg = parse(cs.color);
    if (!fg || fg.a < 0.95) continue;

    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = isLarge ? 3 : 4.5;
    const got = ratio(fg.rgb, effectiveBg(el));

    if (got < required) {
      issues.push({
        type: 'contrast',
        required,
        got: Math.round(got * 100) / 100,
        fontSize: size,
        text: el.textContent.trim().slice(0, 60),
        selector: el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0],
      });
    }
  }

  // --- heading order ---
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(
    (h) => !h.closest('[hidden]'),
  );
  const h1s = headings.filter((h) => h.tagName === 'H1');
  if (h1s.length !== 1) {
    issues.push({ type: 'heading', message: `expected exactly one h1, found ${h1s.length}` });
  }
  let prev = 0;
  for (const h of headings) {
    const level = Number(h.tagName[1]);
    if (prev && level > prev + 1) {
      issues.push({
        type: 'heading',
        message: `jumped h${prev} -> h${level}`,
        text: h.textContent.trim().slice(0, 50),
      });
    }
    prev = level;
  }

  // --- images need alt ---
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) {
      issues.push({ type: 'img-alt', src: img.getAttribute('src') });
    }
  }

  // --- links and buttons need accessible names ---
  const accName = (el) =>
    (
      el.getAttribute('aria-label') ||
      el.textContent ||
      el.querySelector('svg title')?.textContent ||
      ''
    ).trim();
  for (const el of document.querySelectorAll('a[href], button')) {
    if (!accName(el)) {
      issues.push({ type: 'no-accessible-name', tag: el.tagName, html: el.outerHTML.slice(0, 90) });
    }
  }

  // --- skip link must be the first focusable element ---
  const firstFocusable = document.querySelector(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!firstFocusable || !/skip/i.test(firstFocusable.textContent || '')) {
    issues.push({
      type: 'skip-link',
      message: 'first focusable element is not a skip link',
      found: firstFocusable ? firstFocusable.textContent.trim().slice(0, 40) : 'none',
    });
  }

  return issues;
};

const browser = await launchChromium();
let total = 0;

try {
  for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme: theme,
    });

    for (const route of routes) {
      const page = await context.newPage();
      const url = new URL(route, BASE).href;
      const res = await page.goto(url, { waitUntil: 'load' });

      if (!res || !res.ok()) {
        console.error(`✗ ${route} [${theme}] -> HTTP ${res ? res.status() : 'none'}`);
        total++;
        await page.close();
        continue;
      }

      await page.evaluate(() => document.fonts.ready);
      // Reveal animated content so it is measurable.
      await page.evaluate(() =>
        document
          .querySelectorAll('[data-reveal]')
          .forEach((el) => el.classList.add('is-visible')),
      );
      await page.waitForTimeout(700);

      const issues = await page.evaluate(AUDIT);
      total += issues.length;

      if (issues.length === 0) {
        console.log(`✓ ${route} [${theme}]`);
      } else {
        console.log(`✗ ${route} [${theme}] — ${issues.length} issue(s)`);
        for (const issue of issues) console.log('   ', JSON.stringify(issue));
      }

      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(total === 0 ? '\nNo accessibility issues found.' : `\n${total} issue(s) found.`);
process.exit(total === 0 ? 0 : 1);
