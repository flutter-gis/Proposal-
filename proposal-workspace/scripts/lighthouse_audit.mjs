/**
 * lighthouse_audit.mjs
 *
 * Runs Lighthouse against the Wilderness Romance PWA.
 * Captures Performance, Accessibility, Best Practices, and SEO scores.
 * Writes results to scripts/logs/lighthouse.log
 */

import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const LOG_DIR = '/home/z/my-project/scripts/logs';
mkdirSync(LOG_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222'],
  });

  const log = [];
  const writeLog = (msg) => {
    console.log(msg);
    log.push(msg);
  };

  writeLog('=== Lighthouse Performance Audit ===\n');

  // Run Lighthouse on the home page (mobile emulation)
  writeLog('Running Lighthouse (mobile emulation)...');
  const result = await lighthouse(BASE, {
    port: 9222,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    preset: 'mobile',
  });

  const scores = {
    performance: Math.round((result.lhr.categories.performance?.score || 0) * 100),
    accessibility: Math.round((result.lhr.categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((result.lhr.categories['best-practices']?.score || 0) * 100),
    seo: Math.round((result.lhr.categories.seo?.score || 0) * 100),
  };

  writeLog(`\n--- Scores (0-100) ---`);
  writeLog(`Performance:    ${scores.performance}`);
  writeLog(`Accessibility:  ${scores.accessibility}`);
  writeLog(`Best Practices: ${scores.bestPractices}`);
  writeLog(`SEO:            ${scores.seo}`);

  // Core Web Vitals
  writeLog(`\n--- Core Web Vitals ---`);
  const metrics = result.lhr.audits;
  if (metrics['first-contentful-paint']) {
    writeLog(`FCP:  ${Math.round(metrics['first-contentful-paint'].numericValue)}ms`);
  }
  if (metrics['largest-contentful-paint']) {
    writeLog(`LCP:  ${Math.round(metrics['largest-contentful-paint'].numericValue)}ms`);
  }
  if (metrics['cumulative-layout-shift']) {
    writeLog(`CLS:  ${metrics['cumulative-layout-shift'].numericValue.toFixed(3)}`);
  }
  if (metrics['total-blocking-time']) {
    writeLog(`TBT:  ${Math.round(metrics['total-blocking-time'].numericValue)}ms`);
  }
  if (metrics['speed-index']) {
    writeLog(`SI:   ${Math.round(metrics['speed-index'].numericValue)}ms`);
  }

  // Performance opportunities
  writeLog(`\n--- Top Performance Opportunities ---`);
  const opportunities = result.lhr.audits;
  const opps = Object.values(opportunities)
    .filter(a => a.details && a.details.type === 'opportunity' && a.score !== null && a.score < 1)
    .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
    .slice(0, 5);
  for (const opp of opps) {
    const savings = Math.round(opp.numericValue || 0);
    writeLog(`  • ${opp.title}: ${savings}ms potential savings`);
  }

  // Failed audits
  writeLog(`\n--- Failed Audits ---`);
  const failed = Object.values(result.lhr.audits)
    .filter(a => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'manual')
    .sort((a, b) => (a.score || 0) - (b.score || 0));
  for (const audit of failed.slice(0, 10)) {
    const score = Math.round((audit.score || 0) * 100);
    writeLog(`  [${score}] ${audit.id}: ${audit.title}`);
    if (audit.description) {
      writeLog(`        ${audit.description.slice(0, 120)}`);
    }
  }

  writeFileSync(`${LOG_DIR}/lighthouse.log`, log.join('\n'));
  writeFileSync(`${LOG_DIR}/lighthouse.json`, JSON.stringify(result.lhr, null, 2));

  await browser.close();

  console.log(`\nDone. See ${LOG_DIR}/lighthouse.log`);
})();
