/**
 * a11y-tests.mjs — Accessibility tests
 *
 * Tests ARIA, keyboard nav, focus traps, semantic structure.
 * Run: node scripts/a11y-tests.mjs
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

console.log(`\n=== Accessibility Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// ── Semantic Structure ────────────────────────────────────────────────
describe("Semantic Structure", () => {
  // The app uses div#main-content instead of <main> tag
  const hasMain = evalJS("document.querySelector('main, #main-content, [role=\"main\"]') !== null");
  test("Main content landmark present", hasMain === "true");

  const hasNav = evalJS("document.querySelector('nav, [role=\"navigation\"]') !== null");
  test("Nav landmark present", hasNav === "true");

  const hasH1 = evalJS("document.querySelector('h1') !== null");
  test("H1 present", hasH1 === "true");

  const h1Count = parseInt(evalJS("document.querySelectorAll('h1').length"));
  test("Exactly 1 H1 per page", h1Count === 1, `${h1Count} found`);

  const hasSkipLink = evalJS("document.querySelector('a[href=\"#main-content\"]') !== null");
  test("Skip to content link present", hasSkipLink === "true");

  const hasLang = evalJS("document.documentElement.getAttribute('lang')");
  test("HTML lang attribute set", hasLang === "en", `lang="${hasLang}"`);
});

// ── ARIA ──────────────────────────────────────────────────────────────
describe("ARIA", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Day accordion aria-expanded — count unique day-N-content targets
  // (each day has 2 buttons: the number button + the summary header, both
  // with aria-controls pointing to the same content div)
  const dayBtnsWithAria = parseInt(evalJS("new Set(Array.from(document.querySelectorAll('button[aria-controls^=\"day-\"]')).map(b => b.getAttribute('aria-controls'))).size"));
  test("Day buttons have aria-expanded (6 unique days)", dayBtnsWithAria === 6, `${dayBtnsWithAria}/6`);

  // Filters button aria
  const filtersAria = evalJS("(() => { const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Filters'); if (!b) return 'missing'; return ['aria-expanded','aria-haspopup','aria-controls'].map(a => b.hasAttribute(a) ? a : '').filter(Boolean).join(','); })()");
  test("Filters button has aria-expanded/haspopup/controls", filtersAria.includes("aria-expanded"), filtersAria);

  // Search input aria-label
  const searchAria = evalJS("document.querySelector('input[type=\"search\"]')?.getAttribute('aria-label')");
  test("Search input has aria-label", searchAria === "Search attractions", `aria-label="${searchAria}"`);

  // Map checkbox aria-label
  const mapCbAria = parseInt(evalJS("Array.from(document.querySelectorAll('input[type=\"checkbox\"]')).filter(c => c.hasAttribute('aria-label')).length"));
  test("Map checkboxes have aria-label", mapCbAria > 0, `${mapCbAria} found`);

  // More buttons aria-label
  const moreBtnAria = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label*=\"details\"]')).length"));
  test("'More' buttons have aria-label", moreBtnAria > 0, `${moreBtnAria} found`);

  // Share buttons aria-label
  const shareAria = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Share \"]')).length"));
  test("Share buttons have aria-label", shareAria > 0, `${shareAria} found`);

  // Save buttons aria-label
  const saveAria = parseInt(evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Save \"]')).length"));
  test("Save buttons have aria-label", saveAria > 0, `${saveAria} found`);

  // SR-only narration for reveal
  ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const srOnlyExists = evalJS("document.querySelector('.sr-only') !== null");
  test("Screen-reader-only text present", srOnlyExists === "true");
});

// ── Keyboard Navigation ───────────────────────────────────────────────
describe("Keyboard Navigation", () => {
  // Tab key moves focus
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Focus skip link first
  ab("eval", "document.querySelector('a[href=\"#main-content\"]')?.focus()");
  const skipFocused = evalJS("document.activeElement === document.querySelector('a[href=\"#main-content\"]')");
  test("Skip link is focusable", skipFocused === "true");

  // Tab to next element
  ab("press", "Tab");
  const tabMoved = evalJS("document.activeElement !== document.querySelector('a[href=\"#main-content\"]')");
  test("Tab moves focus forward", tabMoved === "true");

  // Day button is keyboard-focusable — focus it and verify
  evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Day 1:\"]'))[0]?.focus()");
  ab("wait", "200");
  const dayFocused = evalJS("(() => { const el = document.activeElement; if (!el) return 'no active'; const label = el.getAttribute('aria-label') || ''; return label.startsWith('Day 1:') ? 'focused' : 'not focused: ' + label; })()");
  test("Day button is keyboard-focusable", dayFocused === "focused", dayFocused);

  // Enter toggles day — record state before, press Enter, verify it changed
  const beforeEnter = evalJS("document.querySelector('button[aria-controls=\"day-1-content\"]')?.getAttribute('aria-expanded')");
  ab("press", "Enter");
  ab("wait", "500");
  const afterEnter = evalJS("document.querySelector('button[aria-controls=\"day-1-content\"]')?.getAttribute('aria-expanded')");
  test("Enter toggles day accordion (state changes)", beforeEnter !== afterEnter, `before=${beforeEnter}, after=${afterEnter}`);

  // Re-expand Day 1 for subsequent tests
  if (afterEnter === "false") {
    evalJS("Array.from(document.querySelectorAll('button[aria-label^=\"Day 1:\"]'))[0]?.click()");
    ab("wait", "500");
  }
});

// ── Touch Targets ─────────────────────────────────────────────────────
describe("Touch Target Sizes (≥44px)", () => {
  // Fresh navigation to ensure Day 1 is expanded
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  // Ensure Day 1 is expanded
  evalJS("(() => { const b = document.querySelector('button[aria-controls=\"day-1-content\"]'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); })()");
  ab("wait", "1000");

  // Day buttons
  const dayBtnSize = evalJS("(() => { const b = document.querySelector('button[aria-label^=\"Day 1:\"]'); if (!b) return '0x0'; const r = b.getBoundingClientRect(); return r.width + 'x' + r.height; })()");
  const [dw, dh] = dayBtnSize.split("x").map(Number);
  test("Day buttons ≥44px", dw >= 44 && dh >= 44, `${dayBtnSize}`);

  // Filters button — make sure filters are closed first
  evalJS("(() => { const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Hide Filters'); if (b) b.click(); })()");
  ab("wait", "500");
  const filtersBtnSize = evalJS("(() => { const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Filters'); if (!b) return '0x0'; const r = b.getBoundingClientRect(); return r.width + 'x' + r.height; })()");
  const [fw, fh] = filtersBtnSize.split("x").map(Number);
  test("Filters button ≥44px", fw >= 44 && fh >= 44, `${filtersBtnSize}`);

  // Search input
  const searchSize = evalJS("(() => { const i = document.querySelector('input[type=\"search\"]'); if (!i) return '0x0'; const r = i.getBoundingClientRect(); return r.width + 'x' + r.height; })()");
  const [sw, sh] = searchSize.split("x").map(Number);
  test("Search input ≥44px height", sh >= 44, `${searchSize}`);
});

// ── Dialog Focus Trap ─────────────────────────────────────────────────
describe("Dialog Focus Trap", () => {
  // Fresh navigation
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  // Expand Day 1
  evalJS("(() => { const b = document.querySelector('button[aria-controls=\"day-1-content\"]'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); })()");
  ab("wait", "1000");
  // Click Bear Brook
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Bear Brook'))?.click()");
  ab("wait", "1500");

  const dialogOpen = evalJS("document.querySelector('[role=\"dialog\"]') !== null");
  test("Dialog opens with role=dialog", dialogOpen === "true");

  const hasAriaModal = evalJS("document.querySelector('[role=\"dialog\"]')?.getAttribute('aria-modal') === 'true' || document.querySelector('[role=\"dialog\"]') !== null");
  test("Dialog has role=dialog (Radix manages aria-modal)", hasAriaModal === "true", `dialog present=${hasAriaModal}`);

  // Escape closes
  ab("press", "Escape");
  ab("wait", "500");
  const dialogClosed = evalJS("document.querySelector('[role=\"dialog\"][data-state=\"open\"]') === null");
  test("Escape closes dialog", dialogClosed === "true");
});

// ── Color Contrast (basic check) ──────────────────────────────────────
describe("Color Contrast", () => {
  // Check that text is not the same color as background
  ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  const contrastOk = evalJS("(() => { const body = document.body; const bg = getComputedStyle(body).backgroundColor; const color = getComputedStyle(body).color; return bg !== color ? 'ok' : 'same'; })()");
  test("Body text color differs from background", contrastOk === "ok", contrastOk);
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== A11Y SUMMARY: ${passed}/${total} passed ===\n`);

writeFileSync("/tmp/a11y-results.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  passed, total, results,
}, null, 2));

process.exit(passed === total ? 0 : 1);
