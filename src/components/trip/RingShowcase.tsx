"use client";

/**
 * RingShowcase.tsx
 *
 * SVG ring illustration (rose gold band, green fire opal, moss agate leaves).
 * 6 detail cards.
 * 6 symbolism cards.
 * "Ring Meets Wilderness" poem.
 * Ring quote.
 *
 * Gender-neutral throughout ("Partner Set" — never "His & Hers").
 * NO price anywhere.
 */

import { memo, useState } from "react";
import { FlyIn, FlyInStagger, FlyInItem } from "./FlyIn";
import { LazyImage } from "@/lib/use-lazy-image";
import { getImage } from "@/lib/images";
import QuoteCallout from "./QuoteCallout";
import { Icon as SvgIcon, type IconName } from "@/components/icons/Icon";

const DETAILS = [
  { icon: "nature", title: "Rose Gold Band", text: "14k rose gold — a warm, blush-toned metal that mirrors the colors of sunset on Table Rock." },
  { icon: "heart", title: "Green Fire Opal", text: "Ethically sourced green fire opal center stone — flashes of emerald and amber in changing light." },
  { icon: "nature", title: "Moss Agate Leaves", text: "Two hand-carved moss agate leaves flank the stone, each with unique dendritic inclusions like miniature forests." },
  { icon: "nature", title: "Vine Motif Shoulders", text: "Tapered shoulders sweep up in a hand-engraved vine motif, cradling the center stone." },
  { icon: "sparkle", title: "Pavé Trail Band", text: "A delicate pavé trail of conflict-free diamonds runs along the gallery, catching lantern light." },
  { icon: "mountain", title: "Comfort Fit Inside", text: "Inside the band is rounded for an all-day comfort fit — ready for trails, campfires, and canoe paddles." },
];

const SYMBOLISM = [
  { icon: "mountain", title: "The Cliff", text: "The center opal stands like Table Rock — held aloft by the band as the cliff is held by the notch." },
  { icon: "nature", title: "The Pines", text: "Moss agate leaves mirror the deep pine canopy that shelters every campsite on the route." },
  { icon: "water", title: "The Mirror", text: "The opal's play of color reflects the lake that mirrors the cliff — two surfaces, one light." },
  { icon: "sparkle", title: "The Golden Hour", text: "Rose gold captures the exact 7:30 PM warmth that turns the granite pink and orange." },
  { icon: "stargaze", title: "The Dark Sky", text: "Pavé diamonds recall the Bortle Class 2 Milky Way reflected in Little Diamond Pond." },
  { icon: "infinity", title: "The Circle", text: "An unbroken band — no beginning, no end — the simplest and oldest promise two people can make." },
];

function RingSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-label="Engagement ring illustration">
      <defs>
        <linearGradient id="roseGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6c6b4" />
          <stop offset="50%" stopColor="#e3a595" />
          <stop offset="100%" stopColor="#b76a58" />
        </linearGradient>
        <linearGradient id="roseGoldDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d89887" />
          <stop offset="100%" stopColor="#8d4f43" />
        </linearGradient>
        <radialGradient id="opal" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bfe6a8" />
          <stop offset="35%" stopColor="#5fa86d" />
          <stop offset="70%" stopColor="#2d6b46" />
          <stop offset="100%" stopColor="#143a26" />
        </radialGradient>
        <radialGradient id="agate" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9bbf86" />
          <stop offset="100%" stopColor="#46612f" />
        </radialGradient>
        <radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow behind the ring */}
      <circle cx="100" cy="110" r="80" fill="url(#sparkle)" opacity="0.4" />

      {/* Band — torus illusion (two arcs) */}
      <ellipse cx="100" cy="115" rx="55" ry="55" fill="none" stroke="url(#roseGold)" strokeWidth="14" />
      <ellipse cx="100" cy="115" rx="55" ry="55" fill="none" stroke="url(#roseGoldDark)" strokeWidth="3" opacity="0.6" />
      {/* Inner shadow */}
      <ellipse cx="100" cy="115" rx="48" ry="48" fill="none" stroke="#5c2b22" strokeWidth="1.5" opacity="0.4" />

      {/* Left shoulder — vine */}
      <path d="M70 78 Q60 65 70 60 Q80 65 75 80 Z" fill="url(#roseGold)" />
      {/* Right shoulder — vine */}
      <path d="M130 78 Q140 65 130 60 Q120 65 125 80 Z" fill="url(#roseGold)" />

      {/* Left moss-agate leaf */}
      <path
        d="M62 64 Q40 50 30 60 Q40 75 62 70 Z"
        fill="url(#agate)"
        stroke="#3a4a25"
        strokeWidth="0.8"
      />
      {/* Dendritic inclusions on left leaf */}
      <path d="M40 58 Q45 62 50 60 M38 64 Q44 67 50 65" stroke="#2a3318" strokeWidth="0.6" fill="none" opacity="0.7" />

      {/* Right moss-agate leaf */}
      <path
        d="M138 64 Q160 50 170 60 Q160 75 138 70 Z"
        fill="url(#agate)"
        stroke="#3a4a25"
        strokeWidth="0.8"
      />
      {/* Dendritic inclusions on right leaf */}
      <path d="M160 58 Q155 62 150 60 M162 64 Q156 67 150 65" stroke="#2a3318" strokeWidth="0.6" fill="none" opacity="0.7" />

      {/* Center stone — green fire opal */}
      <circle cx="100" cy="60" r="22" fill="url(#opal)" stroke="#143a26" strokeWidth="1" />
      {/* Opal facets */}
      <path d="M100 38 L112 56 L88 56 Z" fill="#fff" opacity="0.18" />
      <path d="M88 56 L112 56 L100 78 Z" fill="#000" opacity="0.12" />
      {/* Sparkle */}
      <circle cx="92" cy="50" r="3" fill="#fff" opacity="0.85">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Pavé dots along the band shoulders */}
      {Array.from({ length: 6 }).map((_, i) => (
        <circle key={`pave-l-${i}`} cx={62 - i * 1.5} cy={75 + i * 6} r="1.2" fill="#fff" opacity="0.85" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <circle key={`pave-r-${i}`} cx={138 + i * 1.5} cy={75 + i * 6} r="1.2" fill="#fff" opacity="0.85" />
      ))}
    </svg>
  );
}

