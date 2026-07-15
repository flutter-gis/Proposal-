/**
 * verify_transitions.mjs
 *
 * Verifies G-03: direction-aware page transitions.
 * Clicks through tabs in forward and backward order, capturing the
 * animation class applied to the active page container.
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

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3500); // boot

  const getTransitionClass = async () => {
    return await page.evaluate(() => {
      const el = document.querySelector('.overflow-y-auto');
      if (!el) return null;
      const cls = Array.from(el.classList);
      return cls.find((c) =>
        c.startsWith('anim-page-') || c === 'anim-fade-in-up'
      ) || null;
    });
  };

  const clickTab = async (label) => {
    await page.locator(`nav[aria-label="Page navigation"] button[aria-label="${label}"]`).click({ force: true });
    // Capture class immediately (during animation)
    await page.waitForTimeout(50);
    const cls = await getTransitionClass();
    // Wait for animation to complete
    await page.waitForTimeout(600);
    return cls;
  };

  console.log('\n=== Forward direction (Home → Trip → Map → Proposal → Us) ===');
  for (const tab of ['Trip', 'Map', 'Proposal', 'Us']) {
    const cls = await clickTab(tab);
    const ok = cls === 'anim-page-forward';
    console.log(`  ${ok ? '✓' : '✗'} → ${tab}: ${cls} ${ok ? '(forward ✓)' : '(expected anim-page-forward)'}`);
  }

  console.log('\n=== Backward direction (Us → Proposal → Map → Trip → Home) ===');
  for (const tab of ['Proposal', 'Map', 'Trip', 'Home']) {
    const cls = await clickTab(tab);
    const ok = cls === 'anim-page-backward';
    console.log(`  ${ok ? '✓' : '✗'} ← ${tab}: ${cls} ${ok ? '(backward ✓)' : '(expected anim-page-backward)'}`);
  }

  console.log('\n=== Verify CSS keyframes exist ===');
  const hasForward = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules || [];
        for (const r of rules) {
          if (r.cssText && r.cssText.includes('css-page-enter-forward')) return true;
        }
      } catch {}
    }
    return false;
  });
  const hasBackward = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules || [];
        for (const r of rules) {
          if (r.cssText && r.cssText.includes('css-page-enter-backward')) return true;
        }
      } catch {}
    }
    return false;
  });
  console.log(`  ${hasForward ? '✓' : '✗'} css-page-enter-forward keyframe present`);
  console.log(`  ${hasBackward ? '✓' : '✗'} css-page-enter-backward keyframe present`);

  await browser.close();
})();
