/**
 * perf_audit.mjs
 *
 * Performance audit using Playwright's built-in metrics.
 * Captures:
 *   - Page load time
 *   - DOM content loaded
 *   - First paint
 *   - First contentful paint
 *   - Largest contentful paint
 *   - Number of requests
 *   - Total transfer size
 *   - JS heap size
 *
 * Runs against all 5 pages on mobile viewport.
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const LOG_DIR = '/home/z/my-project/scripts/logs';
mkdirSync(LOG_DIR, { recursive: true });

const TABS = ['Home', 'Trip', 'Map', 'Proposal', 'Us'];

(async () => {
  const browser = await chromium.launch();
  const log = [];

  for (const tab of TABS) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Collect performance entries
    const metrics = {
      tab,
      domContentLoaded: 0,
      load: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      requestCount: 0,
      transferSize: 0,
      jsHeapUsed: 0,
    };

    // Listen for responses to count requests and sizes
    page.on('response', (res) => {
      metrics.requestCount++;
      const headers = res.headers();
      // Approximate transfer size from content-length
      const len = parseInt(headers['content-length'] || '0', 10);
      if (len > 0) metrics.transferSize += len;
    });

    // Start CDP session for performance metrics
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    await client.send('Page.enable');

    // Navigate to home first, then click the tab
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000); // boot

    // Get navigation timing
    const navTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      const nav = entries[0] || {};
      return {
        domContentLoaded: nav.domContentLoadedEventEnd || 0,
        load: nav.loadEventEnd || 0,
      };
    });
    metrics.domContentLoaded = navTiming.domContentLoaded;
    metrics.load = navTiming.load;

    // Get paint timing
    const paintTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fp = entries.find(e => e.name === 'first-paint') || {};
      const fcp = entries.find(e => e.name === 'first-contentful-paint') || {};
      return {
        firstPaint: fp.startTime || 0,
        firstContentfulPaint: fcp.startTime || 0,
      };
    });
    metrics.firstPaint = paintTiming.firstPaint;
    metrics.firstContentfulPaint = paintTiming.firstContentfulPaint;

    // Click the tab
    await page.locator(`nav[aria-label="Page navigation"] button[aria-label="${tab}"]`).click({ force: true });
    await page.waitForTimeout(2000);

    // Get LCP (via PerformanceObserver)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const entries = performance.getEntriesByType('largest-contentful-paint');
        const last = entries[entries.length - 1];
        resolve(last ? last.startTime : 0);
      });
    });
    metrics.largestContentfulPaint = lcp;

    // Get JS heap
    const perfMetrics = await client.send('Performance.getMetrics');
    const jsHeap = perfMetrics.metrics.find(m => m.name === 'JSHeapUsedSize');
    metrics.jsHeapUsed = jsHeap ? jsHeap.value : 0;

    log.push(metrics);
    console.log(`${tab}: FCP=${Math.round(metrics.firstContentfulPaint)}ms, LCP=${Math.round(metrics.largestContentfulPaint)}ms, Reqs=${metrics.requestCount}, Transfer=${(metrics.transferSize/1024).toFixed(1)}KB, Heap=${(metrics.jsHeapUsed/1024/1024).toFixed(1)}MB`);

    await client.detach().catch(() => {});
    await context.close();
  }

  await browser.close();

  // Write report
  const report = [
    '=== Performance Audit ===',
    '',
    ...log.map(m => [
      `--- ${m.tab} ---`,
      `  DOM Content Loaded: ${Math.round(m.domContentLoaded)}ms`,
      `  Load event:         ${Math.round(m.load)}ms`,
      `  First Paint:        ${Math.round(m.firstPaint)}ms`,
      `  First Contentful:   ${Math.round(m.firstContentfulPaint)}ms`,
      `  Largest Contentful: ${Math.round(m.largestContentfulPaint)}ms`,
      `  Requests:           ${m.requestCount}`,
      `  Transfer size:      ${(m.transferSize/1024).toFixed(1)} KB`,
      `  JS Heap used:       ${(m.jsHeapUsed/1024/1024).toFixed(1)} MB`,
      '',
    ].join('\n')),
    '',
    '=== Summary ===',
    `Average FCP: ${Math.round(log.reduce((s,m) => s + m.firstContentfulPaint, 0) / log.length)}ms`,
    `Average LCP: ${Math.round(log.reduce((s,m) => s + m.largestContentfulPaint, 0) / log.length)}ms`,
    `Total requests: ${log.reduce((s,m) => s + m.requestCount, 0)}`,
    `Total transfer: ${(log.reduce((s,m) => s + m.transferSize, 0) / 1024 / 1024).toFixed(2)} MB`,
    `Peak JS heap:  ${(Math.max(...log.map(m => m.jsHeapUsed)) / 1024 / 1024).toFixed(1)} MB`,
  ].join('\n');

  writeFileSync(`${LOG_DIR}/performance.log`, report);
  console.log('\n' + report);
})();
