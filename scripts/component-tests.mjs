/**
 * component-tests.mjs — Component-level tests
 *
 * Tests SlideDeck, AppShell, MusicPlayer, PlaceDetailDialog,
 * ScrollProgressTrail, and other interactive components.
 *
 * Run: node scripts/component-tests.mjs
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

console.log(`\n=== Component Tests: ${URL} ===`);
ab("open", URL);
ab("wait", "5000");
ab("eval", "document.querySelector('button[aria-label=\"Skip the surprise\"]')?.click()");
ab("wait", "2000");

// ── SlideDeck ─────────────────────────────────────────────────────────
describe("SlideDeck", () => {
  // Pages exist
  const pageCount = parseInt(evalJS("document.querySelectorAll('[data-slide], .anim-page-forward, .anim-page-backward, .anim-fade-in-up').length"));
  test("SlideDeck renders content", pageCount > 0, `${pageCount} elements`);

  // Page navigation via hash
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const onTrip = evalJS("document.body.textContent.includes('Six days of wilderness')");
  test("Hash navigation to Trip works", onTrip === "true");

  ab("eval", "window.location.hash = '#/map'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const onMap = evalJS("document.body.textContent.includes('Journey Map') || document.body.textContent.includes('Atlas')");
  test("Hash navigation to Map works", onMap === "true" || onMap === true);

  ab("eval", "window.location.hash = '#/proposal'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const onProposal = evalJS("document.body.textContent.includes('PROPOSAL') || document.body.textContent.includes('forever') || document.body.textContent.includes('Proposal')");
  test("Hash navigation to Proposal works", onProposal === "true" || onProposal === true);

  // Back button (popstate)
  ab("eval", "window.history.back()");
  ab("wait", "1500");
  const wentBack = evalJS("document.body.textContent.includes('Journey Map') || document.body.textContent.includes('Atlas')");
  test("Back button navigates to previous page", wentBack === "true" || wentBack === true);
});

// ── AppShell / Navigation ─────────────────────────────────────────────
describe("AppShell Navigation", () => {
  ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Nav buttons exist
  const navBtns = parseInt(evalJS("document.querySelectorAll('nav button, [role=\"navigation\"] button').length"));
  test("Navigation buttons exist", navBtns >= 5, `${navBtns} buttons`);

  // Click nav button to go to Trip
  const tripNavResult = evalJS("(() => { const btns = Array.from(document.querySelectorAll('button')); const tripBtn = btns.find(b => b.textContent.trim() === 'Trip'); if (tripBtn) { tripBtn.click(); return 'clicked'; } return 'not found'; })()");
  ab("wait", "1500");
  test("Trip nav button clickable", tripNavResult === "clicked");

  // Settings dropdown
  ab("eval", "window.location.hash = '#/settings'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  const settingsVisible = evalJS("document.body.textContent.includes('Settings') || document.body.textContent.includes('icon')");
  test("Settings page accessible", settingsVisible === "true" || settingsVisible === true);
});

// ── MusicPlayer ───────────────────────────────────────────────────────
describe("MusicPlayer", () => {
  ab("eval", "window.location.hash = ''; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  // Music player exists (pill or panel)
  const playerExists = evalJS("(() => { const els = document.querySelectorAll('[class*=\"music\"], [aria-label*=\"music\"], [aria-label*=\"Music\"], [aria-label*=\"play\"], [aria-label*=\"Play\"]'); return els.length > 0 ? 'found' : 'not found'; })()");
  test("Music player element exists", playerExists === "found");

  // Check if play/pause button exists
  const playBtn = evalJS("(() => { const btns = Array.from(document.querySelectorAll('button')); const play = btns.find(b => b.getAttribute('aria-label')?.toLowerCase().includes('play') || b.textContent.includes('Play')); return play ? 'found' : 'not found'; })()");
  test("Play/pause button exists", playBtn === "found" || playBtn === true);
});

// ── PlaceDetailDialog ─────────────────────────────────────────────────
describe("PlaceDetailDialog", () => {
  ab("eval", "window.location.hash = '#/trip'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");
  // Open a stop
  evalJS("Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Bear Brook'))?.click()");
  ab("wait", "1500");

  const dialogOpen = evalJS("document.querySelector('[role=\"dialog\"]') !== null");
  test("Dialog opens", dialogOpen === "true" || dialogOpen === true);

  // Check for key fields
  const hasBookingId = evalJS("document.body.textContent.includes('Booking ID') || document.body.textContent.includes('ReserveAmerica')");
  test("Dialog shows Booking ID", hasBookingId === "true" || hasBookingId === true);

  const hasAccessCode = evalJS("document.body.textContent.includes('Access Code') || document.body.textContent.includes('3000')");
  test("Dialog shows Access Code", hasAccessCode === "true" || hasAccessCode === true);

  const hasDirections = evalJS("document.body.textContent.includes('Directions') || document.body.textContent.includes('Apple Maps') || document.body.textContent.includes('Google Maps') || document.body.textContent.includes('Navigate')");
  test("Dialog shows directions", hasDirections === "true" || hasDirections === true);

  const hasCheckIn = evalJS("document.body.textContent.includes('Check-In')");
  test("Dialog shows Check-In", hasCheckIn === "true" || hasCheckIn === true);

  const hasCheckOut = evalJS("document.body.textContent.includes('Check-Out')");
  test("Dialog shows Check-Out", hasCheckOut === "true" || hasCheckOut === true);

  // Close dialog
  ab("press", "Escape");
  ab("wait", "500");
  const dialogClosed = evalJS("document.querySelector('[role=\"dialog\"][data-state=\"open\"]') === null");
  test("Dialog closes on Escape", dialogClosed === "true" || dialogClosed === true);
});

// ── ScrollProgressTrail ───────────────────────────────────────────────
describe("ScrollProgressTrail", () => {
  // Check if scroll progress indicator exists
  const progressExists = evalJS("(() => { const els = document.querySelectorAll('[class*=\"progress\"], [class*=\"scroll-trail\"], [role=\"progressbar\"]'); return els.length > 0 ? 'found' : 'checking fixed elements'; })()");
  test("Scroll progress element exists", progressExists === "found" || progressExists === true || progressExists.includes("found"));
});

// ── Countdown Timer ───────────────────────────────────────────────────
describe("Countdown Timer", () => {
  ab("eval", "window.location.hash = '#/proposal'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  const hasCountdown = evalJS("document.body.textContent.includes('PROPOSAL IN') || document.body.textContent.includes('MARRIED') || document.body.textContent.includes('Counting down')");
  test("Countdown timer visible on Proposal page", hasCountdown === "true" || hasCountdown === true);

  const hasTabularNums = evalJS("(() => { const els = document.querySelectorAll('*'); for (const el of els) { if (el.className && typeof el.className === 'string' && el.className.includes('tabular-nums')) return 'found'; } return 'not found'; })()");
  test("Countdown uses tabular-nums", hasTabularNums === "found");
});

// ── Footer ────────────────────────────────────────────────────────────
describe("Footer", () => {
  ab("eval", "window.location.hash = '#/us'; window.dispatchEvent(new Event('hashchange'));");
  ab("wait", "2000");

  const hasFooter = evalJS("document.querySelector('footer') !== null");
  test("Footer exists", hasFooter === "true" || hasFooter === true);

  const hasSources = evalJS("document.body.textContent.includes('Sources') || document.body.textContent.includes('Citations')");
  test("Footer has Sources link", hasSources === "true" || hasSources === true);

  const hasHashtag = evalJS("document.body.textContent.includes('JAndDeeSayIDo')");
  test("Footer has hashtag", hasHashtag === "true" || hasHashtag === true);
});

// ── Summary ───────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const total = results.length;
console.log(`\n=== COMPONENT TESTS SUMMARY: ${passed}/${total} passed ===\n`);
writeFileSync("/tmp/component-results.json", JSON.stringify({ passed, total, results }, null, 2));
process.exit(passed === total ? 0 : 1);
