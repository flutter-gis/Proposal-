"use client";

/**
 * RelationshipMetrics.tsx
 *
 * Big live timer (Years/Months/Days + ticking H:M:S).
 * Two person cards (heartbeat avatars).
 * 8 cosmic metric cards (FlyInStagger).
 * All update live every 1 second.
 * Devotion quote at the bottom.
 *
 * Gender-neutral throughout.
 */

import { memo, useEffect, useState } from "react";
import {
  RELATIONSHIP_START,
  USER_BIRTH,
  PARTNER_BIRTH,
  USER_NAME,
  PARTNER_NAME,
  breakdownDuration,
  formatDistance,
  computeLiveMetrics,
  formatCompactNumber,
  formatKm,
  type LiveMetrics,
} from "@/lib/relationship-data";
import { FlyIn, FlyInStagger, FlyInItem } from "./FlyIn";
import QuoteCallout from "./QuoteCallout";
import { Icon as SvgIcon, type IconName } from "@/components/icons/Icon";

function useNow(intervalMs: number = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date(0));
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function HeartbeatAvatar({ name, birth, now }: { name: string; birth: Date; now: Date }) {
  const age = breakdownDuration(birth, now);
  return (
    <div className="leather-card parchment-texture rounded-3xl p-5 md:p-6 text-center">
      <div className="relative mx-auto mb-3 h-16 w-16">
        <svg viewBox="0 0 40 40" className="h-full w-full anim-heartbeat" aria-hidden>
          <defs>
            <radialGradient id={`hb-${name}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b8541f" />
              <stop offset="100%" stopColor="#7a2418" />
            </radialGradient>
          </defs>
          <path
            d="M20 34 C8 26 4 18 8 12 C12 6 18 8 20 14 C22 8 28 6 32 12 C36 18 32 26 20 34 Z"
            fill={`url(#hb-${name})`}
            stroke="#faf3e3"
            strokeWidth="0.8"
          />
        </svg>
      </div>
      <div className="font-serif text-xl font-bold text-on-light">{name}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-on-accent">
        Age
      </div>
      <div className="text-sm font-semibold text-on-light/80 tabular-nums">
        {age.years}y {age.months}m {age.days}d
      </div>
    </div>
  );
}

const METRIC_CARDS: Array<{
  key: keyof LiveMetrics;
  title: string;
  icon: string;
  format: (m: LiveMetrics) => string;
  sub: (m: LiveMetrics) => string;
}> = [
  {
    key: "heartbeatsCombined",
    title: "Heartbeats Shared",
    icon: "heart",
    format: (m) => formatCompactNumber(m.heartbeatsCombined),
    sub: (m) => `${formatCompactNumber(m.heartbeatsEach)} each`,
  },
  {
    key: "breathsCombined",
    title: "Breaths Taken Together",
    icon: "nature",
    format: (m) => formatCompactNumber(m.breathsCombined),
    sub: (m) => `${formatCompactNumber(m.breathsEach)} each`,
  },
  {
    key: "blinksCombined",
    title: "Blinks of an Eye",
    icon: "none",
    format: (m) => formatCompactNumber(m.blinksCombined),
    sub: (m) => `${formatCompactNumber(m.blinksEach)} each`,
  },
  {
    key: "lightKm",
    title: "Light Has Travelled",
    icon: "sparkle",
    format: (m) => formatKm(m.lightKm),
    sub: () => "since we met",
  },
  {
    key: "voyagerKm",
    title: "Voyager 1 Has Drifted",
    icon: "sparkle",
    format: (m) => formatKm(m.voyagerKm),
    sub: () => "into interstellar space",
  },
  {
    key: "earthOrbitKm",
    title: "Earth Has Orbited",
    icon: "sparkle",
    format: (m) => formatKm(m.earthOrbitKm),
    sub: () => "around the sun",
  },
  {
    key: "worldBirths",
    title: "New Lives Begun",
    icon: "nature",
    format: (m) => formatCompactNumber(m.worldBirths),
    sub: (m) => `+${formatCompactNumber(m.netPeople)} net souls`,
  },
  {
    key: "lightningStrikes",
    title: "Lightning Strikes",
    icon: "lightning",
    format: (m) => formatCompactNumber(m.lightningStrikes),
    sub: (m) => `${m.issOrbits.toFixed(1)} ISS orbits`,
  },
];

function RelationshipMetricsImpl() {
  const now = useNow(1000);
  const dur = breakdownDuration(RELATIONSHIP_START, now);
  const seconds = Math.max(0, dur.totalSeconds);
  const metrics = computeLiveMetrics(seconds);

  return (
    <section className="px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      {/* #4 FIX: Visually-hidden H1 for SEO + screen readers */}
      <h1 className="sr-only">Our Story — Relationship, Ring, and Memories</h1>
      <div className="mx-auto max-w-5xl">
        {/* Big live timer */}
        <FlyIn className="relative overflow-hidden bark-card anim-breathe rounded-3xl p-6 md:p-10 mb-8 text-center"
               style={{ "--glow-color": "rgba(184,134,11,0.3)" } as React.CSSProperties}>
          <div className="text-[10px] uppercase tracking-widest text-on-brass">
            Together Since · October 4, 2021
          </div>
          <div className="mt-1 text-[11px] text-on-dark/50 italic">
            Since our first date, 11:00 AM on a Monday.
          </div>
          <div className="mt-3 font-serif text-2xl sm:text-3xl md:text-5xl font-bold text-on-dark">
            {dur.years} <span className="text-on-brass">years</span>{" "}
            {dur.months} <span className="text-on-brass">months</span>{" "}
            {dur.days} <span className="text-on-brass">days</span>
          </div>
          <div className="mt-2 font-mono text-xl sm:text-2xl md:text-3xl tabular-nums text-on-dark/90">
            {String(dur.hours).padStart(2, "0")}:
            {String(dur.minutes).padStart(2, "0")}:
            {String(dur.seconds).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs text-on-dark/60">
            {formatDistance(RELATIONSHIP_START, now)} · and counting
          </div>
        </FlyIn>

        {/* Two person cards */}
        <FlyIn className="mb-8 grid gap-4 sm:grid-cols-2">
          <HeartbeatAvatar name={USER_NAME} birth={USER_BIRTH} now={now} />
          <HeartbeatAvatar name={PARTNER_NAME} birth={PARTNER_BIRTH} now={now} />
        </FlyIn>

        {/* 8 cosmic metric cards */}
        <FlyInStagger className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          {METRIC_CARDS.map((c) => (
            <FlyInItem key={c.key}>
              <div className="leather-card parchment-texture anim-hover-lift rounded-2xl p-4 text-center h-full">
                <div className="mb-1 flex items-center justify-center" aria-hidden>
                  <SvgIcon name={c.icon as IconName} size={28} />
                </div>
                <div className="font-serif text-xl md:text-2xl font-bold text-on-accent tabular-nums">
                  {c.format(metrics)}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-on-light/60">
                  {c.title}
                </div>
                <div className="text-[10px] text-on-light/50 mt-0.5">{c.sub(metrics)}</div>
              </div>
            </FlyInItem>
          ))}
        </FlyInStagger>

        {/* Devotion quote */}
        <FlyIn className="mb-8">
          <QuoteCallout theme="devotion" count={3} seed="relationshipmetrics" />
        </FlyIn>

        {/* Love quote — second carousel with the unused 'love' theme */}
        <FlyIn>
          <QuoteCallout theme="love" count={3} seed="lovecarousel" />
        </FlyIn>
      </div>
    </section>
  );
}

const RelationshipMetrics = memo(RelationshipMetricsImpl);
export default RelationshipMetrics;
