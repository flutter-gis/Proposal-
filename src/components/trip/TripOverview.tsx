"use client";

/**
 * TripOverview.tsx — REVAMPED
 *
 * At-a-glance card for the Home page. No duplicate info — the hero already
 * shows days/miles/parks stats, and DayTimeline shows the day-by-day plan.
 *
 * Instead, this section provides UNIQUE value:
 *   - "What this trip is" (mood setter)
 *   - "The Arc" — interactive emotional narrative (click to navigate to day)
 *   - "What to Expect" — practical info
 *   - "Best Photo Ops" — photography planning
 */

import { memo } from "react";
import { useTrip } from "@/lib/trip-context";
import { FlyIn, FlyInStagger, FlyInItem } from "./FlyIn";
import { Camera, Signal, CloudSun, Footprints, Sunrise, Mountain, Waves } from "lucide-react";

const EXPECTATIONS = [
  {
    icon: Signal,
    title: "Cell Service 📵",
    text: "Vanishes north of Berlin, NH. Download offline maps before Pawtuckaway. 🗺️",
    color: "#0d9488",
  },
  {
    icon: CloudSun,
    title: "August Weather 🌤️",
    text: "70–80°F days, 50–60°F nights. Pack layers — the cliff is 10° cooler at sunset. 🧥",
    color: "#d97706",
  },
  {
    icon: Footprints,
    title: "Daily Pace 🥾",
    text: "2–4 hours of driving per day, 1–3 short hikes. Nothing over 2 miles round-trip. 🚗",
    color: "#16a34a",
  },
];

const PHOTO_OPS = [
  {
    icon: Sunrise,
    title: "Golden Hour at Table Rock 🌅",
    where: "Day 4 · 7:00–7:40 PM",
    text: "The 1,000-ft granite face turns pink and orange. Shoot from the Lake Gloriette shore. 📸",
  },
  {
    icon: Mountain,
    title: "Artists Bluff Overlook 🏔️",
    where: "Day 4 · Morning",
    text: "Classic Franconia Notch vista — Echo Lake below, Cannon Cliff above. 0.3 mi hike. 🥾",
  },
  {
    icon: Waves,
    title: "Lower Falls Swimming Hole 🏊",
    where: "Day 4 · Afternoon",
    text: "Granite slides and emerald pools. Best in afternoon light when the water glows. 💎",
  },
  {
    icon: Camera,
    title: "Bortle Class 2 Stars 🌌",
    where: "Day 5 · 11:00 PM",
    text: "Milky Way horizon to horizon at Coleman. No light pollution for 50 miles. ⭐",
  },
];

function TripOverviewImpl() {
  const { setPage } = useTrip();
  return (
    <section className="relative px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <FlyIn className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rust-bark/80 px-3 py-1 text-[11px] uppercase tracking-widest text-rust-bg">
            <span aria-hidden>📜</span> The Trip at a Glance
          </div>
          <h2 className="mt-3 font-lobster text-3xl sm:text-4xl md:text-6xl text-rust-bark">
            ✨ What this week will feel like
          </h2>
        </FlyIn>

        {/* "What This Trip Is" — mood setter, not shown elsewhere */}
        <FlyIn className="leather-card parchment-texture rounded-3xl p-6 md:p-8 mb-6">
          <p className="text-sm md:text-base text-rust-bark/80 leading-relaxed text-center">
            Six days that start with no screens and no electricity, build through
            still water and wildlife, and arrive at a 1,000-foot granite cliff at
            the exact moment the sun turns it pink. Then dark skies, a cabin under
            the pines, and a slow drive home. This is not a vacation — it&apos;s a
            pilgrimage with a question at the end.
          </p>
        </FlyIn>

        {/* The Arc — emotional narrative, not a map */}
        <FlyIn className="mb-6">
          <div className="leather-card parchment-texture rounded-3xl p-5 md:p-6">
            <h3 className="mb-4 font-serif text-lg font-bold text-rust-bark text-center">
              📊 The Arc of the Week
            </h3>
            <div className="flex items-end justify-between gap-1 sm:gap-2">
              {[
                { label: "Detox", height: "30%", color: "#2d4a3a", day: 0 },
                { label: "Wildlife", height: "45%", color: "#0d9488", day: 1 },
                { label: "Prep", height: "55%", color: "#5a6f4a", day: 2 },
                { label: "The Question", height: "100%", color: "#b8541f", day: 3 },
                { label: "Stars", height: "70%", color: "#6d28d9", day: 4 },
                { label: "Home", height: "25%", color: "#b8860b", day: 5 },
              ].map((phase, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(1); /* navigate to Trip page */ }}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer tap-feedback"
                  aria-label={`Day ${i + 1}: ${phase.label}`}
                >
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80 group-hover:scale-105"
                    style={{
                      height: phase.height,
                      background: `linear-gradient(180deg, ${phase.color}, ${phase.color}dd)`,
                      minHeight: "40px",
                    }}
                  />
                  <div className="text-[9px] sm:text-[11px] font-semibold text-rust-bark/70 text-center leading-tight group-hover:text-rust-bark transition-colors">
                    {phase.label}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-rust-bark/60 text-center italic">
              The emotional shape of the trip 🌅 — from quiet start to crescendo to gentle return.
            </p>
          </div>
        </FlyIn>

        {/* What to Expect — practical info not shown elsewhere */}
        <FlyInStagger className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {EXPECTATIONS.map((e) => (
            <FlyInItem key={e.title}>
              <div className="leather-card parchment-texture anim-hover-lift rounded-2xl p-4 h-full">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${e.color}22` }}>
                  <e.icon className="h-4 w-4" style={{ color: e.color }} />
                </div>
                <div className="font-serif text-sm font-bold text-rust-bark mb-1">{e.title}</div>
                <p className="text-xs text-rust-bark/70 leading-relaxed">{e.text}</p>
              </div>
            </FlyInItem>
          ))}
        </FlyInStagger>

        {/* 📸 Best Photo Opportunities — curated shot list */}
        <FlyIn className="bark-card rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-rust-brass" />
            <h3 className="font-serif text-lg font-bold text-rust-cream">
              📸 Best Photo Opportunities
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PHOTO_OPS.map((op, i) => (
              <div key={i} className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <op.icon className="w-4 h-4 text-rust-brass mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-serif text-sm font-bold text-rust-cream">{op.title}</div>
                    <div className="text-[10px] uppercase tracking-widest text-rust-brass/80 font-semibold mb-1">
                      {op.where}
                    </div>
                    <p className="text-xs text-rust-cream/70 leading-relaxed">{op.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FlyIn>
      </div>
    </section>
  );
}

const TripOverview = memo(TripOverviewImpl);
export default TripOverview;