function RingShowcaseImpl() {
  return (
    <section className="px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <FlyIn className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rust-bark/80 px-3 py-1 text-[11px] uppercase tracking-widest text-rust-bg">
            The Ring · Partner Set
          </div>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl md:text-5xl font-bold text-rust-bark">
            Forged from the forest &amp; the cliff
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-rust-bark/70">
            A partner set — two rings that mirror each other the way the lake
            mirrors the cliff. No price, just meaning.
          </p>
        </FlyIn>

        {/* Real ring photos + engraving */}
        <RingPhotoGallery />

        {/* 6 detail cards */}
        <FlyInStagger className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
          {DETAILS.map((d) => (
            <FlyInItem key={d.title}>
              <div className="leather-card parchment-texture anim-hover-lift rounded-2xl p-4 h-full">
                <div className="mb-1 flex items-center justify-center" aria-hidden><SvgIcon name={d.icon as IconName} size={28} /></div>
                <div className="font-serif text-base font-bold text-rust-bark">{d.title}</div>
                <p className="mt-1 text-xs text-rust-bark/70 leading-relaxed">{d.text}</p>
              </div>
            </FlyInItem>
          ))}
        </FlyInStagger>

        {/* 6 symbolism cards */}
        <FlyIn className="mb-8">
          <h3 className="mb-4 text-center font-serif text-2xl font-bold text-rust-bark">
            Ring Meets Wilderness
          </h3>
          <FlyInStagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {SYMBOLISM.map((s) => (
              <FlyInItem key={s.title}>
                <div className="bark-card rounded-2xl p-4 h-full text-rust-cream">
                  <div className="mb-1 flex items-center justify-center" aria-hidden><SvgIcon name={s.icon as IconName} size={28} /></div>
                  <div className="font-serif text-base font-bold text-rust-brass">{s.title}</div>
                  <p className="mt-1 text-xs text-rust-cream/80 leading-relaxed">{s.text}</p>
                </div>
              </FlyInItem>
            ))}
          </FlyInStagger>
        </FlyIn>

        {/* U-05: Ring poem as full-bleed feature page */}
        <FlyIn className="mb-8">
          <div className="relative min-h-[50vh] flex items-center justify-center rounded-3xl overflow-hidden leather-card parchment-texture">
            <div className="absolute inset-0 border-2 border-rust-brass/20 rounded-3xl" />
            <div className="relative z-10 px-6 py-12 text-center">
              <svg viewBox="0 0 40 40" className="mx-auto mb-6 h-10 w-10 text-rust-brass" aria-hidden>
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="20" cy="20" r="6" fill="currentColor" opacity="0.3" />
              </svg>
              <p className="mx-auto max-w-2xl font-serif italic text-xl sm:text-2xl md:text-3xl leading-relaxed text-rust-bark">
                Where the cliff meets the lake, where the lake meets the sky,<br />
                we forged us a ring of the moment gone by.<br />
                Rose-gold for the sunset, green opal for pine,<br />
                and a circle unbroken — as one, you and I.
              </p>
            </div>
          </div>
        </FlyIn>

        {/* Ring quote */}
        <FlyIn>
          <QuoteCallout theme="ring" count={3} seed="ringshowcase" />
        </FlyIn>
      </div>
    </section>
  );
}

const RingShowcase = memo(RingShowcaseImpl);
export default RingShowcase;

// ── Ring photo gallery with real images + engraving ────────────────────
function RingPhotoGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const ringImages = [
    getImage("ring_full", 0),
    getImage("ring_full", 1),
    getImage("ring_full", 2),
    getImage("ring_full", 3),
    getImage("ring_macro", 0),
    getImage("ring_macro", 1),
  ].filter(Boolean) as string[];

  if (ringImages.length === 0) return null;
  const activeImg = ringImages[activeIdx % ringImages.length];

  return (
    <FlyIn className="leather-card parchment-texture rounded-3xl p-6 md:p-8 mb-8">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        {/* Main image */}
        <div className="relative">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-rust-parchment/30 anim-breathe"
            style={{ "--glow-color": "rgba(184,134,11,0.25)" } as React.CSSProperties}
          >
            <img
              src={activeImg}
              alt="Engagement ring — rose gold with green gemstone and nature-inspired leaf details"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnail strip */}
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {ringImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIdx
                    ? "border-rust-brass scale-105"
                    : "border-rust-brass/20 opacity-60 hover:opacity-100"
                }`}
                aria-label={`View ring photo ${i + 1}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-serif text-2xl font-bold text-rust-bark mb-2">
            Rose Gold · Green Fire Opal · Moss Agate
          </h3>
          <p className="text-sm md:text-base text-rust-bark/80 leading-relaxed">
            A one-of-a-kind partner set, hand-fabricated to capture the
            trip. The rose-gold band borrows the warm blush of 7:30 PM
            granite; the green fire opal flashes the deep emerald of a pine
            canopy at noon; and two moss-agate leaves flank the stone like
            the forest that shelters every campsite on the route. Inside
            each band, the same engraving — a quiet promise shared between
            equals.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rust-forest/10 px-4 py-2">
            <span className="text-[10px] uppercase tracking-widest text-rust-forest font-semibold">
              Engraving
            </span>
            <span className="font-serif italic text-rust-bark">8.7.26 | As One</span>
          </div>
        </div>
      </div>
    </FlyIn>
  );
}
