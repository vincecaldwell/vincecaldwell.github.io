/**
 * Removes /resume/print/ from the built output, after the PDF has been made
 * from it.
 *
 * That route exists only as the source Chromium prints the resume PDF from. It
 * is an ordinary HTML page though, so deploying it would publish the resume
 * contact block -- including the phone number -- as scrapable HTML. The PDF is
 * the intended way to get that information.
 *
 * Must run AFTER scripts/make-resume-pdf.mjs and BEFORE the Pages artifact is
 * uploaded. It refuses to run if the PDF is missing, so a failed or skipped PDF
 * step cannot silently cost us both the page and the download.
 */
import { access, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const DIST = resolve(process.env.DIST_DIR ?? 'dist');
const PDF = resolve(DIST, 'vince-caldwell-resume.pdf');
const ROUTE = resolve(DIST, 'resume/print');

try {
  await access(PDF);
} catch {
  throw new Error(
    `Refusing to prune ${ROUTE}: ${PDF} does not exist.\n` +
      'The print route is the source for the PDF, so removing it before the PDF\n' +
      'is generated would lose both. Run scripts/make-resume-pdf.mjs first.',
  );
}

try {
  await access(ROUTE);
} catch {
  console.log('print route already absent, nothing to prune');
  process.exit(0);
}

await rm(ROUTE, { recursive: true, force: true });
console.log(`pruned ${ROUTE} from the deployed output (PDF retained)`);
