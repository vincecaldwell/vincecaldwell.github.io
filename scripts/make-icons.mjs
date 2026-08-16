/**
 * Generates the raster icon set and the default social card from source SVG,
 * so the only hand-maintained art is public/favicon.svg.
 *
 *   npm run icons
 *
 * Re-run after editing favicon.svg. Outputs are committed so the build itself
 * needs no image toolchain.
 */
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = resolve(root, 'public');

const BG = '#16171a';
const FG = '#4dd6e0';
const MUTED = '#9aa0ab';

/** Icon mark on an opaque background — raster icons cannot be theme-aware. */
const markSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <rect width="64" height="64" rx="14" fill="${BG}"/>
  <path d="M16 20 L26 44 L36 20" fill="none" stroke="${FG}" stroke-width="6"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M52 26 a10 10 0 1 0 0 12" fill="none" stroke="${FG}" stroke-width="6"
        stroke-linecap="round"/>
</svg>`;

/**
 * 1200x630 Open Graph card. Text is drawn as SVG rather than composited from a
 * font file so this stays dependency-free; the faces are named with fallbacks
 * that exist on the rendering machine.
 */
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="12%" cy="0%" r="80%">
      <stop offset="0%" stop-color="${FG}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${FG}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g transform="translate(80, 84) scale(1.15)">
    <rect width="64" height="64" rx="14" fill="none" stroke="${FG}" stroke-opacity="0.35" stroke-width="2"/>
    <path d="M16 20 L26 44 L36 20" fill="none" stroke="${FG}" stroke-width="6"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M52 26 a10 10 0 1 0 0 12" fill="none" stroke="${FG}" stroke-width="6"
          stroke-linecap="round"/>
  </g>

  <text x="80" y="330" font-family="DejaVu Sans, Verdana, sans-serif"
        font-size="82" font-weight="700" fill="#f0f1f3">Vince Caldwell</text>

  <text x="80" y="400" font-family="DejaVu Sans, Verdana, sans-serif"
        font-size="34" fill="${MUTED}">Senior Software Engineer</text>

  <text x="80" y="556" font-family="DejaVu Sans Mono, monospace"
        font-size="26" fill="${FG}" letter-spacing="3">vincecaldwell.github.io</text>
</svg>`;

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of targets) {
  const buf = await sharp(Buffer.from(markSvg(size)))
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(resolve(pub, name), buf);
  console.log(`wrote public/${name} (${size}x${size})`);
}

// .ico: 32x32 PNG payload, which every current browser accepts.
const ico32 = await sharp(Buffer.from(markSvg(32))).resize(32, 32).png().toBuffer();
await writeFile(resolve(pub, 'favicon.ico'), ico32);
console.log('wrote public/favicon.ico (32x32)');

const og = await sharp(Buffer.from(ogSvg)).png().toBuffer();
await writeFile(resolve(pub, 'og-default.png'), og);
console.log('wrote public/og-default.png (1200x630)');
