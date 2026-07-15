/**
 * full_audit.mjs
 *
 * Headless audit of all 5 pages of the Wilderness Romance PWA.
 * Uses Playwright to:
 *  1. Capture a full-page PNG screenshot of each of the 5 tabs.
 *  2. Capture mobile (375x812) and desktop (1280x800) viewports.
 *  3. Surface console errors / warnings.
 *  4. Verify key spec elements are present in the DOM.
 *
 * Usage:  node /home/z/my-project/scripts/full_audit.mjs
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = '/home/z/my-project/scripts/audit_shots';
mkdirSync(OUT, { recursive: true });

// Tabs in bottom-tab order
const TABS = [
  { id: 'home',     label: 'Home',     waitsFor: 'HeroSection' },
  { id: 'trip',     label: 'Trip',     waitsFor: 'DayTimeline' },
  { id: 'map',      label: 'Map',      waitsFor: 'MobileFriendlyMap' },
  { id: 'proposal', label: 'Proposal', waitsFor: 'CountdownToProposal' },
  { id: 'us',       label: 'Us',       waitsFor: 'RelationshipMetrics' },
];

// Spec markers we expect to find (text in DOM)
const EXPECTED = {
  home: [
    /Wilderness Romance/i,
    /August\s*4.*9.*2026/i,
    /484.*miles|484.*mi/i,
  ],
  trip: [
    /Day\s*1/i,
    /Day\s*6/i,
    /Bear\s*Brook/i,
    /Dixville/i,
  ],
  map: [
    /map|atlas|terrain/i,
  ],
  proposal: [
    /Proposal/i,
    /countdown|days|hours|minutes/i,
    /pause|breathe|kneel/i, // P-04 The Pause
  ],
  us: [
    /Together|Since|anniversary/i, // U-01
    /ring|engagement/i, // RingShowcase
    /gallery|visual/i, // PhotoGallery
  ],
};

const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'desktop', width: 1280, height: 800 },
];

async function clickTab(page, tabLabel) {
  // Bottom tab bar buttons use aria-label
  const btn = page.locator(`nav[aria-label="Page navigation"] button[aria-label="${tabLabel}"]`);
  try {
    await btn.click({ timeout: 3000 });
    return true;
  } catch {
    console.warn(`  ! Tab "${tabLabel}" not found`);
    return false;
  }
}

async function auditViewport(viewport) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`PAGEERROR: ${err.message}`);
  });

  console.log(`\n=== ${viewport.name.toUpperCase()} (${viewport.width}x${viewport.height}) ===`);
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  // Wait for boot sequence to finish
  await page.waitForTimeout(3500);

  for (const tab of TABS) {
    console.log(`\n--- Tab: ${tab.label} (${tab.id}) ---`);
    await clickTab(page, tab.label);
    await page.waitForTimeout(1200);

    const path = `${OUT}/${viewport.name}-${tab.id}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`  ✓ Screenshot: ${path}`);

    // Spec presence checks
    const body = await page.locator('body').textContent() || '';
    const expected = EXPECTED[tab.id] || [];
    for (const re of expected) {
      const ok = re.test(body);
      console.log(`  ${ok ? '✓' : '✗ MISSING'} /${re.source}/`);
    }
  }

  console.log(`\n--- Console issues (${viewport.name}) ---`);
  if (consoleErrors.length === 0) console.log('  ✓ No console errors');
  else {
    console.log(`  ✗ ${consoleErrors.length} console errors:`);
    consoleErrors.slice(0, 5).forEach((e) => console.log(`    - ${e}`));
  }
  if (consoleWarnings.length === 0) console.log('  ✓ No console warnings');
  else {
    console.log(`  ⚠ ${consoleWarnings.length} console warnings:`);
    consoleWarnings.slice(0, 3).forEach((w) => console.log(`    - ${w}`));
  }

  await browser.close();
  return { errors: consoleErrors.length, warnings: consoleWarnings.length };
}

(async () => {
  const results = [];
  for (const vp of VIEWPORTS) {
    results.push({ name: vp.name, ...(await auditViewport(vp)) });
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`${r.name.padEnd(8)}: ${r.errors} errors, ${r.warnings} warnings`);
  }
})();
