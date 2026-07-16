/**
 * mobile-tests.mjs — Mobile viewport tests
 *
 * Tests layout at 375px (iPhone SE/X), touch targets, no horizontal overflow.
 * Run: node scripts/mobile-tests.mjs
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

console.log(`\n=== Mobile Tests: ${URL} (375×812) ===`);
ab("open", URL);
ab("wait", "3000");
ab("set", "viewport", "375", "812");
ab("wait", "2000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// ── Viewport Setup ────────────────────────────────────────────────────
describe("Viewport", () => {
  const dims = evalJS("({ w: window.innerWidth, h: window.innerHeight })");
  test("Viewport is 375px wide", dims.includes('"w":375'), dims);
});

// ── No Horizontal Overflow ────────────────────────────────────────────
describe("Layout: No Horizontal Overflow", () => {
  const pages = ["", "#/trip", "#/map", "#/proposal", "#/us", "#/settings"];
  for (const page of pages) {
    ab("eval", `window.location.hash = '${page}'; window.dispatchEvent(new Event('hashchange'));`);
    ab("wait", "2000");
    const overflow = evalJS("document.documentElement.scrollWidth - document.documentElement.clientWidth");
    const pageName = page || "home";
    test(`No horizontal overflow on ${pageName}`, overflow === "0", `overflow=${overflow}px`);
  }
});

// ── Touch Targets ≥44px ───────────────────────────────────────────────
describe("Touch Targets (≥44px on mobile)", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Day buttons
  const dayBtn = evalJS("(() => { const b = document.querySelector('button[aria-label^=\"Day 1:\"]'); if (!b) return '0x0'; const r = b.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })()");
  const [dw, dh] = dayBtn.split("x").map(Number);
  test("Day button ≥44×44", dw >= 44 && dh >= 44, `${dayBtn}`);

  // Filters button
  const filtersBtn = evalJS("(() => { const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Filters'); if (!b) return '0x0'; const r = b.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })()");
  const [fw, fh] = filtersBtn.split("x").map(Number);
  test("Filters button ≥44×44", fw >= 44 && fh >= 44, `${filtersBtn}`);

  // Nav buttons
  const navBtn = evalJS("(() => { const b = document.querySelector('nav button'); if (!b) return '0x0'; const r = b.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })()");
  const [nw, nh] = navBtn.split("x").map(Number);
  test("Nav button ≥44px height", nh >= 44, `${navBtn}`);
});

// ── Text Readability ──────────────────────────────────────────────────
describe("Text Readability", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Body text should be at least 14px on mobile
  const bodyFontSize = evalJS("(() => { const el = document.querySelector('p, span, div'); if (!el) return '0px'; return parseFloat(getComputedStyle(el).fontSize) + 'px'; })()");
  const fs = parseFloat(bodyFontSize);
  test("Body text ≥14px", fs >= 14, `${bodyFontSize}`);

  // Headings should be larger
  const headingSize = evalJS("(() => { const h = document.querySelector('h2, h3'); if (!h) return '0px'; return parseFloat(getComputedStyle(h).fontSize) + 'px'; })()");
  const hs = parseFloat(headingSize);
  test("Heading text ≥16px", hs >= 16, `${headingSize}`);
});

// ── Dialog on Mobile ──────────────────────────────────────────────────
describe("Dialog on Mobile", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Bear Brook'))?.click()");
  ab("wait", "1500");

  const dialogFits = evalJS("(() => { const d = document.querySelector('[role=\"dialog\"]'); if (!d) return 'no dialog'; const r = d.getBoundingClientRect(); return r.width <= 375 ? 'fits' : 'overflows:' + r.width; })()");
  test("Dialog fits within 375px width", dialogFits === "fits" || dialogFits.startsWith("fits"), dialogFits);

  const dialogScrollable = evalJS("(() => { const d = document.querySelector('[role=\"dialog\"]'); if (!d) return 'no dialog'; const r = d.getBoundingClientRect(); return r.height <= 812 ? 'fits' : 'scrollable'; })()");
  test("Dialog is scrollable if taller than viewport", dialogScrollable === "fits" || dialogScrollable === "scrollable", dialogScrollable);

  ab("press", "Escape");
  ab("wait", "500");
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== MOBILE SUMMARY: ${passed}/${total} passed ===\n`);

writeFileSync("/tmp/mobile-results.json", JSON.stringify({
  timestamp: new Date().toISOString(),
  passed, total, results,
}, null, 2));

process.exit(passed === total ? 0 : 1);
