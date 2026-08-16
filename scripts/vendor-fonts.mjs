/**
 * Copies the latin variable font files out of the installed @fontsource-variable
 * packages and into public/fonts/.
 *
 * The copies are committed, so the build never touches the network for fonts.
 * Re-run this after bumping either font package:
 *
 *   npm run fonts:vendor
 *
 * If you add a font, also add its @font-face block to src/styles/global.css
 * (copy the unicode-range from the package's own wght.css) and, if it is a body
 * face, a matching <link rel="preload"> in src/components/BaseHead.astro.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(projectRoot, 'public', 'fonts');

/** @type {Array<{ pkg: string; file: string; out: string }>} */
const FONTS = [
  {
    pkg: '@fontsource-variable/inter',
    file: 'files/inter-latin-wght-normal.woff2',
    out: 'inter-latin-var.woff2',
  },
  {
    pkg: '@fontsource-variable/jetbrains-mono',
    file: 'files/jetbrains-mono-latin-wght-normal.woff2',
    out: 'jetbrains-mono-latin-var.woff2',
  },
];

await mkdir(outDir, { recursive: true });

for (const { pkg, file, out } of FONTS) {
  // Resolve through package.json so this works regardless of hoisting layout.
  const pkgRoot = dirname(require.resolve(`${pkg}/package.json`));
  const src = join(pkgRoot, file);
  const dest = join(outDir, out);

  await copyFile(src, dest);
  console.log(`vendored ${pkg}/${file} -> public/fonts/${out}`);
}

console.log(`\n${FONTS.length} font file(s) up to date.`);
