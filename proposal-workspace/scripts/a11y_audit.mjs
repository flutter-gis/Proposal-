/**
 * a11y_audit.mjs
 *
 * Runs axe-core against all 5 pages of the Wilderness Romance PWA.
 * Captures accessibility violations and writes them to:
 *   /home/z/my-project/scripts/logs/a11y.log
 *
 * Tests both mobile (375x812) and desktop (1280x800) viewports.
 */

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const LOG_DIR = '/home/z/my-project/scripts/logs';
mkdirSync(LOG_DIR, { recursive: true });
writeFileSync(`${LOG_DIR}/a11y.log`, '');

const log = (msg) => appendFileSync(`${LOG_DIR}/a11y.log`, msg + '\n');

const TABS = ['Home', 'Trip', 'Map', 'Proposal', 'Us', 'Settings'];
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 800 },
];

(async () => {
  const browser = await chromium.launch();
  const totalViolations = { count: 0, byRule: {} };
  const totalPasses = { count: 0 };

  for (const vp of VIEWPORTS) {
    log(`\n${'='.repeat(60)}`);
    log(`VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    log('='.repeat(60));

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3500); // boot sequence

    for (const tab of TABS) {
      log(`\n--- Tab: ${tab} ---`);
      await page.locator(`nav[aria-label="Page navigation"] button[aria-label="${tab}"]`).click({ force: true });
      await page.waitForTimeout(1200);

      try {
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        const violations = results.violations;
        const passes = results.passes;

        if (violations.length === 0) {
          log(`  ✓ No violations`);
          totalPasses.count++;
        } else {
          log(`  ✗ ${violations.length} violation(s):`);
          for (const v of violations) {
            totalViolations.count++;
            totalViolations.byRule[v.id] = (totalViolations.byRule[v.id] || 0) + 1;
            log(`    [${v.id}] ${v.description}`);
            log(`      Impact: ${v.impact}`);
            log(`      Help: ${v.helpUrl}`);
            log(`      ${v.nodes.length} node(s) affected`);
            // Show first 3 node targets
            for (const node of v.nodes.slice(0, 3)) {
              log(`        - ${node.target.join(' > ')}`);
              if (node.failureSummary) {
                log(`          ${node.failureSummary.slice(0, 120)}`);
              }
            }
          }
        }

        log(`  ✓ ${passes.length} rules passed`);
      } catch (e) {
        log(`  ERROR running axe: ${e.message}`);
      }
    }

    await context.close();
  }

  await browser.close();

  log(`\n${'='.repeat(60)}`);
  log(`SUMMARY`);
  log('='.repeat(60));
  log(`Total violations: ${totalViolations.count}`);
  log(`Pages with 0 violations: ${totalPasses.count}/${TABS.length * VIEWPORTS.length}`);
  log(`\nViolations by rule:`);
  for (const [rule, count] of Object.entries(totalViolations.byRule).sort((a, b) => b[1] - a[1])) {
    log(`  ${rule}: ${count}`);
  }

  console.log(`\nA11y audit complete. ${totalViolations.count} violations found.`);
  console.log(`See ${LOG_DIR}/a11y.log for details.`);
})();
