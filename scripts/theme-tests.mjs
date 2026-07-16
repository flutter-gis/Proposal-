/**
 * theme-tests.mjs — Theme system tests
 *
 * Tests all 12 themes, dark mode, color distinctness.
 * Run: node scripts/theme-tests.mjs
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

console.log(`\n=== Theme Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// Navigate to settings
ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
ab("wait", "2000");

// Switch to manual mode
evalJS("Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Manual')?.click()");
ab("wait", "500");

// ── All 12 Themes ─────────────────────────────────────────────────────
describe("All 12 Icon Themes Switchable", () => {
  const themes = [
    "Sunrise", "Morning", "Afternoon", "Golden Hour", "Sunset", "Dusk",
    "Midnight", "Stargazing", "Heart", "Ring", "Proposal", "Anniversary"
  ];

  for (const theme of themes) {
    evalJS(`Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select ${theme} icon')?.click()`);
    ab("wait", "500");
    const dataTheme = evalJS("document.documentElement.getAttribute('data-theme')");
    test(`${theme} theme applies`, dataTheme !== null && dataTheme !== "", `data-theme=${dataTheme}`);
  }
});

// ── Dark Themes ───────────────────────────────────────────────────────
describe("Dark Themes (Midnight, Stargazing)", () => {
  // Stargazing
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Stargazing icon')?.click()");
  ab("wait", "500");
  const cosmicCard = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--card').trim()");
  const cosmicBg = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--background').trim()");
  test("Stargazing: --card is dark surface", /^#[0-2]/.test(cosmicCard), `card=${cosmicCard}`);
  test("Stargazing: --background is dark", /^#[0-2]/.test(cosmicBg), `bg=${cosmicBg}`);

  // Midnight
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Midnight icon')?.click()");
  ab("wait", "500");
  const nightCard = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--card').trim()");
  const nightBg = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--background').trim()");
  test("Midnight: --card is dark surface", /^#[0-2]/.test(nightCard), `card=${nightCard}`);
  test("Midnight: --background is dark", /^#[0-2]/.test(nightBg), `bg=${nightBg}`);
});

// ── Theme Distinctness (L-05) ─────────────────────────────────────────
describe("Theme Distinctness (L-05)", () => {
  // Proposal vs Sunset
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Proposal icon')?.click()");
  ab("wait", "500");
  const proposalPrimary = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Sunset icon')?.click()");
  ab("wait", "500");
  const sunsetPrimary = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()");
  test("Proposal ≠ Sunset (primary)", proposalPrimary !== sunsetPrimary, `proposal=${proposalPrimary}, sunset=${sunsetPrimary}`);

  // Anniversary vs Dusk
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Anniversary icon')?.click()");
  ab("wait", "500");
  const annivPrimary = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Dusk icon')?.click()");
  ab("wait", "500");
  const duskPrimary = evalJS("getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()");
  test("Anniversary ≠ Dusk (primary)", annivPrimary !== duskPrimary, `anniversary=${annivPrimary}, dusk=${duskPrimary}`);
});

// ── Theme Persistence ─────────────────────────────────────────────────
describe("Theme Persistence", () => {
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Select Ring icon')?.click()");
  ab("wait", "500");
  const stored = evalJS("localStorage.getItem('wilderness-romance-prefs')");
  test("Theme saved to localStorage", stored !== null, `stored=${stored?.substring(0, 50)}`);

  const parsed = JSON.parse(stored);
  test("Stored manualIcon = ring", parsed.manualIcon === "ring", `manualIcon=${parsed.manualIcon}`);
});

// ── CSS Variables Applied ─────────────────────────────────────────────
describe("CSS Variables Applied", () => {
  const vars = ["--background", "--foreground", "--primary", "--accent", "--card", "--rust-bg", "--rust-brass"];
  for (const v of vars) {
    const val = evalJS(`getComputedStyle(document.documentElement).getPropertyValue('${v}').trim()`);
    test(`${v} is set`, val !== "", `value=${val}`);
  }
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== THEME SUMMARY: ${passed}/${total} passed ===\n`);

writeFileSync("/tmp/theme-results.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  passed, total, results,
}, null, 2));

process.exit(passed === total ? 0 : 1);
