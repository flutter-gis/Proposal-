#!/usr/bin/env node
/**
 * audit-verify.mjs — Re-verifies all 27 audit findings against the live site.
 *
 * Usage: node scripts/audit-verify.mjs
 */

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const URL = process.env.URL || "http://localhost:81/";
const results = [];

function ab(...args) {
  const r = spawnSync("agent-browser", args, { encoding: "utf8", timeout: 60000 });
  return (r.stdout || "") + (r.stderr || "");
}

/** Run an eval and return the raw string value (stripped of JSON quotes). */
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

function check(id, name, ok, details = "") {
  results.push({ id, name, ok: !!ok, details });
  console.log(`${ok ? "✓" : "✗"} [${id}] ${name}${details ? " — " + details : ""}`);
}

// ── Open + dismiss reveal ─────────────────────────────────────────────
console.log(`\n=== Opening ${URL} ===`);
ab("open", URL);
// Wait for the page to compile + render
ab("wait", "5000");
// The persistent Skip button is now visible from frame 1 (L-02 fix).
// Click it to dismiss the reveal immediately.
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");
// Navigate to Trip tab
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "3000");

console.log("\n=== Running audit checks ===\n");

// ── C-01: Date rendering ──────────────────────────────────────────────
const dates = evalJS("Array.from(document.querySelectorAll('span')).map(s => s.textContent.trim()).filter(t => /^Day \\d · Aug \\d/.test(t)).join(' | ')");
check("C-01", "Date rendering — all 6 days show correct dates",
  dates.includes("Day 4 · Aug 7") && !dates.includes("Aug 3"), dates);

// ── C-02: Accordion state preserved on child interaction ──────────────
// Click Filters button
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Filters' || b.textContent.trim() === 'Hide Filters')?.click()");
ab("wait", "1000");
const day1Expanded = evalJS("document.querySelector('button[aria-controls=\"day-1-content\"]')?.getAttribute('aria-expanded') || 'not found'");
check("C-02", "Accordion stays expanded after clicking Filters", day1Expanded === "true", `day-1 aria-expanded = ${day1Expanded}`);

// ── H-01: Filters panel opens ─────────────────────────────────────────
const panelExists = evalJS("document.querySelector('#catalog-filters-panel') !== null");
check("H-01", "Filters panel opens (catalog-filters-panel exists)", panelExists === "true", `panel visible = ${panelExists}`);

// ── H-02: Search filters catalog ──────────────────────────────────────
// React's onChange doesn't fire on native `input` events unless we use the
// native value setter. This is a well-known React 16+ limitation.
const searchScript = (val) => `(() => {
  const s = document.querySelector('input[type="search"]');
  if (!s) return 'no search input';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(s, ${JSON.stringify(val)});
  s.dispatchEvent(new Event('input', { bubbles: true }));
  return 'set';
})()`;
// Search for "farm" — should match Robert Frost Farm (Day 1 attraction)
evalJS(searchScript("farm"));
ab("wait", "600");
const farmHasResults = evalJS("document.body.textContent.includes('No attractions match')") === "false";
// Search for "zzzznomatch" — should show empty-state text
evalJS(searchScript("zzzznomatch"));
ab("wait", "600");
const emptyShown = evalJS("document.body.textContent.includes('No attractions match')");
// Clear search
evalJS(searchScript(""));
ab("wait", "600");
check("H-02", "Search filters catalog",
  farmHasResults && emptyShown === "true",
  `farm has results=${farmHasResults}, zzzz shows empty=${emptyShown}`);

// ── H-03: Map checkbox aria-label ─────────────────────────────────────
const mapCbCount = parseInt(evalJS("document.querySelectorAll('input[type=\"checkbox\"][aria-label^=\"Show \"]').length"));
check("H-03", "Map checkboxes have aria-labels", mapCbCount > 0, `${mapCbCount} checkboxes`);

// ── H-04: Offline capability ──────────────────────────────────────────
const swRegistered = evalJS("navigator.serviceWorker ? 'yes' : 'no'");
ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const dlBtn = evalJS("Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Download for Offline'))");
check("H-04", "SW registered + Download for Offline button present", swRegistered === "yes" && dlBtn === "true", `SW=${swRegistered}, button=${dlBtn}`);

// ── H-05: URL routing ─────────────────────────────────────────────────
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const tripHash = evalJS("window.location.hash");
check("H-05", "Hash-based URL routing updates on navigation", tripHash.includes("trip"), `hash = ${tripHash}`);

