#!/usr/bin/env node
/**
 * Generate PWA icons (192, 512, maskable 512, apple-touch 180) from an SVG source.
 * Output PNGs go to /public/icons/.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(ICONS_DIR, { recursive: true });

// Logo SVG: dark emerald gradient background, white mountain silhouette, ring/heart accent
const logoSvg = (size, padded = false) => {
  const pad = padded ? size * 0.1 : 0; // maskable safe zone
  const inner = size - pad * 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="50%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#e11d48"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${padded ? 0 : size * 0.18}"/>
  <g transform="translate(${pad}, ${pad})">
    <!-- Mountain silhouette -->
    <path d="M ${inner * 0.08} ${inner * 0.78} L ${inner * 0.32} ${inner * 0.32} L ${inner * 0.42} ${inner * 0.48} L ${inner * 0.52} ${inner * 0.22} L ${inner * 0.62} ${inner * 0.42} L ${inner * 0.72} ${inner * 0.32} L ${inner * 0.92} ${inner * 0.78} Z" fill="#ffffff" opacity="0.95"/>
    <!-- Snow caps -->
    <path d="M ${inner * 0.32} ${inner * 0.32} L ${inner * 0.37} ${inner * 0.4} L ${inner * 0.42} ${inner * 0.48} L ${inner * 0.36} ${inner * 0.45} Z" fill="#fef3c7" opacity="0.9"/>
    <path d="M ${inner * 0.52} ${inner * 0.22} L ${inner * 0.57} ${inner * 0.32} L ${inner * 0.62} ${inner * 0.42} L ${inner * 0.55} ${inner * 0.36} Z" fill="#fef3c7" opacity="0.9"/>
    <!-- Sun/moon -->
    <circle cx="${inner * 0.78}" cy="${inner * 0.22}" r="${inner * 0.07}" fill="#fbbf24" opacity="0.9"/>
    <!-- Ring (proposal) -->
    <circle cx="${inner * 0.5}" cy="${inner * 0.85}" r="${inner * 0.06}" fill="none" stroke="url(#ring)" stroke-width="${inner * 0.022}"/>
    <circle cx="${inner * 0.5}" cy="${inner * 0.78}" r="${inner * 0.018}" fill="url(#ring)"/>
  </g>
</svg>`;
};

(async () => {
  // Standard icons
  await sharp(Buffer.from(logoSvg(192))).png().toFile(path.join(ICONS_DIR, "icon-192.png"));
  await sharp(Buffer.from(logoSvg(512))).png().toFile(path.join(ICONS_DIR, "icon-512.png"));
  // Maskable (padded for safe zone)
  await sharp(Buffer.from(logoSvg(512, true))).png().toFile(path.join(ICONS_DIR, "icon-maskable-512.png"));
  // Apple touch icon (180, rounded corners are added by iOS itself, so use square)
  await sharp(Buffer.from(logoSvg(180))).png().toFile(path.join(ICONS_DIR, "apple-touch-icon.png"));
  // Favicon 32
  await sharp(Buffer.from(logoSvg(32))).png().toFile(path.join(ICONS_DIR, "favicon-32.png"));
  console.log("✅ Generated PWA icons:");
  for (const f of fs.readdirSync(ICONS_DIR)) {
    const stat = fs.statSync(path.join(ICONS_DIR, f));
    console.log(`   ${f} (${stat.size} bytes)`);
  }
})();
