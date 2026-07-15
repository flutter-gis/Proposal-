/**
 * full_scale_interaction_test.mjs
 *
 * EXHAUSTIVE interaction test of the Wilderness Romance PWA.
 *
 * Captures EVERYTHING:
 *   - console.log / info / warn / error / debug
 *   - pageerror (uncaught exceptions)
 *   - request / response / requestfailed
 *   - every click (selector + text + timestamp)
 *   - every swipe (direction + distance)
 *   - every key press
 *   - every scroll (debounced)
 *   - dialog open/close lifecycle
 *   - carousel auto-advance
 *   - music player toggle
 *   - The Pause overlay lifecycle
 *
 * Writes logs to:
 *   /home/z/my-project/scripts/logs/console.log
 *   /home/z/my-project/scripts/logs/network.log
 *   /home/z/my-project/scripts/logs/actions.log
 *   /home/z/my-project/scripts/logs/summary.json
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const LOG_DIR = '/home/z/my-project/scripts/logs';
mkdirSync(LOG_DIR, { recursive: true });

// Truncate log files up front
for (const f of ['console.log', 'network.log', 'actions.log', 'errors.log']) {
  writeFileSync(`${LOG_DIR}/${f}`, '');
}

const log = {
  console: (msg) => appendFileSync(`${LOG_DIR}/console.log`, msg + '\n'),
  network: (msg) => appendFileSync(`${LOG_DIR}/network.log`, msg + '\n'),
  action: (msg) => appendFileSync(`${LOG_DIR}/actions.log`, msg + '\n'),
  error: (msg) => appendFileSync(`${LOG_DIR}/errors.log`, msg + '\n'),
};

const summary = {
  startTime: new Date().toISOString(),
  pagesVisited: [],
  clicks: 0,
  swipes: 0,
  keysPressed: 0,
  scrolls: 0,
  dialogs: 0,
  carousels: 0,
  networkRequests: 0,
  networkFailed: 0,
  consoleErrors: 0,
  consoleWarnings: 0,
  consoleLogs: 0,
  uncaughtExceptions: 0,
  errors: [],
};

const startMs = Date.now();
const ts = () => `[+${((Date.now() - startMs) / 1000).toFixed(2)}s]`;

async function setupListeners(page) {
  // ── Console ─────────────────────────────────────────────────────────────
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    summary.consoleLogs++;
    if (type === 'error') {
      summary.consoleErrors++;
      log.console(`${ts()} [CONSOLE.ERROR] ${text}`);
      log.error(`${ts()} CONSOLE.ERROR: ${text}`);
    } else if (type === 'warning') {
      summary.consoleWarnings++;
      log.console(`${ts()} [CONSOLE.WARN]  ${text}`);
    } else {
      log.console(`${ts()} [CONSOLE.${type.toUpperCase().padEnd(5)}] ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    summary.uncaughtExceptions++;
    summary.errors.push(`PAGEERROR: ${err.message}`);
    log.error(`${ts()} PAGEERROR: ${err.message}\n  stack: ${err.stack || '(no stack)'}`);
  });

  // ── Network ─────────────────────────────────────────────────────────────
  page.on('request', (req) => {
    summary.networkRequests++;
    log.network(`${ts()} → ${req.method()} ${req.url().slice(0, 120)}`);
  });
  page.on('response', (res) => {
    const status = res.status();
    const marker = status >= 400 ? '⚠️' : '✓';
    log.network(`${ts()} ${marker} ${status} ${res.url().slice(0, 120)}`);
    if (status >= 400) {
      summary.networkFailed++;
      summary.errors.push(`HTTP ${status} on ${res.url()}`);
    }
  });
  page.on('requestfailed', (req) => {
    summary.networkFailed++;
    const failure = req.failure()?.errorText || 'unknown';
    log.error(`${ts()} NETWORK FAIL: ${req.method()} ${req.url().slice(0, 100)} — ${failure}`);
    summary.errors.push(`REQUEST FAILED: ${req.url()} — ${failure}`);
  });

  // ── Click instrumentation (via CDP) ────────────────────────────────────
  // We'll log clicks via our own clicks (more reliable than DOM listener)
}

async function clickAndLog(page, selector, label) {
  try {
    const el = page.locator(selector).first();
    const visible = await el.isVisible({ timeout: 1000 }).catch(() => false);
    if (!visible) {
      log.action(`${ts()} SKIP (not visible): ${label} — ${selector}`);
      return false;
    }
    await el.click({ timeout: 3000, force: false });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ ${label} — ${selector}`);
    await page.waitForTimeout(300);
    return true;
  } catch (e) {
    log.action(`${ts()} CLICK ✗ ${label} — ${e.message.slice(0, 80)}`);
    return false;
  }
}

async function swipeAndLog(page, direction, distance = 200) {
  const viewport = page.viewportSize();
  const cx = viewport.width / 2;
  const cy = viewport.height / 2;
  let fromX, fromY, toX, toY;
  if (direction === 'left') {
    fromX = cx + distance / 2; toX = cx - distance / 2;
    fromY = cy; toY = cy;
  } else if (direction === 'right') {
    fromX = cx - distance / 2; toX = cx + distance / 2;
    fromY = cy; toY = cy;
  } else if (direction === 'up') {
    fromX = cx; toX = cx;
    fromY = cy + distance / 2; toY = cy - distance / 2;
  } else {
    fromX = cx; toX = cx;
    fromY = cy - distance / 2; toY = cy + distance / 2;
  }
  try {
    // Use CDP to dispatch real PointerEvents + TouchEvents (SlideDeck's
    // onTouchStart/Move/End only fire on real touch events, not mouse events).
    const client = await page.context().newCDPSession(page);
    await client.send('Input.setInterceptDrags', { enabled: false }).catch(() => {});

    try {
      // Use CDP dispatchTouchEvent for actual touch events
      const touchPoints = [{
        state: 'touchPressed',
        x: fromX,
        y: fromY,
        id: 0,
      }];
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints,
        modifiers: 0,
        timestamp: Date.now(),
      });

      // Move through several intermediate points
      const steps = 12;
      for (let i = 1; i <= steps; i++) {
        const x = fromX + (toX - fromX) * (i / steps);
        const y = fromY + (toY - fromY) * (i / steps);
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ state: 'touchMoved', x, y, id: 0 }],
          modifiers: 0,
          timestamp: Date.now(),
        });
        await page.waitForTimeout(20);
      }

      await client.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [{ state: 'touchReleased', x: toX, y: toY, id: 0 }],
        modifiers: 0,
        timestamp: Date.now(),
      });
    } finally {
      // Always detach the CDP session to avoid leaks
      await client.detach().catch(() => {});
    }

    summary.swipes++;
    log.action(`${ts()} SWIPE ${direction.toUpperCase()} (${distance}px) — via CDP touch events`);
    await page.waitForTimeout(500);
  } catch (e) {
    log.action(`${ts()} SWIPE ${direction} FAILED: ${e.message.slice(0, 80)}`);
  }
}

async function pressAndLog(page, key) {
  try {
    await page.keyboard.press(key);
    summary.keysPressed++;
    log.action(`${ts()} KEY ${key}`);
    await page.waitForTimeout(200);
  } catch (e) {
    log.action(`${ts()} KEY ${key} FAILED: ${e.message}`);
  }
}

async function visitPage(page, label) {
  log.action(`${ts()} ─────────────────────────────────────────────────`);
  log.action(`${ts()} PAGE ENTER: ${label}`);
  summary.pagesVisited.push(label);
  await page.locator(`nav[aria-label="Page navigation"] button[aria-label="${label}"]`).click({ force: true });
  await page.waitForTimeout(800);
  // Verify the page actually changed
  const actualPage = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  if (actualPage !== label) {
    log.action(`${ts()} ⚠️ visitPage(${label}) — actually on "${actualPage}", retrying...`);
    // Try again with a more aggressive approach
    await page.evaluate((lbl) => {
      const btn = document.querySelector(`nav[aria-label="Page navigation"] button[aria-label="${lbl}"]`);
      if (btn) btn.click();
    }, label);
    await page.waitForTimeout(800);
    const actualPage2 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
    log.action(`${ts()} visitPage(${label}) retry — now on "${actualPage2}"`);
  } else {
    log.action(`${ts()} visitPage(${label}) ✓ confirmed`);
  }
}

async function scrollDown(page, steps = 5, stepSize = 600) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => {
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTop += y;
      else window.scrollBy(0, y);
    }, stepSize);
    summary.scrolls++;
    await page.waitForTimeout(150);
  }
  log.action(`${ts()} SCROLL ↓ ${steps}×${stepSize}px (total ${steps * stepSize}px)`);
}

async function scrollUp(page, steps = 3, stepSize = 600) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => {
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTop -= y;
      else window.scrollBy(0, -y);
    }, stepSize);
    summary.scrolls++;
    await page.waitForTimeout(150);
  }
  log.action(`${ts()} SCROLL ↑ ${steps}×${stepSize}px`);
}

async function scrollToTop(page) {
  await page.evaluate(() => {
    const el = document.querySelector('.overflow-y-auto');
    if (el) el.scrollTop = 0;
    else window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  log.action(`${ts()} SCROLL → top`);
}

// ── MAIN TEST SEQUENCE ───────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Test Runner',
  });
  const page = await context.newPage();

  await setupListeners(page);

  log.action(`${ts()} TEST START — full-scale interaction audit`);
  log.action(`${ts()} Viewport: 375×812 (mobile), hasTouch: true`);

  // ── 1. INITIAL LOAD ─────────────────────────────────────────────────────
  log.action(`${ts()} ─────────────────────────────────────────────────`);
  log.action(`${ts()} STAGE 1: Initial load`);
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000); // boot sequence
  log.action(`${ts()} Initial load complete (post-boot)`);

  // ── 2. HOME PAGE — click all visible buttons ────────────────────────────
  await visitPage(page, 'Home');
  log.action(`${ts()} STAGE 2: Home page interactions`);

  // Find every clickable element on Home
  const homeButtons = await page.locator('button:visible, a:visible, [role="button"]:visible').all();
  log.action(`${ts()} Found ${homeButtons.length} interactive elements on Home`);
  for (let i = 0; i < homeButtons.length; i++) {
    const el = homeButtons[i];
    const text = (await el.textContent().catch(() => '')).trim().slice(0, 50);
    const aria = await el.getAttribute('aria-label').catch(() => '');
    const label = `home#${i} ${aria || text || '(no label)'}`;
    // Skip the tab bar buttons (we handle those via visitPage) and the hamburger (we test separately)
    if (aria && ['Home', 'Trip', 'Map', 'Proposal', 'Us'].includes(aria)) continue;
    try {
      await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
      await el.click({ timeout: 2000, force: false });
      summary.clicks++;
      log.action(`${ts()} CLICK ✓ ${label}`);
      await page.waitForTimeout(250);
      // If a dialog opened, close it
      const closeBtn = page.locator('[role="dialog"] button[aria-label*="lose" i], [role="dialog"] button[aria-label*="Cancel" i]').first();
      if (await closeBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await closeBtn.click({ force: true }).catch(() => {});
        summary.dialogs++;
        log.action(`${ts()} DIALOG closed (auto)`);
        await page.waitForTimeout(300);
      }
    } catch (e) {
      log.action(`${ts()} CLICK ✗ ${label} — ${e.message.slice(0, 60)}`);
    }
  }

  // Scroll through Home
  await scrollDown(page, 4);
  await scrollUp(page, 2);
  await scrollToTop(page);

  // Open hamburger menu (mobile)
  log.action(`${ts()} STAGE 2b: Hamburger menu`);
  const hamburger = page.locator('button[aria-label="Open menu"], button[aria-label="Close menu"]').first();
  if (await hamburger.isVisible({ timeout: 1000 }).catch(() => false)) {
    await hamburger.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ hamburger menu open`);
    await page.waitForTimeout(500);
    // Close it again
    await hamburger.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ hamburger menu close`);
    await page.waitForTimeout(300);
  }

  // ── 3. TRIP PAGE — open every day, click every stop ─────────────────────
  await visitPage(page, 'Trip');
  log.action(`${ts()} STAGE 3: Trip page interactions`);

  // Click each day tab if there's a day switcher
  const dayTabs = await page.locator('[data-day], button:has-text("Day")').all();
  log.action(`${ts()} Found ${dayTabs.length} day-related elements`);

  // Click every visible stop card
  await scrollDown(page, 6);
  const stopCards = await page.locator('[class*="card"], [class*="stop"], [role="button"]').all();
  log.action(`${ts()} Found ${stopCards.length} card-like elements on Trip`);

  // Try clicking the first 5 stop cards (open + close dialog each time)
  for (let i = 0; i < Math.min(5, stopCards.length); i++) {
    const card = stopCards[i];
    try {
      const visible = await card.isVisible({ timeout: 500 }).catch(() => false);
      if (!visible) continue;
      const text = (await card.textContent().catch(() => '')).trim().slice(0, 60);
      await card.scrollIntoViewIfNeeded({ timeout: 500 }).catch(() => {});
      await card.click({ timeout: 1500, force: true });
      summary.clicks++;
      log.action(`${ts()} CLICK ✓ trip card #${i}: ${text}`);
      await page.waitForTimeout(500);
      // Close any dialog
      const closeBtn = page.locator('[role="dialog"] button[aria-label*="lose" i]').first();
      if (await closeBtn.isVisible({ timeout: 400 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        summary.dialogs++;
        log.action(`${ts()} DIALOG closed`);
        await page.waitForTimeout(300);
      }
    } catch (e) {
      log.action(`${ts()} CLICK ✗ trip card #${i} — ${e.message.slice(0, 60)}`);
    }
  }

  await scrollToTop(page);

  // ── 4. MAP PAGE ─────────────────────────────────────────────────────────
  await visitPage(page, 'Map');
  log.action(`${ts()} STAGE 4: Map page interactions`);

  // Click on map markers / list items
  const mapButtons = await page.locator('button:visible').all();
  log.action(`${ts()} Found ${mapButtons.length} visible buttons on Map`);
  for (let i = 0; i < Math.min(8, mapButtons.length); i++) {
    const btn = mapButtons[i];
    const text = (await btn.textContent().catch(() => '')).trim().slice(0, 40);
    if (!text) continue;
    try {
      await btn.scrollIntoViewIfNeeded({ timeout: 500 }).catch(() => {});
      await btn.click({ timeout: 1500, force: true });
      summary.clicks++;
      log.action(`${ts()} CLICK ✓ map btn #${i}: ${text}`);
      await page.waitForTimeout(300);
      const closeBtn = page.locator('[role="dialog"] button[aria-label*="lose" i]').first();
      if (await closeBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        summary.dialogs++;
        log.action(`${ts()} DIALOG closed`);
        await page.waitForTimeout(200);
      }
    } catch (e) {
      log.action(`${ts()} CLICK ✗ map btn #${i} — ${e.message.slice(0, 60)}`);
    }
  }

  await scrollDown(page, 3);

  // ── 5. PROPOSAL PAGE — trigger Pause, Celebrate, Share ─────────────────
  await visitPage(page, 'Proposal');
  log.action(`${ts()} STAGE 5: Proposal page interactions`);

  await scrollDown(page, 6);

  // Find and click "Celebrate the moment" button
  const celebrateBtn1 = page.locator('button:has-text("Celebrate"), button:has-text("celebrate")').first();
  if (await celebrateBtn1.isVisible({ timeout: 1000 }).catch(() => false)) {
    await celebrateBtn1.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ Celebrate button (confetti)`);
    await page.waitForTimeout(1500); // wait for confetti
  }

  // Find and click "Experience the moment" (The Pause)
  const pauseBtn = page.locator('button:has-text("Experience"), button:has-text("moment")').first();
  if (await pauseBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await pauseBtn.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ Experience the moment (The Pause overlay)`);
    log.action(`${ts()} PAUSE OVERLAY OPEN — waiting for countdown to complete (7s)`);
    await page.waitForTimeout(8500); // wait for the 7s countdown + 3s completion
    log.action(`${ts()} PAUSE OVERLAY should be auto-completing...`);
    // Click to dismiss if still visible
    const pauseOverlay = page.locator('div.fixed.inset-0.z-\\[200\\]');
    if (await pauseOverlay.isVisible({ timeout: 500 }).catch(() => false)) {
      await pauseOverlay.click({ force: true });
      log.action(`${ts()} CLICK ✓ dismiss Pause overlay`);
    }
    await page.waitForTimeout(500);
  }

  // Find and click "Share our moment"
  const shareBtn = page.locator('button:has-text("Share"), button:has-text("share")').first();
  if (await shareBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await shareBtn.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ Share our moment button`);
    await page.waitForTimeout(1000);
    // Dismiss alert if it appears (clipboard fallback)
    page.on('dialog', async (dialog) => {
      log.action(`${ts()} ALERT dialog: "${dialog.message().slice(0, 60)}"`);
      await dialog.accept().catch(() => {});
    });
  }

  // Click Celebrate again (lower one)
  const celebrateBtn2 = page.locator('button:has-text("Celebrate"), button:has-text("celebrate")').first();
  if (await celebrateBtn2.isVisible({ timeout: 1000 }).catch(() => false)) {
    await celebrateBtn2.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ Celebrate button #2 (bottom of page)`);
    await page.waitForTimeout(1500);
  }

  // Test QuoteCallout carousel auto-advance (just wait)
  log.action(`${ts()} Waiting for QuoteCallout carousel auto-advance (8s)`);
  summary.carousels++;
  await page.waitForTimeout(8000);
  log.action(`${ts()} Carousel observed for 8s`);

  await scrollToTop(page);

  // ── 6. US PAGE — gallery, ring, every section ───────────────────────────
  await visitPage(page, 'Us');
  log.action(`${ts()} STAGE 6: Us page interactions`);

  // Click gallery category buttons
  await scrollDown(page, 4);
  const galleryButtons = await page.locator('button:has-text("Park"), button:has-text("Trail"), button:has-text("Falls"), button:has-text("Lake")').all();
  log.action(`${ts()} Found ${galleryButtons.length} gallery category buttons`);
  for (let i = 0; i < Math.min(8, galleryButtons.length); i++) {
    const btn = galleryButtons[i];
    try {
      const visible = await btn.isVisible({ timeout: 500 }).catch(() => false);
      if (!visible) continue;
      const text = (await btn.textContent().catch(() => '')).trim().slice(0, 50);
      await btn.scrollIntoViewIfNeeded({ timeout: 500 }).catch(() => {});
      await btn.click({ timeout: 1500, force: true });
      summary.clicks++;
      log.action(`${ts()} CLICK ✓ gallery cat #${i}: ${text}`);
      await page.waitForTimeout(400);
    } catch (e) {
      log.action(`${ts()} CLICK ✗ gallery cat #${i} — ${e.message.slice(0, 60)}`);
    }
  }

  // Click Low-Effort stop cards
  await scrollDown(page, 4);
  const lowEffortCards = await page.locator('div[class*="card"], div[class*="stop"]').all();
  for (let i = 0; i < Math.min(3, lowEffortCards.length); i++) {
    const card = lowEffortCards[i];
    try {
      const visible = await card.isVisible({ timeout: 500 }).catch(() => false);
      if (!visible) continue;
      const text = (await card.textContent().catch(() => '')).trim().slice(0, 50);
      await card.scrollIntoViewIfNeeded({ timeout: 500 }).catch(() => {});
      await card.click({ timeout: 1500, force: true });
      summary.clicks++;
      log.action(`${ts()} CLICK ✓ low-effort card #${i}: ${text}`);
      await page.waitForTimeout(500);
      const closeBtn = page.locator('[role="dialog"] button[aria-label*="lose" i]').first();
      if (await closeBtn.isVisible({ timeout: 400 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        summary.dialogs++;
        log.action(`${ts()} DIALOG closed`);
        await page.waitForTimeout(300);
      }
    } catch (e) {
      log.action(`${ts()} CLICK ✗ low-effort card #${i} — ${e.message.slice(0, 60)}`);
    }
  }

  // Scroll to the very bottom (Footer)
  await scrollDown(page, 15);
  log.action(`${ts()} Reached bottom of Us page (About + Footer)`);

  // ── 7. SWIPE NAVIGATION TESTS ───────────────────────────────────────────
  log.action(`${ts()} STAGE 7: Swipe navigation`);
  await visitPage(page, 'Home');
  await page.waitForTimeout(500);
  await swipeAndLog(page, 'left', 200); // Home → Trip
  await page.waitForTimeout(800);
  // Verify which page we're on
  const currentPage1 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After swipe-left: now on "${currentPage1}"`);

  await swipeAndLog(page, 'left', 200); // Trip → Map
  await page.waitForTimeout(800);
  const currentPage2 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After swipe-left: now on "${currentPage2}"`);

  await swipeAndLog(page, 'right', 200); // Map → Trip
  await page.waitForTimeout(800);
  const currentPage3 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After swipe-right: now on "${currentPage3}"`);

  // ── 8. KEYBOARD NAVIGATION ──────────────────────────────────────────────
  log.action(`${ts()} STAGE 8: Keyboard navigation`);
  await visitPage(page, 'Home');
  await page.waitForTimeout(300);
  await pressAndLog(page, 'ArrowRight');
  const kb1 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After ArrowRight: now on "${kb1}"`);
  await pressAndLog(page, 'ArrowRight');
  const kb2 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After ArrowRight: now on "${kb2}"`);
  await pressAndLog(page, 'ArrowLeft');
  const kb3 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After ArrowLeft: now on "${kb3}"`);
  await pressAndLog(page, 'PageDown');
  const kb4 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After PageDown: now on "${kb4}"`);
  await pressAndLog(page, 'PageUp');
  const kb5 = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} After PageUp: now on "${kb5}"`);

  // ── 9. AMBIENT MUSIC PLAYER ─────────────────────────────────────────────
  log.action(`${ts()} STAGE 9: Ambient music player`);
  await visitPage(page, 'Home');
  await page.waitForTimeout(500);
  const musicBtn = page.locator('button[aria-label*="music" i], button:has-text("Ambient"), button:has-text("Score")').first();
  if (await musicBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await musicBtn.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ Ambient Score button (open player)`);
    await page.waitForTimeout(800);
    // Try to click play
    const playBtn = page.locator('button[aria-label*="play" i], button:has-text("Play")').first();
    if (await playBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await playBtn.click({ force: true });
      summary.clicks++;
      log.action(`${ts()} CLICK ✓ Play button (music)`);
      await page.waitForTimeout(2000);
      // Skip to next track
      const skipBtn = page.locator('button[aria-label*="skip" i], button:has-text("Skip"), button[aria-label*="next" i]').first();
      if (await skipBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await skipBtn.click({ force: true });
        summary.clicks++;
        log.action(`${ts()} CLICK ✓ Skip button`);
        await page.waitForTimeout(1500);
      }
      // Pause
      const pauseBtn = page.locator('button[aria-label*="pause" i], button:has-text("Pause")').first();
      if (await pauseBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await pauseBtn.click({ force: true });
        summary.clicks++;
        log.action(`${ts()} CLICK ✓ Pause button`);
        await page.waitForTimeout(500);
      }
    }
    // Close player
    const closeBtn = page.locator('button[aria-label*="close" i], button[aria-label*="Close" i]').first();
    if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await closeBtn.click({ force: true });
      summary.clicks++;
      log.action(`${ts()} CLICK ✓ Close music player`);
      await page.waitForTimeout(300);
    }
  } else {
    log.action(`${ts()} SKIP: Ambient Score button not found`);
  }

  // ── 10. PLACE DETAIL DIALOG (deep test) ─────────────────────────────────
  log.action(`${ts()} STAGE 10: Place detail dialog deep test`);
  await visitPage(page, 'Map');
  await page.waitForTimeout(800);
  // Click first map place button
  const placeBtn = page.locator('button:visible').filter({ hasText: /Park|Falls|Lake|Trail|Notch|Mountain/ }).first();
  if (await placeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    const text = (await placeBtn.textContent().catch(() => '')).trim().slice(0, 50);
    await placeBtn.click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ Place button: ${text}`);
    await page.waitForTimeout(1000);
    // Verify dialog open
    const dialog = page.locator('[role="dialog"]').first();
    if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
      summary.dialogs++;
      log.action(`${ts()} DIALOG opened (Place detail)`);
      // Scroll inside dialog
      await page.waitForTimeout(500);
      // Click any buttons inside dialog
      const dialogBtns = await dialog.locator('button').all();
      log.action(`${ts()} Dialog has ${dialogBtns.length} buttons`);
      for (let i = 0; i < Math.min(5, dialogBtns.length); i++) {
        try {
          const btnText = (await dialogBtns[i].textContent().catch(() => '')).trim().slice(0, 30);
          // Skip close button
          if (btnText.toLowerCase().includes('close') || btnText.toLowerCase().includes('×')) continue;
          // Scroll the dialog content to bring the button into view
          await dialogBtns[i].evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {});
          await page.waitForTimeout(200);
          const visible = await dialogBtns[i].isVisible({ timeout: 500 }).catch(() => false);
          if (!visible) {
            log.action(`${ts()} SKIP dialog btn #${i} (not visible): ${btnText}`);
            continue;
          }
          await dialogBtns[i].click({ timeout: 1500, force: true });
          summary.clicks++;
          log.action(`${ts()} CLICK ✓ dialog btn #${i}: ${btnText}`);
          await page.waitForTimeout(500);
        } catch (e) {
          log.action(`${ts()} CLICK ✗ dialog btn #${i} — ${e.message.slice(0, 80)}`);
        }
      }
      // Close dialog
      const closeBtn = dialog.locator('button[aria-label*="lose" i], button:has-text("Close"), button:has-text("×")').first();
      if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        summary.clicks++;
        log.action(`${ts()} CLICK ✓ Close dialog`);
        await page.waitForTimeout(500);
      } else {
        // Press Escape
        await pressAndLog(page, 'Escape');
      }
    }
  }

  // ── 11. SWIPE UP/DOWN (vertical) ────────────────────────────────────────
  log.action(`${ts()} STAGE 11: Vertical swipe (scroll)`);
  await visitPage(page, 'Us');
  await page.waitForTimeout(500);
  await swipeAndLog(page, 'up', 300);
  await swipeAndLog(page, 'down', 300);

  // ── 12. RAPID TAB SWITCHING (stress test) ───────────────────────────────
  log.action(`${ts()} STAGE 12: Rapid tab switching (stress test)`);
  const tabs = ['Trip', 'Map', 'Home', 'Us', 'Proposal', 'Home', 'Trip', 'Map'];
  for (const tab of tabs) {
    await page.locator(`nav[aria-label="Page navigation"] button[aria-label="${tab}"]`).click({ force: true });
    summary.clicks++;
    log.action(`${ts()} CLICK ✓ stress-tab: ${tab}`);
    await page.waitForTimeout(250);
  }

  // ── 13. BOOT SEQUENCE RE-TRIGGER (reload) ───────────────────────────────
  log.action(`${ts()} STAGE 13: Page reload (boot sequence re-trigger)`);
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  log.action(`${ts()} Page reloaded — boot sequence should have replayed`);

  // ── 14. FINAL CHECK ─────────────────────────────────────────────────────
  log.action(`${ts()} STAGE 14: Final state check`);
  await visitPage(page, 'Home');
  const finalPage = await page.locator('nav[aria-label="Page navigation"] button[aria-current="page"]').getAttribute('aria-label').catch(() => 'unknown');
  log.action(`${ts()} Final page: "${finalPage}"`);

  // ── WRITE SUMMARY ───────────────────────────────────────────────────────
  summary.endTime = new Date().toISOString();
  summary.durationSec = ((Date.now() - startMs) / 1000).toFixed(1);
  writeFileSync(`${LOG_DIR}/summary.json`, JSON.stringify(summary, null, 2));

  log.action(`${ts()} ─────────────────────────────────────────────────`);
  log.action(`${ts()} TEST COMPLETE — summary:`);
  log.action(`${ts()}   Pages visited: ${summary.pagesVisited.length}`);
  log.action(`${ts()}   Clicks: ${summary.clicks}`);
  log.action(`${ts()}   Swipes: ${summary.swipes}`);
  log.action(`${ts()}   Keys pressed: ${summary.keysPressed}`);
  log.action(`${ts()}   Scrolls: ${summary.scrolls}`);
  log.action(`${ts()}   Dialogs opened: ${summary.dialogs}`);
  log.action(`${ts()}   Carousels observed: ${summary.carousels}`);
  log.action(`${ts()}   Network requests: ${summary.networkRequests}`);
  log.action(`${ts()}   Network failures: ${summary.networkFailed}`);
  log.action(`${ts()}   Console logs: ${summary.consoleLogs}`);
  log.action(`${ts()}   Console warnings: ${summary.consoleWarnings}`);
  log.action(`${ts()}   Console errors: ${summary.consoleErrors}`);
  log.action(`${ts()}   Uncaught exceptions: ${summary.uncaughtExceptions}`);
  log.action(`${ts()}   Duration: ${summary.durationSec}s`);

  await browser.close();

  console.log('\n=== TEST SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nLogs written to: ${LOG_DIR}/`);
})();
