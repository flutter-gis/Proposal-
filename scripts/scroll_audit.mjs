/**
 * scroll_audit.mjs
 *
 * For each of the 5 tabs, scroll through the page and capture
 * a viewport-height screenshot at top, middle, and bottom.
 * This reveals every section, not just the top fold.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = '/home/z/my-project/scripts/audit_shots/scroll';
mkdirSync(OUT, { recursive: true });

const TABS = ['Home', 'Trip', 'Map', 'Proposal', 'Us'];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3500); // boot sequence

  for (const tab of TABS) {
    console.log(`\n--- ${tab} ---`);
    await page.locator(`nav[aria-label="Page navigation"] button[aria-label="${tab}"]`).click({ force: true });
    await page.waitForTimeout(1500);

    // The SlideDeck uses an inner scrollable div, not the body.
    // Get its scrollHeight and scroll it programmatically.
    const info = await page.evaluate(() => {
      const el = document.querySelector('.overflow-y-auto');
      return {
        height: el ? el.scrollHeight : document.body.scrollHeight,
        selector: el ? 'inner-div' : 'body',
      };
    });
    console.log(`  Scroll container: ${info.selector}, height: ${info.height}px`);

    const viewportHeight = 812;
    const stepSize = viewportHeight * 0.8;
    const steps = Math.max(3, Math.ceil(info.height / stepSize));

    for (let i = 0; i < steps; i++) {
      const y = Math.min(i * stepSize, Math.max(0, info.height - viewportHeight));
      await page.evaluate((yy) => {
        const el = document.querySelector('.overflow-y-auto');
        if (el) el.scrollTop = yy;
        else window.scrollTo(0, yy);
      }, y);
      await page.waitForTimeout(450);
      const path = `${OUT}/${tab.toLowerCase()}-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({ path, fullPage: false });
      console.log(`  ✓ ${path} (y=${Math.round(y)})`);
    }
  }

  await browser.close();
})();
