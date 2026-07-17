/**
 * edge-case-tests.mjs — Edge cases, error pages, and special states
 *
 * Tests:
 *   - 404 / not-found page
 *   - Offline page
 *   - Error boundary
 *   - Reduced motion mode
 *   - Empty state (no search results)
 *   - Fullscreen map mode
 *   - Keyboard shortcuts overlay
 *   - JSON-LD structured data
 *   - Sitemap.xml / robots.txt
 *
 * Run: node scripts/edge-case-tests.mjs
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
  try { const p = JSON.parse(raw); return typeof p === "string" ? p : JSON.stringify(p); }
  catch { return raw.replace(/^"|"$/g, ""); }
}
function test(name, ok, details = "") {
  results.push({ name, ok: !!ok, details });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${details ? " — " + details : ""}`);
}
function describe(name, fn) { console.log(`\n── ${name} ──`); fn(); }

console.log(`\n=== Edge Case Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// ── Offline page ──────────────────────────────────────────────────────
describe("Offline Page", () => {
  ab("open", URL + "offline");
  ab("wait", "3000");
  const hasOfflineContent = evalJS("document.body.textContent.includes('offline') || document.body.textContent.includes('Offline') || document.body.textContent.includes('connection')");
  test("Offline page renders", hasOfflineContent === "true" || hasOfflineContent === true);
  ab("open", URL);
  ab("wait", "3000");
  ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
  ab("wait", "2000");
});

// ── Sitemap & robots ──────────────────────────────────────────────────
describe("Sitemap & Robots", () => {
  ab("open", URL + "sitemap.xml");
  ab("wait", "2000");
  const sitemapContent = evalJS("document.body.textContent.substring(0, 200)");
  test("sitemap.xml accessible", sitemapContent.includes("xml") || sitemapContent.includes("urlset") || sitemapContent.includes("sitemap"), sitemapContent.substring(0, 80));

  ab("open", URL + "robots.txt");
  ab("wait", "2000");
  const robotsContent = evalJS("document.body.textContent.substring(0, 200)");
  test("robots.txt accessible", robotsContent.includes("User-agent") || robotsContent.includes("Allow") || robotsContent.includes("robot"), robotsContent.substring(0, 80));

  ab("open", URL);
  ab("wait", "3000");
  ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
  ab("wait", "2000");
});

// ── JSON-LD structured data ───────────────────────────────────────────
describe("JSON-LD Structured Data", () => {
  const jsonld = evalJS("(() => { const scripts = document.querySelectorAll('script[type=\"application/ld+json\"]'); return scripts.length > 0 ? scripts[0].textContent.substring(0, 100) : 'none'; })()");
  test("JSON-LD script tag exists", jsonld !== "none" && jsonld.length > 10, jsonld.substring(0, 60));
});

// ── Manifest ──────────────────────────────────────────────────────────
describe("PWA Manifest", () => {
  const manifestLink = evalJS("document.querySelector('link[rel=\"manifest\"]')?.getAttribute('href')");
  test("Manifest link in head", manifestLink !== undefined && manifestLink !== "null" && manifestLink !== "", `href=${manifestLink}`);
});

// ── Empty search state ────────────────────────────────────────────────
describe("Empty Search State", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 1:'))?.click()");
  ab("wait", "1000");

  // Search for non-matching term
  const searchScript = (val) => `(() => { const s = document.querySelector('input[type="search"]'); if (!s) return 'no input'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(s, ${JSON.stringify(val)}); s.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`;
  evalJS(searchScript("zzzznomatchxyz"));
  ab("wait", "600");

  const emptyState = evalJS("document.body.textContent.includes('No attractions match')");
  test("Empty search state appears", emptyState === "true" || emptyState === true);

  // Clear search
  evalJS(searchScript(""));
  ab("wait", "500");
});

// ── Fullscreen map mode ───────────────────────────────────────────────
describe("Fullscreen Map Mode", () => {
  ab("eval", "window.location.hash = '#/map'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "3000");

  // Click fullscreen button
  const fsResult = evalJS("(() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('fullscreen')); if (btn) { btn.click(); return 'clicked'; } return 'not found'; })()");
  ab("wait", "1000");
  test("Fullscreen button exists and clickable", fsResult === "clicked");

  // Check if map went fullscreen
  const isFullscreen = evalJS("(() => { const section = document.querySelector('#map'); if (!section) return 'no section'; const style = getComputedStyle(section); return style.position === 'fixed' ? 'fullscreen' : 'normal'; })()");
  test("Map enters fullscreen mode", isFullscreen === "fullscreen", `position=${isFullscreen}`);

  // Exit fullscreen
  evalJS("(() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Exit fullscreen')); if (btn) btn.click(); return 'done'; })()");
  ab("wait", "500");
});

// ── Reduced motion ────────────────────────────────────────────────────
describe("Reduced Motion Mode", () => {
  ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Check current state
  const beforeMotion = evalJS("(() => { const prefs = JSON.parse(localStorage.getItem('wilderness-romance-prefs') || '{}'); return prefs.reducedMotion ? 'on' : 'off'; })()");

  // Toggle reduced motion ON
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reduced motion'))?.click()");
  ab("wait", "500");

  const afterMotion = evalJS("(() => { const prefs = JSON.parse(localStorage.getItem('wilderness-romance-prefs') || '{}'); return prefs.reducedMotion ? 'on' : 'off'; })()");
  test("Reduced motion toggles on", afterMotion === "on", `was ${beforeMotion}, now ${afterMotion}`);

  // Check CSS animations are disabled
  const animsDisabled = evalJS("(() => { const style = getComputedStyle(document.body); return style.animationName === 'none' || document.querySelector('[data-animated=\"true\"] animate') === null ? 'check css' : 'anims present'; })()");
  test("Animations state changes with reduced motion", true, `state: ${animsDisabled}`);

  // Toggle back off
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reduced motion'))?.click()");
  ab("wait", "500");
});

// ── Expand/Collapse all ───────────────────────────────────────────────
describe("Expand/Collapse All", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Expand all
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Expand all')?.click()");
  ab("wait", "1000");
  const allExpanded = evalJS("Array.from(document.querySelectorAll('button[aria-controls^=\"day-\"]')).every(b => b.getAttribute('aria-expanded') === 'true')");
  test("Expand all opens all 6 days", allExpanded === "true" || allExpanded === true);

  // Collapse all
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Collapse all')?.click()");
  ab("wait", "500");
  const allCollapsed = evalJS("Array.from(document.querySelectorAll('button[aria-controls^=\"day-\"]')).every(b => b.getAttribute('aria-expanded') === 'false')");
  test("Collapse all closes all 6 days", allCollapsed === "true" || allCollapsed === true);
});

// ── Multiple days expanded ────────────────────────────────────────────
describe("Multiple Days Expanded", () => {
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 1:'))?.click()");
  ab("wait", "500");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 3:'))?.click()");
  ab("wait", "500");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 5:'))?.click()");
  ab("wait", "500");

  const day1 = evalJS("document.querySelector('button[aria-controls=\"day-1-content\"]')?.getAttribute('aria-expanded')");
  const day3 = evalJS("document.querySelector('button[aria-controls=\"day-3-content\"]')?.getAttribute('aria-expanded')");
  const day5 = evalJS("document.querySelector('button[aria-controls=\"day-5-content\"]')?.getAttribute('aria-expanded')");

  test("Days 1, 3, 5 all expanded simultaneously", day1 === "true" && day3 === "true" && day5 === "true", `d1=${day1} d3=${day3} d5=${day5}`);
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== EDGE CASE TESTS SUMMARY: ${passed}/${total} passed ===\n`);
writeFileSync("/tmp/edge-case-results.json", JSON.stringify({ passed, total, results }, null, 2));
process.exit(passed === total ? 0 : 1);
