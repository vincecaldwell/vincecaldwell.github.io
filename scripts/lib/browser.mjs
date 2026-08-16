import { chromium } from 'playwright';

/**
 * Launches Chromium, honouring a CHROMIUM_PATH override.
 *
 * On CI we run `playwright install chromium`, so Playwright finds its own
 * matching build and no override is needed. Some sandboxed dev environments
 * ship a preinstalled Chromium at a different revision than the pinned
 * Playwright expects; pointing CHROMIUM_PATH at it avoids a download that may
 * be blocked by an egress proxy.
 *
 *   CHROMIUM_PATH=/opt/pw-browsers/chromium node scripts/make-resume-pdf.mjs
 */
export function launchChromium() {
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  return chromium.launch(executablePath ? { executablePath } : {});
}
