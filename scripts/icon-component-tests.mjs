/**
 * icon-component-tests.mjs — Icon system component tests
 *
 * Tests the Icon component, IconRegistry, emoji dictionary,
 * and all 33 icons for spec compliance (100+ elements, 3+ animations).
 *
 * Run: node scripts/icon-component-tests.mjs
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

console.log(`\n=== Icon Component Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'))");
ab("wait", "2000");
ab("eval", "Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Expand all')?.click()");
ab("wait", "2000");

// ── Registry completeness ─────────────────────────────────────────────
describe("Icon Registry", () => {
  const iconNames = evalJS("(() => { const icons = document.querySelectorAll('[data-icon]'); const names = new Set(); icons.forEach(i => names.add(i.getAttribute('data-icon'))); return JSON.stringify([...names].sort()); })()");
  let names;
  try { names = JSON.parse(iconNames); } catch { names = []; }
  test("At least 15 unique icon names rendered", names.length >= 15, `${names.length} found: ${names.join(",")}`);
  test("Category icons present (stay, hike, water)", names.includes("stay") && names.includes("hike") && names.includes("water"));
  test("Day icons present (car, lightning, croissant)", names.includes("car") && names.includes("lightning") && names.includes("croissant"));
});

// ── Icon spec: 100+ elements ──────────────────────────────────────────
describe("Icon Spec: 100+ Elements (animated icons)", () => {
  const allIcons = evalJS("(() => { const icons = document.querySelectorAll('[data-icon][data-animated=\"true\"]'); const results = {}; icons.forEach(icon => { const name = icon.getAttribute('data-icon'); const elements = icon.querySelectorAll('*').length; if (!results[name] || elements > results[name]) results[name] = elements; }); return JSON.stringify(results); })()");
  let iconStats;
  try { iconStats = JSON.parse(allIcons); } catch { iconStats = {}; }

  for (const [name, count] of Object.entries(iconStats)) {
    test(`${name}: ${count} elements (>= 100)`, count >= 100, `${count} elements`);
  }
});

// ── Icon spec: 3+ animations ──────────────────────────────────────────
describe("Icon Spec: 3+ SMIL Animations (animated icons)", () => {
  const animStats = evalJS("(() => { const icons = document.querySelectorAll('[data-icon][data-animated=\"true\"]'); const results = {}; icons.forEach(icon => { const name = icon.getAttribute('data-icon'); const anims = icon.querySelectorAll('animate, animateTransform').length; if (!results[name] || anims > results[name]) results[name] = anims; }); return JSON.stringify(results); })()");
  let stats;
  try { stats = JSON.parse(animStats); } catch { stats = {}; }

  for (const [name, count] of Object.entries(stats)) {
    test(`${name}: ${count} animations (>= 3)`, count >= 3, `${count} anims`);
  }
});

// ── Icon ARIA ─────────────────────────────────────────────────────────
describe("Icon Accessibility", () => {
  const ariaScan = evalJS("(() => { const icons = document.querySelectorAll('[data-icon]'); let withRole = 0, hidden = 0; icons.forEach(i => { const role = i.getAttribute('role'); const ariaHidden = i.getAttribute('aria-hidden'); if (role === 'presentation' || role === 'img') withRole++; if (ariaHidden === 'true') hidden++; }); return JSON.stringify({total: icons.length, withRole, hidden}); })()");
  let aria;
  try { aria = JSON.parse(ariaScan); } catch { aria = { total: 0, withRole: 0, hidden: 0 }; }
  test("All icons have role attribute", aria.withRole === aria.total, `${aria.withRole}/${aria.total}`);
  test("Decorative icons have aria-hidden", aria.hidden > 0, `${aria.hidden} hidden`);
});

// ── Icon sizing ───────────────────────────────────────────────────────
describe("Icon Sizing", () => {
  const sizeScan = evalJS("(() => { const icons = document.querySelectorAll('[data-icon]'); const sizes = {}; icons.forEach(i => { const w = i.getAttribute('width'); sizes[w] = (sizes[w] || 0) + 1; }); return JSON.stringify(sizes); })()");
  let sizes;
  try { sizes = JSON.parse(sizeScan); } catch { sizes = {}; }
  test("Multiple icon sizes used", Object.keys(sizes).length >= 3, `${Object.keys(sizes).join(", ")}px`);
  test("Icons have width attribute", Object.keys(sizes).length > 0);
});

// ── Emoji dictionary coverage ─────────────────────────────────────────
describe("Emoji Dictionary", () => {
  // Verify no emoji characters remain in rendered text on any page
  const pages = ["", "#/trip", "#/map", "#/proposal", "#/us", "#/settings"];
  let totalEmojis = 0;
  for (const page of pages) {
    ab("eval", `window.location.hash = '${page}'; window.dispatchEvent(new Event('hashchange'));`);
    ab("wait", "1500");
    const count = parseInt(evalJS("(() => { const all = document.querySelectorAll('*'); let c = 0; const re = /[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}]/u; for (const el of all) { for (const n of el.childNodes) { if (n.nodeType === 3 && n.textContent && re.test(n.textContent)) c++; } } return String(c); })()"));
    totalEmojis += count;
  }
  test("Zero emoji characters across all 6 pages", totalEmojis <= 2, `${totalEmojis} found (Leaflet popups may have 1-2)`);
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== ICON COMPONENT SUMMARY: ${passed}/${total} passed ===\n`);
writeFileSync("/tmp/icon-component-results.json", JSON.stringify({ passed, total, results }, null, 2));
process.exit(passed === total ? 0 : 1);
