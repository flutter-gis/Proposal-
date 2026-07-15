/**
 * verify_url_hash.mjs
 *
 * Verifies G-12: URL hash sync.
 * Visits each page and checks that the URL hash updates correctly.
 * Also verifies deep-linking: loading /#proposal starts on the Proposal page.
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('=== G-12: URL Hash Sync Verification ===\n');

  // Test 1: Deep-linking — load /#proposal directly
  console.log('--- Test 1: Deep-link to /#proposal ---');
  await page.goto(`${BASE}/#proposal`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000); // boot sequence
  const initialPage = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label');
  const initialUrl = page.url();
  console.log(`  Initial page: ${initialPage}`);
  console.log(`  URL: ${initialUrl}`);
  console.log(`  ${initialPage === 'Proposal' ? '✓ PASS' : '✗ FAIL'} — expected Proposal, got ${initialPage}`);

  // Test 2: Click through tabs and verify hash updates
  console.log('\n--- Test 2: Click tabs, verify hash updates ---');
  const tabs = ['Home', 'Trip', 'Map', 'Proposal', 'Us'];
  for (const tab of tabs) {
    await page.locator(`nav[aria-label="Page navigation"] button[aria-label="${tab}"]`).click({ force: true });
    await page.waitForTimeout(500);
    const url = page.url();
    const hash = new URL(url).hash;
    const expectedHash = `#${tab.toLowerCase()}`;
    console.log(`  Click ${tab}: hash=${hash} ${hash === expectedHash ? '✓' : '✗ expected ' + expectedHash}`);
  }

  // Test 3: Swipe and verify hash updates
  console.log('\n--- Test 3: Swipe, verify hash updates ---');
  // Go to Home first
  await page.locator('nav[aria-label="Page navigation"] button[aria-label="Home"]').click({ force: true });
  await page.waitForTimeout(500);

  // Swipe left (forward) via CDP
  const client = await page.context().newCDPSession(page);
  const cx = 375 / 2, cy = 812 / 2;
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ state: 'touchPressed', x: cx + 100, y: cy, id: 0 }],
    modifiers: 0, timestamp: Date.now(),
  });
  for (let i = 1; i <= 12; i++) {
    const x = cx + 100 - (200 * i / 12);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ state: 'touchMoved', x, y: cy, id: 0 }],
      modifiers: 0, timestamp: Date.now(),
    });
    await page.waitForTimeout(20);
  }
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [{ state: 'touchReleased', x: cx - 100, y: cy, id: 0 }],
    modifiers: 0, timestamp: Date.now(),
  });
  await page.waitForTimeout(800);
  await client.detach();

  const swipeUrl = page.url();
  const swipeHash = new URL(swipeUrl).hash;
  console.log(`  After swipe-left: hash=${swipeHash} ${swipeHash === '#trip' ? '✓' : '✗ expected #trip'}`);

  await browser.close();
  console.log('\n=== Done ===');
})();
