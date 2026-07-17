/**
 * persistence-tests.mjs — localStorage + offline persistence tests
 *
 * Tests:
 *   - Preferences save/load (icon mode, theme, reduced motion)
 *   - Saved gems (RoadsideAttractionsCard bookmark persistence)
 *   - Service worker cache (Download for Offline)
 *   - Theme persistence across reload
 *
 * Run: node scripts/persistence-tests.mjs
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

console.log(`\n=== Persistence Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// ── Preferences storage ───────────────────────────────────────────────
console.log("\n── Preferences Storage ──");

// Clear existing prefs
ab("eval", "localStorage.removeItem('wilderness-romance-prefs')");
ab("wait", "500");

// Go to settings, switch to manual + Ring icon
ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Manual')?.click()");
ab("wait", "500");
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Ring icon')?.click()");
ab("wait", "1000");

// Check localStorage has the prefs
const storedPrefs = evalJS("localStorage.getItem('wilderness-romance-prefs')");
test("Preferences saved to localStorage", storedPrefs !== null && storedPrefs !== "null", `stored=${storedPrefs?.substring(0, 60)}`);

let prefs;
try { prefs = JSON.parse(storedPrefs); } catch { prefs = {}; }
test("Stored manualIcon = ring", prefs.manualIcon === "ring", `manualIcon=${prefs.manualIcon}`);
test("Stored iconMode = manual", prefs.iconMode === "manual", `iconMode=${prefs.iconMode}`);

// ── Theme persistence across reload ───────────────────────────────────
console.log("\n── Theme Persistence ──");

const beforeReload = evalJS("document.documentElement.getAttribute('data-theme')");
test("Theme applied before reload", beforeReload === "brass", `data-theme=${beforeReload}`);

ab("reload");
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

const afterReload = evalJS("document.documentElement.getAttribute('data-theme')");
test("Theme persists after reload", afterReload === "brass", `data-theme=${afterReload}`);

// ── Saved gems persistence ────────────────────────────────────────────
console.log("\n── Saved Gems Persistence ──");

// Clear saved gems
ab("eval", "localStorage.removeItem('wilderness-saved-gems')");
ab("wait", "500");

// Go to trip, expand Day 1, save a gem
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 1:'))?.click()");
ab("wait", "1000");

// Click first Save button
evalJS("document.querySelector('button[aria-label^=\"Save \"]')?.click()");
ab("wait", "500");

const savedGems = evalJS("localStorage.getItem('wilderness-saved-gems')");
test("Saved gem stored in localStorage", savedGems !== null && savedGems !== "null", `stored=${savedGems?.substring(0, 60)}`);

let gems;
try { gems = JSON.parse(savedGems) || []; } catch { gems = []; }
if (!Array.isArray(gems)) gems = [];
test("Saved gems array has 1 entry", gems.length === 1, `${gems.length} entries`);

// Reload and verify persistence
ab("reload");
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

const gemsAfterReload = evalJS("localStorage.getItem('wilderness-saved-gems')");
test("Saved gems persist after reload", gemsAfterReload !== null && gemsAfterReload !== "null");

// ── Show Saved filter ─────────────────────────────────────────────────
console.log("\n── Show Saved Filter ──");

ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 1:'))?.click()");
ab("wait", "1000");

const showSavedBtn = evalJS("Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Show saved'))");
test("'Show saved' filter appears after saving", showSavedBtn === "true" || showSavedBtn === true);

// Click "Show saved"
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Show saved'))?.click()");
ab("wait", "500");
const showingSaved = evalJS("Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Showing saved'))");
test("'Show saved' toggles to 'Showing saved'", showingSaved === "true" || showingSaved === true);

// Clean up
ab("eval", "localStorage.removeItem('wilderness-saved-gems')");

// ── Service Worker Cache ──────────────────────────────────────────────
console.log("\n── Service Worker Cache ──");

const swExists = evalJS("'serviceWorker' in navigator");
test("Service Worker API available", swExists === "true");

const cacheApi = evalJS("'caches' in window");
test("Cache API available", cacheApi === "true");

// Download for Offline button
ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const downloadBtn = evalJS("Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Download for Offline'))");
test("Download for Offline button exists", downloadBtn === "true" || downloadBtn === true);

// ── Reduced motion persistence ────────────────────────────────────────
console.log("\n── Reduced Motion Persistence ──");

// Enable reduced motion
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reduced motion'))?.click()");
ab("wait", "500");

const prefsAfterMotion = evalJS("localStorage.getItem('wilderness-romance-prefs')");
let motionPrefs;
try { motionPrefs = JSON.parse(prefsAfterMotion); } catch { motionPrefs = {}; }
test("Reduced motion saved to localStorage", motionPrefs.reducedMotion === true, `reducedMotion=${motionPrefs.reducedMotion}`);

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== PERSISTENCE TESTS SUMMARY: ${passed}/${total} passed ===\n`);
writeFileSync("/tmp/persistence-results.json", JSON.stringify({ passed, total, results }, null, 2));
process.exit(passed === total ? 0 : 1);
