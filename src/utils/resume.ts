import { getEntry } from 'astro:content';

/**
 * Loads the single resume entry. Both /resume/ and /resume/print/ go through
 * here so the two renderings can never drift apart.
 */
export async function getResume() {
  const entry = await getEntry('resume', 'main');

  if (!entry) {
    throw new Error(
      "Resume entry 'main' not found. src/data/resume.yaml must have a top-level `main:` key.",
    );
  }

  return entry.data;
}
