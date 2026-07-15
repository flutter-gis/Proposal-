/**
 * keyboard_debug.mjs
 *
 * Focused test: click Home, press ArrowRight ONCE, check result.
 * Captures all console logs to see how many times the handler fires.
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('/home/z/my-project/scripts/logs', { recursive: true });
writeFileSync('/home/z/my-project/scripts/logs/keyboard_debug.log', '');

const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const consoleMessages = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (text.includes('SlideDeck')) {
      console.log(`CONSOLE: ${text}`);
    }
  });

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000); // boot

  console.log('\n=== Step 1: Click Home tab ===');
  await page.locator('nav[aria-label="Page navigation"] button[aria-label="Home"]').click({ force: true });
  await page.waitForTimeout(1000);
  const page1 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label');
  console.log(`  Current page: ${page1}`);

  console.log('\n=== Step 2: Press ArrowRight ONCE ===');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);

  const page2 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label');
  console.log(`  Current page after ONE ArrowRight: ${page2}`);
  console.log(`  Expected: Trip (advance by 1)`);
  console.log(`  Actual:   ${page2}`);

  console.log('\n=== All SlideDeck console messages ===');
  for (const msg of consoleMessages) {
    if (msg.includes('SlideDeck')) console.log(`  ${msg}`);
  }

  writeFileSync('/home/z/my-project/scripts/logs/keyboard_debug.log', consoleMessages.join('\n'));

  await browser.close();
})();
