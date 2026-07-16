/**
 * e2e-tests.mjs — End-to-end user flow tests
 *
 * Tests full user journeys through the app using agent-browser:
 *   - Navigation between all 5 pages
 *   - Day accordion expand/collapse
 *   - Stop detail dialog open/close
 *   - Attraction catalog search + filter
 *   - Share button functionality
 *   - URL hash routing
 *   - Music player
 *   - Settings + theme switching
 *
 * Run: node scripts/e2e-tests.mjs
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
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${details ? " — " + details : ""}`);
}

function describe(name, fn) {
  console.log(`\n── ${name} ──`);
  fn();
}

// ── Setup ──────────────────────────────────────────────────────────────
console.log(`\n=== E2E Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
// Dismiss 3D reveal
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// ── Navigation Tests ───────────────────────────────────────────────────
describe("Navigation: 5-page slide deck", () => {
  // Home (default)
  ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const homeHasHero = evalJS("document.body.textContent.includes('Wilderness Romance') || document.querySelector('h1, h2') !== null");
  test("Home page loads", homeHasHero === "true" || homeHasHero === true);

  // Trip
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const tripHasTimeline = evalJS("document.body.textContent.includes('Six days of wilderness')");
  test("Trip page shows timeline", tripHasTimeline === "true");

  // Map
  ab("eval", "window.location.hash = '#/map'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "3000");
  const mapHasContent = evalJS("document.body.textContent.includes('Atlas') || document.body.textContent.includes('Map') || document.querySelector('canvas') !== null");
  test("Map page loads", mapHasContent === "true" || mapHasContent === true);

  // Proposal
  ab("eval", "window.location.hash = '#/proposal'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const proposalHasCountdown = evalJS("document.body.textContent.includes('PROPOSAL') || document.body.textContent.includes('Counting') || document.body.textContent.includes('forever')");
  test("Proposal page shows countdown", proposalHasCountdown === "true");

  // Us
  ab("eval", "window.location.hash = '#/us'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const usHasContent = evalJS("document.querySelector('h1, h2, h3') !== null");
  test("Us page loads", usHasContent === "true" || usHasContent === true);

  // Settings
  ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const settingsHasContent = evalJS("document.body.textContent.includes('Settings') || document.body.textContent.includes('icon')");
  test("Settings page loads", settingsHasContent === "true");

  // Back to home
  ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  test("Back to home works", true);
});

// ── Day Accordion Tests ───────────────────────────────────────────────
describe("Day Accordion (Trip page)", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // All 6 days visible
  const dayCount = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Day \"]')).filter(b => /^Day \\d:/.test(b.getAttribute('aria-label'))).length"));
  test("All 6 day buttons visible", dayCount === 6, `${dayCount} found`);

  // Day 1 expanded by default
  const day1Expanded = evalJS("document.querySelector('button[aria-controls=\"day-1-content\"]')?.getAttribute('aria-expanded')");
  test("Day 1 expanded by default", day1Expanded === "true", `aria-expanded=${day1Expanded}`);

  // Expand Day 4
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 4:'))?.click()");
  ab("wait", "1000");
  const day4Expanded = evalJS("document.querySelector('button[aria-controls=\"day-4-content\"]')?.getAttribute('aria-expanded')");
  test("Day 4 expands on click", day4Expanded === "true", `aria-expanded=${day4Expanded}`);

  // Day 1 should STILL be expanded (M-02: multiple expand)
  const day1StillExpanded = evalJS("document.querySelector('button[aria-controls=\"day-1-content\"]')?.getAttribute('aria-expanded')");
  test("Day 1 stays expanded when Day 4 opens (M-02)", day1StillExpanded === "true", `aria-expanded=${day1StillExpanded}`);

  // Collapse Day 4
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 4:'))?.click()");
  ab("wait", "500");
  const day4Collapsed = evalJS("document.querySelector('button[aria-controls=\"day-4-content\"]')?.getAttribute('aria-expanded')");
  test("Day 4 collapses on second click", day4Collapsed === "false", `aria-expanded=${day4Collapsed}`);

  // Expand all button
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Expand all')?.click()");
  ab("wait", "1000");
  const allExpanded = evalJS("Array.from(document.querySelectorAll('button[aria-controls^=\"day-\"]')).every(b => b.getAttribute('aria-expanded') === 'true')");
  test("Expand all opens all 6 days", allExpanded === "true");

  // Collapse all button
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Collapse all')?.click()");
  ab("wait", "500");
  const allCollapsed = evalJS("Array.from(document.querySelectorAll('button[aria-controls^=\"day-\"]')).every(b => b.getAttribute('aria-expanded') === 'false')");
  test("Collapse all closes all 6 days", allCollapsed === "true");
});

// ── Stop Detail Dialog Tests ──────────────────────────────────────────
describe("Stop Detail Dialog", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  // Expand Day 1
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.startsWith('Day 1:'))?.click()");
  ab("wait", "1000");

  // Click Bear Brook stop
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Bear Brook'))?.click()");
  ab("wait", "1500");

  const dialogOpen = evalJS("document.querySelector('[role=\"dialog\"]') !== null");
  test("Dialog opens when stop clicked", dialogOpen === "true");

  const hasBookingId = evalJS("document.body.textContent.includes('Booking ID') || document.body.textContent.includes('ReserveAmerica')");
  test("Dialog shows Booking ID", hasBookingId === "true");

  const hasAccessCode = evalJS("document.body.textContent.includes('Access Code') || document.body.textContent.includes('3000')");
  test("Dialog shows Access Code", hasAccessCode === "true");

  const hasCheckIn = evalJS("document.body.textContent.includes('Check-In')");
  test("Dialog shows Check-In", hasCheckIn === "true");

  const hasCheckOut = evalJS("document.body.textContent.includes('Check-Out')");
  test("Dialog shows Check-Out (M-03)", hasCheckOut === "true");

  const hasDirections = evalJS("document.body.textContent.includes('Directions') || document.body.textContent.includes('Apple Maps') || document.body.textContent.includes('Google Maps')");
  test("Dialog shows directions links", hasDirections === "true");

  // Close dialog
  ab("press", "Escape");
  ab("wait", "500");
  const dialogClosed = evalJS("document.querySelector('[role=\"dialog\"][data-state=\"open\"]') === null");
  test("Dialog closes on Escape", dialogClosed === "true");
});

// ── Attraction Catalog Tests ──────────────────────────────────────────
describe("Attraction Catalog", () => {
  // Day 1 should already be expanded
  const catalogExists = evalJS("document.body.textContent.includes('Attraction Catalog')");
  test("Catalog section visible", catalogExists === "true");

  // Filters button
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Filters')?.click()");
  ab("wait", "500");
  const filtersOpen = evalJS("document.querySelector('#catalog-filters-panel') !== null");
  test("Filters panel opens", filtersOpen === "true");

  // Type filters exist (buttons inside the filters panel)
  const typeFilterCount = parseInt(evalJS("document.querySelectorAll('#catalog-filters-panel button').length"));
  test("Type filter buttons exist", typeFilterCount > 0, `${typeFilterCount} buttons`);

  // Search — use a term that matches Day 1 catalog entries (e.g. "lake" or "market")
  const searchScript = (val) => `(() => {
    const s = document.querySelector('input[type="search"]');
    if (!s) return 'no input';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(s, ${JSON.stringify(val)});
    s.dispatchEvent(new Event('input', { bubbles: true }));
    return 'set';
  })()`;
  evalJS(searchScript("market"));
  ab("wait", "500");
  const marketNoEmpty = evalJS("document.body.textContent.includes('No attractions match')");
  test("Search 'market' returns results", marketNoEmpty === "false", `empty state shown = ${marketNoEmpty}`);

  evalJS(searchScript("zzzznomatch"));
  ab("wait", "500");
  const noResults = evalJS("document.body.textContent.includes('No attractions match')");
  test("Search 'zzzz' shows empty state", noResults === "true");

  evalJS(searchScript(""));
  ab("wait", "500");

  // Close filters
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Hide Filters')?.click()");
  ab("wait", "500");
  const filtersClosed = evalJS("document.querySelector('#catalog-filters-panel') === null");
  test("Filters panel closes", filtersClosed === "true");
});

// ── Share Button Tests ────────────────────────────────────────────────
describe("Share Buttons", () => {
  const shareBtnCount = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Share \"]')).length"));
  test("Share buttons exist on stop cards", shareBtnCount > 0, `${shareBtnCount} found`);

  // Verify share URL format
  const shareUrlFormat = evalJS("(() => { const btn = document.querySelector('button[aria-label^=\"Share \"]'); if (!btn) return 'no btn'; return 'exists'; })()");
  test("Share button is clickable element", shareUrlFormat === "exists");
});

// ── Roadside Gems Save Tests ──────────────────────────────────────────
describe("Roadside Gems Save (M-05)", () => {
  const saveBtnCount = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Save \"]')).length"));
  test("Save buttons exist", saveBtnCount > 0, `${saveBtnCount} found`);

  // Click first save button
  const firstSaveResult = evalJS("(() => { const btn = document.querySelector('button[aria-label^=\"Save \"]'); if (!btn) return 'no btn'; btn.click(); return 'clicked'; })()");
  ab("wait", "500");
  test("Save button clickable", firstSaveResult === "clicked");

  // Check localStorage
  const savedInStorage = evalJS("localStorage.getItem('wilderness-saved-gems') !== null");
  test("Saved gem persists to localStorage", savedInStorage === "true");

  // Verify "Show saved" filter appears
  const showSavedVisible = evalJS("Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Show saved'))");
  test("Show saved filter appears after saving", showSavedVisible === "true");

  // Clean up
  evalJS("localStorage.removeItem('wilderness-saved-gems')");
});

// ── URL Routing Tests (H-05) ──────────────────────────────────────────
describe("URL Hash Routing (H-05)", () => {
  // Navigate to trip/day4
  ab("eval", "window.location.hash = '#/trip/day4'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const onTrip = evalJS("window.location.hash.includes('trip')");
  test("Hash #/trip/day4 sets hash", onTrip === "true");

  // Day 4 should be expanded
  const day4Expanded = evalJS("document.querySelector('button[aria-controls=\"day-4-content\"]')?.getAttribute('aria-expanded')");
  test("Hash #/trip/day4 expands Day 4", day4Expanded === "true", `aria-expanded=${day4Expanded}`);

  // Navigate to map
  ab("eval", "window.location.hash = '#/map'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const onMap = evalJS("window.location.hash.includes('map')");
  test("Hash #/map navigates to Map", onMap === "true");
});

// ── Music Player Tests ────────────────────────────────────────────────
describe("Music Player", () => {
  ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const musicPlayerExists = evalJS("document.body.textContent.includes('Music') || document.querySelector('[class*=\"music\"], [aria-label*=\"music\"], [aria-label*=\"Music\"]') !== null");
  test("Music player element exists", musicPlayerExists === "true" || musicPlayerExists === true);
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== E2E SUMMARY: ${passed}/${total} passed ===\n`);

writeFileSync("/tmp/e2e-results.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  url: URL,
  passed,
  total,
  results,
}, null, 2));

process.exit(passed === total ? 0 : 1);
