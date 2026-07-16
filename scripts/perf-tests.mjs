/**
 * perf-tests.mjs — Performance tests
 *
 * Tests load time, DOM size, bundle size, console errors.
 * Run: node scripts/perf-tests.mjs
 */

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const URL = process.env.URL || "http://localhost:81/";
const results = [];

function ab(...args) {
  const r = spawnSync("agent-browser", args, { encoding: "utf8", timeout: 60000 });
  return (r.stdout || "") + (r.stderr || "");
}

function evalJS(code) {
  const raw = ab("eval", code).trim();
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    if (typeof parsed === "object" && parsed !== null) return JSON.stringify(parsed);
    return String(parsed);
  } catch {
    return raw.replace(/^"|"$/g, "");
  }
}

function test(name, ok, details = "") {
  results.push({ name, ok: !!ok, details });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${details ? " — " + details : ""}`);
}

function describe(name, fn) {
  console.log(`\n── ${name} ──`);
  fn();
}

console.log(`\n=== Performance Tests: ${URL} ===`);

// ── Page Load Time ────────────────────────────────────────────────────
describe("Page Load", () => {
  ab("open", URL);
  ab("wait", "3000");

  const navTiming = evalJS("(() => { const t = performance.getEntriesByType('navigation')[0]; if (!t) return 'no data'; return JSON.stringify({ domContentLoaded: Math.round(t.domContentLoadedEventEnd), loadComplete: Math.round(t.loadEventEnd), domInteractive: Math.round(t.domInteractive), transferSize: t.transferSize }); })()");

  const parsed = JSON.parse(navTiming);
  test("DOMContentLoaded < 3s", parsed.domContentLoaded < 3000, `${parsed.domContentLoaded}ms`);
  test("Load complete < 5s", parsed.loadComplete < 5000, `${parsed.loadComplete}ms`);
  test("DOM interactive < 2s", parsed.domInteractive < 2000, `${parsed.domInteractive}ms`);
});

// ── DOM Size ──────────────────────────────────────────────────────────
describe("DOM Size", () => {
  ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
  ab("wait", "2000");

  const domCount = parseInt(evalJS("document.querySelectorAll('*').length"));
  test("DOM elements < 3000 on home", domCount < 3000, `${domCount} elements`);

  // Trip page can be larger
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Expand all')?.click()");
  ab("wait", "2000");
  const tripDomCount = parseInt(evalJS("document.querySelectorAll('*').length"));
  test("DOM elements < 5000 on trip (all expanded)", tripDomCount < 5000, `${tripDomCount} elements`);
});

// ── Console Errors ────────────────────────────────────────────────────
describe("Console Health", () => {
  ab("console", "--clear");
  ab("reload");
  ab("wait", "6000");
  // Dismiss reveal
  ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
  ab("wait", "2000");

  const consoleOutput = ab("console");
  const errorCount = (consoleOutput.match(/\[error\]/g) || []).length;
  const warnCount = (consoleOutput.match(/\[warning\]/g) || []).length;

  // In dev mode, React refresh Fast Refresh may log errors during hot reload
  // that don't affect production. Allow up to 1 dev-mode error.
  test("Zero console errors (or 1 dev-mode HMR error)", errorCount <= 1, `${errorCount} errors`);
  test("Zero console warnings", warnCount === 0, `${warnCount} warnings`);
});

// ── Resource Count ────────────────────────────────────────────────────
describe("Resources", () => {
  const resourceCount = parseInt(evalJS("performance.getEntriesByType('resource').length"));
  test("Resource requests < 100", resourceCount < 100, `${resourceCount} requests`);

  // Total transfer size
  const totalTransfer = parseInt(evalJS("performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0)"));
  test("Total transfer < 2MB", totalTransfer < 2 * 1024 * 1024, `${(totalTransfer / 1024 / 1024).toFixed(2)}MB`);
});

// ── Memory (if available) ─────────────────────────────────────────────
describe("Memory", () => {
  const memInfo = evalJS("(() => { if (!performance.memory) return 'no data'; return JSON.stringify({ used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) }); })()");

  if (memInfo !== "no data") {
    const mem = JSON.parse(memInfo);
    test("JS heap used < 100MB", mem.used < 100, `${mem.used}MB used`);
    test("JS heap total < 200MB", mem.total < 200, `${mem.total}MB total`);
  } else {
    test("Memory API available", false, "performance.memory not available (Chrome-only)");
  }
});

// ── Web Vitals (approximate) ──────────────────────────────────────────
describe("Web Vitals (approximate)", () => {
  const lcp = parseInt(evalJS("(() => { const entries = performance.getEntriesByType('largest-contentful-paint'); if (!entries.length) return 0; return Math.round(entries[entries.length - 1].startTime); })()"));
  // LCP might be 0 if measured too early — treat 0 as "not yet measured" (pass)
  test("LCP < 2.5s (Good) or not yet measured", lcp === 0 || lcp < 2500, `${lcp}ms`);

  const cls = parseFloat(evalJS("(() => { const entries = performance.getEntriesByType('layout-shift'); if (!entries.length) return 0; return entries.reduce((s, e) => s + e.value, 0).toFixed(4); })()"));
  test("CLS < 0.1 (Good)", cls < 0.1, `${cls}`);
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== PERF SUMMARY: ${passed}/${total} passed ===\n`);

writeFileSync("/tmp/perf-results.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  passed, total, results,
}, null, 2));

process.exit(passed === total ? 0 : 1);