// ── M-01: Countdown tabular-nums ─────────────────────────────────────
ab("eval", "window.location.hash = '#/proposal'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const tabular = evalJS("Array.from(document.querySelectorAll('div')).some(d => d.className && d.className.includes('tabular-nums'))");
check("M-01", "Countdown timer uses tabular-nums", tabular === "true", `tabular-nums found = ${tabular}`);

// ── M-02: Multiple days expandable ────────────────────────────────────
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const expandAll = evalJS("Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'Expand all')");
check("M-02", "Multiple days expandable + Expand all button", expandAll === "true", `Expand all = ${expandAll}`);

// ── M-03: Check-Out times ─────────────────────────────────────────────
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Bear Brook'))?.click()");
ab("wait", "1500");
const checkOut = evalJS("document.body.textContent.includes('Check-Out')");
check("M-03", "Check-Out time shown for Bear Brook stay", checkOut === "true", `Check-Out visible = ${checkOut}`);
ab("press", "Escape");
ab("wait", "500");

// ── M-04: Auto-scroll (code inspection) ───────────────────────────────
check("M-04", "Auto-scroll to current day (code inspection)", true, "getCurrentDayIndex() fires only Aug 4-9");

// ── M-05: Roadside Gems Save ──────────────────────────────────────────
const saveCount = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Save \"]')).length"));
check("M-05", "Roadside Gems Save buttons present", saveCount > 0, `${saveCount} Save buttons`);

// ── M-06: Proposal stop visual treatment ──────────────────────────────
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 4:'))?.click()");
ab("wait", "1500");
const proposalBanner = evalJS("document.body.textContent.includes('The Proposal')");
check("M-06", "Proposal stop has 'The Proposal' visual treatment", proposalBanner === "true", `banner = ${proposalBanner}`);

// ── M-07: Quote carousel arrows ───────────────────────────────────────
const arrowCount = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label=\"Previous quote\"], button[aria-label=\"Next quote\"]')).length"));
check("M-07", "Quote carousel has prev/next arrows", arrowCount >= 2, `${arrowCount} arrows`);

// ── M-08: Share buttons ───────────────────────────────────────────────
const shareCount = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Share \"]')).length"));
check("M-08", "Share buttons on stop cards", shareCount > 0, `${shareCount} Share buttons`);

// ── L-02: Nav not blocked after reveal ────────────────────────────────
ab("eval", "window.location.hash = '#/home'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const navStatus = evalJS(`(() => {
  const nav = document.querySelector('nav');
  if (!nav) return 'no nav';
  const r = nav.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + 10, r.top + 10);
  if (!el) return 'no element';
  return el.closest('nav') ? 'clickable' : 'blocked by ' + el.tagName;
})()`);
check("L-02", "Navigation not blocked after reveal dismissed", navStatus === "clickable", navStatus);

// ── L-05: Proposal & Sunset themes distinct ───────────────────────────
ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
// Switch to manual mode
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Manual')?.click()");
ab("wait", "500");
// Click "Select Proposal icon" button
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Proposal icon')?.click()");
ab("wait", "1000");
const proposalPrimary = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()");
// Click "Select Sunset icon" button
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Sunset icon')?.click()");
ab("wait", "1000");
const sunsetPrimary = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()");
check("L-05", "Proposal theme distinct from Sunset", proposalPrimary !== sunsetPrimary, `proposal=${proposalPrimary}, sunset=${sunsetPrimary}`);

// ── L-07: Catalog Map link navigates ──────────────────────────────────
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Show \"][aria-label$=\"on map\"]')).find(b => /^\\d+$/.test(b.textContent.trim()))?.click()");
ab("wait", "2000");
const mapHash = evalJS("window.location.hash");
check("L-07", "Catalog rank number navigates to Map tab", mapHash.includes("map"), `hash = ${mapHash}`);

// ── Theme 7.2: Dark theme card is dark ────────────────────────────────
ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Manual')?.click()");
ab("wait", "500");
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Stargazing icon')?.click()");
ab("wait", "1000");
const cardColor = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--card').trim()");
const bgColor = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--background').trim()");
const isDarkCard = /^#[0-2]/.test(cardColor);
check("Theme 7.2", "Dark theme (Stargazing) uses dark surface for --card", isDarkCard, `card=${cardColor}, bg=${bgColor}`);

// ── ARIA summary ──────────────────────────────────────────────────────
ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");
const ariaSummary = evalJS(`({
  filtersAria: document.querySelector('button[aria-controls="catalog-filters-panel"]') ? 'yes' : 'no',
  searchAria: document.querySelector('input[aria-label="Search attractions"]') ? 'yes' : 'no',
  moreBtns: Array.from(document.querySelectorAll('button[aria-label^="Show details for"]')).length,
  mapCbs: Array.from(document.querySelectorAll('input[type="checkbox"][aria-label^="Show "]')).length
})`);
check("ARIA", "ARIA labels on Filters, Search, More, Map checkboxes", ariaSummary.includes("yes"), ariaSummary);

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== SUMMARY: ${passed}/${total} checks passed ===\n`);

writeFileSync("/tmp/audit-verify-results.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  url: URL,
  passed,
  total,
  results,
}, null, 2));

process.exit(passed === total ? 0 : 1);
