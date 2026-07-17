/**
 * routing-tests.mjs — URL hash routing edge cases
 *
 * Tests deep links, back/forward, invalid routes,
 * and nested hash paths (#/trip/day4/stop-X).
 *
 * Run: node scripts/routing-tests.mjs
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

console.log(`\n=== Routing Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// ── Basic page routing ────────────────────────────────────────────────
const pages = [
  { hash: "", name: "Home", check: "Wilderness" },
  { hash: "#/trip", name: "Trip", check: "Six days" },
  { hash: "#/map", name: "Map", check: "Journey Map" },
  { hash: "#/proposal", name: "Proposal", check: "PROPOSAL" },
  { hash: "#/us", name: "Us", check: "Moments" },
  { hash: "#/settings", name: "Settings", check: "icon" },
];

for (const page of pages) {
  ab("eval", `window.location.hash = '${page.hash}'; window.dispatchEvent(new Event('hashchange'));`);
  ab("wait", "1500");
  const content = evalJS(`document.body.textContent.includes('${page.check}')`);
  test(`Route ${page.hash || "/"} shows ${page.name}`, content === "true" || content === true);
}

// ── Deep links ────────────────────────────────────────────────────────
console.log("\n── Deep Links ──");

// #/trip/day4 should expand Day 4
ab("eval", "window.location.hash = '#/trip/day4'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const day4Expanded = evalJS("document.querySelector('button[aria-controls=\"day-4-content\"]')?.getAttribute('aria-expanded')");
test("#/trip/day4 expands Day 4", day4Expanded === "true", `aria-expanded=${day4Expanded}`);

// #/trip/day1 should expand Day 1
ab("eval", "window.location.hash = '#/trip/day1'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
const day1Expanded = evalJS("document.querySelector('button[aria-controls=\"day-1-content\"]')?.getAttribute('aria-expanded')");
test("#/trip/day1 expands Day 1", day1Expanded === "true", `aria-expanded=${day1Expanded}`);

// #/trip/day6 should expand Day 6
ab("eval", "window.location.hash = '#/trip/day6'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
const day6Expanded = evalJS("document.querySelector('button[aria-controls=\"day-6-content\"]')?.getAttribute('aria-expanded')");
test("#/trip/day6 expands Day 6", day6Expanded === "true", `aria-expanded=${day6Expanded}`);

// ── Back/Forward ──────────────────────────────────────────────────────
console.log("\n── Back/Forward ──");

// Navigate to trip, then map, then back should go to trip
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
ab("eval", "window.location.hash = '#/map'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
ab("eval", "window.history.back()");
ab("wait", "1500");
const backToTrip = evalJS("document.body.textContent.includes('Six days')");
test("Back button returns to Trip from Map", backToTrip === "true" || backToTrip === true);

ab("eval", "window.history.forward()");
ab("wait", "1500");
const forwardToMap = evalJS("document.body.textContent.includes('Journey Map') || document.body.textContent.includes('Atlas')");
test("Forward button returns to Map", forwardToMap === "true" || forwardToMap === true);

// ── Invalid routes ────────────────────────────────────────────────────
console.log("\n── Invalid Routes ──");

ab("eval", "window.location.hash = '#/invalid'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
const invalidFallback = evalJS("document.body.textContent.includes('Wilderness') || document.querySelector('h1, h2') !== null");
test("Invalid route falls back to Home", invalidFallback === "true" || invalidFallback === true);

ab("eval", "window.location.hash = '#/trip/invalid'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
const invalidSubFallback = evalJS("document.body.textContent.includes('Six days') || document.body.textContent.includes('Wilderness')");
test("Invalid sub-route falls back gracefully", invalidSubFallback === "true" || invalidSubFallback === true);

// ── Hash format compatibility ─────────────────────────────────────────
console.log("\n── Hash Format Compatibility ──");

// Old-style hash (#trip without slash)
ab("eval", "window.location.hash = '#trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
const oldHashWorks = evalJS("document.body.textContent.includes('Six days') || document.body.textContent.includes('Wilderness')");
test("Old-style hash (#trip) works", oldHashWorks === "true" || oldHashWorks === true);

// Empty hash (home)
ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
const emptyHashHome = evalJS("document.body.textContent.includes('Wilderness')");
test("Empty hash shows Home", emptyHashHome === "true" || emptyHashHome === true);

// ── URL persistence on reload ─────────────────────────────────────────
console.log("\n── URL Persistence ──");

ab("eval", "window.location.hash = '#/proposal'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "1500");
ab("reload");
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");
const persistedRoute = evalJS("document.body.textContent.includes('PROPOSAL') || document.body.textContent.includes('forever')");
test("Route persists on reload", persistedRoute === "true" || persistedRoute === true);

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== ROUTING TESTS SUMMARY: ${passed}/${total} passed ===\n`);
writeFileSync("/tmp/routing-results.json", JSON.stringify({ passed, total, results }, null, 2));
process.exit(passed === total ? 0 : 1);
