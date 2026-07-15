/**
 * generate_icons.mjs
 *
 * Generates 12 themed PWA icons (192×192 and 512×512 PNG) by rendering
 * SVG designs in a headless browser canvas and saving as PNG.
 *
 * Icons:
 *   1. sunrise     — dawn (5–8 AM)
 *   2. morning     — bright day (8–12 PM)
 *   3. afternoon   — warm afternoon (12–5 PM)
 *   4. golden-hour — golden hour (5–7 PM)
 *   5. sunset      — sunset (7–8 PM)
 *   6. dusk        — dusk/twilight (8–9 PM)
 *   7. midnight    — deep night (9 PM–1 AM)
 *   8. stargazing  — starry sky (1–4 AM)
 *   9. heart       — love themed
 *  10. ring        — engagement ring
 *  11. proposal    — proposal moment
 *  12. anniversary — anniversary/eternal
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OUT_DIR = '/home/z/my-project/public/icons/themes';
mkdirSync(OUT_DIR, { recursive: true });

// ── Icon SVG designs ────────────────────────────────────────────────────
// Each is a 512×512 SVG with a background color + foreground design.
// The SVGs use simple shapes so they render crisply at any size.

const ICONS = {
  sunrise: {
    bg: '#f59e0b',
    bgGradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbbf24"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Sun half -->
      <circle cx="256" cy="320" r="90" fill="#fef3c7" opacity="0.95"/>
      <!-- Rays -->
      <g stroke="#fef3c7" stroke-width="8" stroke-linecap="round" opacity="0.8">
        <line x1="256" y1="190" x2="256" y2="160"/>
        <line x1="180" y1="244" x2="160" y2="224"/>
        <line x1="332" y1="244" x2="352" y2="224"/>
        <line x1="140" y1="320" x2="110" y2="320"/>
        <line x1="372" y1="320" x2="402" y2="320"/>
      </g>
      <!-- Horizon line -->
      <rect x="80" y="320" width="352" height="6" fill="#92400e" opacity="0.6"/>
      <!-- Mountains -->
      <path d="M80 326 L160 250 L220 326 Z" fill="#92400e" opacity="0.7"/>
      <path d="M220 326 L300 230 L380 326 Z" fill="#78350f" opacity="0.8"/>
      <path d="M340 326 L400 270 L432 326 Z" fill="#92400e" opacity="0.7"/>
    </svg>`
  },
  morning: {
    bg: '#38bdf8',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0ea5e9"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Full sun -->
      <circle cx="256" cy="200" r="70" fill="#fef08a"/>
      <circle cx="256" cy="200" r="50" fill="#fde047"/>
      <!-- Rays -->
      <g stroke="#fef08a" stroke-width="8" stroke-linecap="round" opacity="0.7">
        <line x1="256" y1="100" x2="256" y2="80"/>
        <line x1="180" y1="124" x2="165" y2="109"/>
        <line x1="332" y1="124" x2="347" y2="109"/>
        <line x1="140" y1="200" x2="120" y2="200"/>
        <line x1="372" y1="200" x2="392" y2="200"/>
        <line x1="180" y1="276" x2="165" y2="291"/>
        <line x1="332" y1="276" x2="347" y2="291"/>
      </g>
      <!-- Clouds -->
      <ellipse cx="150" cy="340" rx="60" ry="25" fill="white" opacity="0.85"/>
      <ellipse cx="190" cy="335" rx="50" ry="22" fill="white" opacity="0.85"/>
      <ellipse cx="360" cy="380" rx="70" ry="28" fill="white" opacity="0.8"/>
      <ellipse cx="400" cy="375" rx="50" ry="22" fill="white" opacity="0.8"/>
    </svg>`
  },
  afternoon: {
    bg: '#06b6d4',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#0891b2"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Sun high -->
      <circle cx="256" cy="160" r="60" fill="#fef08a"/>
      <!-- Pine trees -->
      <g fill="#15803d">
        <path d="M120 360 L150 200 L180 360 Z"/>
        <rect x="142" y="350" width="16" height="30" fill="#78350f"/>
        <path d="M200 380 L240 180 L280 380 Z"/>
        <rect x="232" y="370" width="16" height="30" fill="#78350f"/>
        <path d="M300 370 L330 220 L360 370 Z"/>
        <rect x="322" y="360" width="16" height="30" fill="#78350f"/>
        <path d="M380 390 L410 240 L440 390 Z"/>
        <rect x="402" y="380" width="16" height="30" fill="#78350f"/>
      </g>
      <!-- Ground -->
      <rect x="0" y="390" width="512" height="122" fill="#166534" opacity="0.3"/>
    </svg>`
  },
  golden: {
    bg: '#f97316',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbbf24"/><stop offset="50%" stop-color="#f97316"/><stop offset="100%" stop-color="#dc2626"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Sun low -->
      <circle cx="256" cy="340" r="80" fill="#fef3c7" opacity="0.95"/>
      <circle cx="256" cy="340" r="60" fill="#fde047"/>
      <!-- Cliff silhouette -->
      <path d="M0 380 L100 380 L140 280 L180 380 L260 380 L300 220 L340 380 L420 380 L460 320 L512 380 L512 512 L0 512 Z" fill="#7c2d12" opacity="0.85"/>
      <!-- Lake reflection -->
      <rect x="0" y="380" width="512" height="132" fill="#7c2d12" opacity="0.3"/>
      <ellipse cx="256" cy="420" rx="80" ry="8" fill="#fde047" opacity="0.4"/>
    </svg>`
  },
  sunset: {
    bg: '#dc2626',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f97316"/><stop offset="40%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7c2d12"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Half sun at horizon -->
      <circle cx="256" cy="360" r="80" fill="#fef3c7" opacity="0.9"/>
      <rect x="160" y="360" width="192" height="80" fill="url(#bg)"/>
      <!-- Horizon -->
      <rect x="0" y="358" width="512" height="4" fill="#7c2d12" opacity="0.8"/>
      <!-- Cliff -->
      <path d="M0 362 L80 362 L120 280 L160 362 L512 362 L512 512 L0 512 Z" fill="#7c2d12"/>
      <!-- Stars appearing -->
      <circle cx="100" cy="100" r="3" fill="white" opacity="0.6"/>
      <circle cx="400" cy="80" r="2" fill="white" opacity="0.5"/>
      <circle cx="300" cy="120" r="2" fill="white" opacity="0.4"/>
    </svg>`
  },
  dusk: {
    bg: '#7c3aed',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7c3aed"/><stop offset="50%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#4c1d95"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Crescent moon -->
      <circle cx="256" cy="180" r="60" fill="#fef3c7"/>
      <circle cx="276" cy="170" r="55" fill="url(#bg)"/>
      <!-- Stars -->
      <g fill="white" opacity="0.8">
        <circle cx="80" cy="100" r="3"/>
        <circle cx="150" cy="150" r="2"/>
        <circle cx="400" cy="120" r="3"/>
        <circle cx="440" cy="200" r="2"/>
        <circle cx="100" cy="250" r="2"/>
        <circle cx="380" cy="280" r="2"/>
      </g>
      <!-- Firefly glows -->
      <circle cx="120" cy="380" r="4" fill="#fde047" opacity="0.6"/>
      <circle cx="180" cy="420" r="3" fill="#fde047" opacity="0.5"/>
      <circle cx="380" cy="400" r="4" fill="#fde047" opacity="0.6"/>
      <!-- Ground -->
      <rect x="0" y="420" width="512" height="92" fill="#1e1b4b" opacity="0.6"/>
    </svg>`
  },
  midnight: {
    bg: '#1e1b4b',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f0a2e"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Full moon -->
      <circle cx="256" cy="200" r="70" fill="#e0e7ff"/>
      <circle cx="230" cy="180" r="12" fill="#c7d2fe" opacity="0.6"/>
      <circle cx="280" cy="210" r="8" fill="#c7d2fe" opacity="0.5"/>
      <!-- Many stars -->
      <g fill="white">
        <circle cx="60" cy="80" r="2.5" opacity="0.9"/>
        <circle cx="120" cy="120" r="2" opacity="0.7"/>
        <circle cx="180" cy="60" r="3" opacity="0.9"/>
        <circle cx="350" cy="90" r="2" opacity="0.7"/>
        <circle cx="420" cy="140" r="2.5" opacity="0.8"/>
        <circle cx="450" cy="80" r="1.5" opacity="0.6"/>
        <circle cx="80" cy="280" r="2" opacity="0.7"/>
        <circle cx="400" cy="300" r="2.5" opacity="0.8"/>
        <circle cx="440" cy="350" r="1.5" opacity="0.5"/>
        <circle cx="60" cy="350" r="2" opacity="0.6"/>
      </g>
      <!-- Pines silhouette -->
      <g fill="#0f0a2e">
        <path d="M0 512 L0 400 L60 350 L120 400 L120 512 Z"/>
        <path d="M100 512 L100 380 L180 300 L260 380 L260 512 Z"/>
        <path d="M240 512 L240 390 L320 320 L400 390 L400 512 Z"/>
        <path d="M380 512 L380 400 L460 350 L512 400 L512 512 Z"/>
      </g>
    </svg>`
  },
  stargazing: {
    bg: '#0f0a2e',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f0a2e"/><stop offset="50%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#312e81"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Milky Way band -->
      <ellipse cx="256" cy="256" rx="280" ry="60" fill="#6366f1" opacity="0.15" transform="rotate(-20 256 256)"/>
      <ellipse cx="256" cy="256" rx="240" ry="40" fill="#818cf8" opacity="0.1" transform="rotate(-20 256 256)"/>
      <!-- Dense stars -->
      <g fill="white">
        ${Array.from({length: 30}, (_, i) => {
          const x = (i * 37 + 20) % 480 + 16;
          const y = (i * 53 + 40) % 400 + 30;
          const r = (i % 3 === 0) ? 3 : (i % 2 === 0) ? 2 : 1.5;
          const op = 0.5 + (i % 5) * 0.1;
          return `<circle cx="${x}" cy="${y}" r="${r}" opacity="${op}"/>`;
        }).join('')}
      </g>
      <!-- Big dipper-like cluster -->
      <g fill="#fde047" opacity="0.9">
        <circle cx="140" cy="150" r="4"/>
        <circle cx="180" cy="170" r="3.5"/>
        <circle cx="220" cy="190" r="3"/>
        <circle cx="260" cy="200" r="3.5"/>
        <circle cx="280" cy="240" r="3"/>
        <circle cx="310" cy="270" r="3.5"/>
        <circle cx="340" cy="260" r="3"/>
      </g>
    </svg>`
  },
  heart: {
    bg: '#dc2626',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Big heart -->
      <path d="M256 380 C 256 380, 120 280, 120 200 C 120 150, 160 120, 200 120 C 230 120, 250 140, 256 160 C 262 140, 282 120, 312 120 C 352 120, 392 150, 392 200 C 392 280, 256 380, 256 380 Z" fill="#fef2f2"/>
      <!-- Sparkle -->
      <circle cx="200" cy="180" r="6" fill="white" opacity="0.8"/>
      <circle cx="210" cy="175" r="3" fill="white" opacity="0.6"/>
    </svg>`
  },
  ring: {
    bg: '#b8860b',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b8860b"/><stop offset="100%" stop-color="#92400e"/>
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde047"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#a16207"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Ring band -->
      <ellipse cx="256" cy="320" rx="100" ry="100" fill="none" stroke="url(#gold)" strokeWidth="20"/>
      <!-- Diamond -->
      <path d="M256 140 L220 200 L256 240 L292 200 Z" fill="#e0e7ff"/>
      <path d="M220 200 L256 240 L292 200 Z" fill="#c7d2fe"/>
      <!-- Sparkle -->
      <circle cx="240" cy="180" r="4" fill="white"/>
      <circle cx="270" cy="210" r="3" fill="white" opacity="0.8"/>
    </svg>`
  },
  proposal: {
    bg: '#be185d',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#9d174d"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Cliff -->
      <path d="M0 350 L100 350 L150 250 L200 350 L512 350 L512 512 L0 512 Z" fill="#831843"/>
      <!-- Sun setting -->
      <circle cx="256" cy="280" r="50" fill="#fde047" opacity="0.9"/>
      <!-- Ring on cliff -->
      <ellipse cx="256" cy="330" rx="30" ry="30" fill="none" stroke="#fde047" strokeWidth="6"/>
      <path d="M256 300 L246 318 L256 330 L266 318 Z" fill="#e0e7ff"/>
      <!-- Hearts rising -->
      <path d="M150 200 C 150 200, 130 180, 130 165 C 130 155, 140 150, 150 150 C 155 150, 150 160, 150 165 C 150 160, 155 150, 160 150 C 170 150, 170 155, 170 165 C 170 180, 150 200, 150 200 Z" fill="white" opacity="0.6"/>
      <path d="M362 180 C 362 180, 352 170, 352 163 C 352 158, 357 155, 362 155 C 365 155, 362 160, 362 163 C 362 160, 367 155, 370 155 C 375 155, 375 158, 375 163 C 375 170, 362 180, 362 180 Z" fill="white" opacity="0.5"/>
    </svg>`
  },
  anniversary: {
    bg: '#6d28d9',
    svg: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#5b21b6"/>
      </linearGradient></defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <!-- Infinity symbol -->
      <path d="M156 256 C 120 200, 180 180, 210 210 C 240 240, 256 256, 256 256 C 256 256, 272 272, 302 302 C 332 332, 392 312, 356 256 C 392 200, 332 180, 302 210 C 272 240, 256 256, 256 256 C 256 256, 240 240, 210 210 C 180 180, 120 200, 156 256 Z"
            fill="none" stroke="#fde047" strokeWidth="16" strokeLinejoin="round"/>
      <!-- Stars around -->
      <g fill="white" opacity="0.7">
        <circle cx="80" cy="120" r="2"/>
        <circle cx="432" cy="120" r="2"/>
        <circle cx="60" cy="380" r="2"/>
        <circle cx="452" cy="380" r="2"/>
        <circle cx="256" cy="80" r="2.5"/>
        <circle cx="256" cy="432" r="2.5"/>
      </g>
    </svg>`
  },
};

// ── Time-of-day mapping ─────────────────────────────────────────────────
const TIME_SLOTS = [
  { hour: 5, icon: 'sunrise' },      // 5–8 AM
  { hour: 8, icon: 'morning' },      // 8–12 PM
  { hour: 12, icon: 'afternoon' },   // 12–5 PM
  { hour: 17, icon: 'golden' },      // 5–7 PM
  { hour: 19, icon: 'sunset' },      // 7–8 PM
  { hour: 20, icon: 'dusk' },        // 8–9 PM
  { hour: 21, icon: 'midnight' },    // 9 PM–1 AM
  { hour: 1, icon: 'stargazing' },   // 1–5 AM
];

function getIconForHour(hour) {
  for (let i = TIME_SLOTS.length - 1; i >= 0; i--) {
    if (hour >= TIME_SLOTS[i].hour) return TIME_SLOTS[i].icon;
  }
  return 'stargazing'; // before 5 AM
}

// ── Generate PNGs ────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const iconNames = Object.keys(ICONS);

  for (const name of iconNames) {
    const icon = ICONS[name];
    const html = `<!DOCTYPE html><html><head><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { width: 512px; height: 512px; overflow: hidden; }
      svg { width: 512px; height: 512px; display: block; }
    </style></head><body>${icon.svg}</body></html>`;

    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    // Generate 192×192
    await page.setViewportSize({ width: 192, height: 192 });
    await page.evaluate(() => {
      document.querySelector('svg').setAttribute('width', '192');
      document.querySelector('svg').setAttribute('height', '192');
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(OUT_DIR, `${name}-192.png`), omitBackground: false });

    // Generate 512×512
    await page.setViewportSize({ width: 512, height: 512 });
    await page.evaluate(() => {
      document.querySelector('svg').setAttribute('width', '512');
      document.querySelector('svg').setAttribute('height', '512');
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(OUT_DIR, `${name}-512.png`), omitBackground: false });

    // Generate maskable (with padding for safe zone)
    const maskableHtml = `<!DOCTYPE html><html><head><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { width: 512px; height: 512px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
      .icon { width: 360px; height: 360px; }
      svg { width: 100%; height: 100%; display: block; }
    </style></head><body><div class="icon">${icon.svg}</div></body></html>`;
    await page.setContent(maskableHtml, { waitUntil: 'networkidle' });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(OUT_DIR, `${name}-maskable-512.png`), omitBackground: false });

    console.log(`✓ Generated ${name} (192, 512, maskable)`);
  }

  // Also generate apple-touch-icon (180×180) for each
  for (const name of iconNames) {
    const icon = ICONS[name];
    const html = `<!DOCTYPE html><html><head><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { width: 180px; height: 180px; overflow: hidden; }
      svg { width: 180px; height: 180px; display: block; }
    </style></head><body>${icon.svg}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(OUT_DIR, `${name}-apple-180.png`), omitBackground: false });
  }
  console.log(`✓ Generated apple-touch-icons for all themes`);

  // Write the time-slot mapping + icon list as JSON
  const config = {
    icons: iconNames.map(name => ({
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      hasSizes: ['192', '512', 'maskable-512', 'apple-180'],
    })),
    timeSlots: TIME_SLOTS,
    getIconForHour,
  };
  writeFileSync(
    path.join(OUT_DIR, 'config.json'),
    JSON.stringify(config, null, 2)
  );
  console.log(`✓ Wrote config.json`);

  await browser.close();
  console.log(`\n=== Done — ${iconNames.length * 4} icons generated in ${OUT_DIR} ===`);
})();
