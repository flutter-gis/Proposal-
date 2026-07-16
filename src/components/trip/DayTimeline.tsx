"use client";

/**
 * DayTimeline.tsx — rewritten
 *
 * The DayHeader (with its glowing texture stack) is the DOMINANT focus.
 * No mini map, no side column — just the day header, epigraph, and stops
 * in a clean single-column layout that works on all screen sizes.
 *
 * Reads currentDay from useTrip().
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DAY_PLANS, PLACES, DRIVE_LEGS, type DayPlan, type Place } from "@/lib/trip-data";
import { useTrip } from "@/lib/trip-context";
import { cn } from "@/lib/utils";
import { Icon as SvgIcon, CATEGORY_TO_ICON, DAY_ICON_MAP } from "@/components/icons/Icon";
import { type QuoteTheme } from "@/lib/quotes";
import DayHeader from "./DayHeader";
import GlassStopCard, { WaxSealBadge } from "./GlassStopCard";
import QuoteCallout from "./QuoteCallout";
import RoadsideAttractionsCard from "./RoadsideAttractionsCard";
import AttractionCatalog from "./AttractionCatalog";
import { FlyIn } from "./FlyIn";

// ── Current-day detection ──────────────────────────────────────────────
// Trip runs Aug 4–9, 2026. If today falls inside that range, the matching
// day card auto-expands and scrolls into view on mount (M-04).
// JS Date months are 0-indexed: 7 = August.
const TRIP_START = new Date(2026, 7, 4);
const TRIP_END = new Date(2026, 7, 9, 23, 59, 59);

function getCurrentDayIndex(): number {
  const now = new Date();
  if (now < TRIP_START || now > TRIP_END) return -1;
  const day = Math.floor((now.getTime() - TRIP_START.getTime()) / 86400000);
  return Math.max(0, Math.min(5, day));
}

const DAY_QUOTE_THEME: QuoteTheme[] = [
  "dawn",        // Day 1
  "wilderness",  // Day 2
  "recharge",    // Day 3
  "proposal",    // Day 4
  "cosmos",      // Day 5
  "homecoming",  // Day 6
];

const DAY_EPIGRAPHS = [
  "The off-grid escape.",
  "Into the wild we go.",
  "Power up before the big moment.",
  "The day the question will be asked.",
  "Under the darkest skies in New England.",
  "A grand finale, twice over.",
];

const DAY_ACCENTS = [
  "#5a6f4a", "#3a6a7a", "#b8541f", "#b8860b", "#4a3a6a", "#d4a017",
];

interface DaySlideProps {
  day: DayPlan;
  index: number;
  total: number;
  onSelectPlace: (place: Place) => void;
}

function DaySlideImpl({ day, index, total, onSelectPlace }: DaySlideProps) {
  const places = useMemo(
    () =>
      day.placeIds
        .map((id) => PLACES.find((p) => p.id === id))
        .filter((p): p is Place => Boolean(p)),
    [day.placeIds]
  );
  const leg = day.legId ? DRIVE_LEGS.find((l) => l.id === day.legId) : null;

  return (
    <article className="anim-fade-in-up">
      {/* DayHeader is the DOMINANT element — full width, glowing */}
      <DayHeader day={day} index={index} />

      {/* Epigraph */}
      <p className="mt-4 mb-2 px-1 font-serif text-base sm:text-lg italic text-rust-ember/80">
        {DAY_EPIGRAPHS[index] ?? ""}
      </p>

      {/* Driving leg info (inline, not a sidebar) */}
      {leg && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rust-bark/80 px-4 py-2 text-xs text-rust-bg">
          <SvgIcon name="car" size={14} />
          <span className="font-semibold">{leg.from} → {leg.to}</span>
          <span className="opacity-60">· {leg.miles} mi · {leg.duration}</span>
        </div>
      )}

      {/* Stops — single column, full width */}
      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <WaxSealBadge size={36} color="#7a2418">
            <SvgIcon name={DAY_ICON_MAP[index] ?? "nearby"} size={20} />
          </WaxSealBadge>
          <div className="font-serif text-base font-bold text-on-light">
            {places.length} stops · Day {index + 1}
          </div>
        </div>

        <div className="space-y-3">
          {places.map((p, i) => (
            <GlassStopCard
              key={p.id}
              place={p}
              index={i}
              total={places.length}
              onSelect={onSelectPlace}
              isLast={i === places.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Road-side attractions for this leg */}
      {leg && (
        <div className="mt-4 space-y-4">
          <AttractionCatalog legId={leg.id} />
          <RoadsideAttractionsCard legId={leg.id} maxDetour={20} />
        </div>
      )}

      {/* Highlights + Quote at the bottom */}
      <div className="mt-6 leather-card parchment-texture rounded-2xl p-4">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-rust-ember font-semibold">
          Day {index + 1} Highlights
        </div>
        <ul className="space-y-1.5">
          {day.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-on-light/75">
              <span className="text-rust-forest font-bold mt-0.5">✓</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <QuoteCallout
          theme={DAY_QUOTE_THEME[index % DAY_QUOTE_THEME.length]}
          count={2}
          seed={`day-${index + 1}`}
          showDots={false}
        />
      </div>
    </article>
  );
}

const DaySlide = memo(DaySlideImpl);

export default function DayTimeline({
  onSelectPlace,
}: {
  onSelectPlace: (place: Place) => void;
}) {
  const { currentDay, setDay } = useTrip();
  // M-02: Allow multiple days expanded simultaneously (Set<number> instead of number | null).
  // C-02 fix: child interactions no longer bubble to toggle the accordion because
  // the toggle only lives on the day-number button + the dedicated "summary" header
  // — never on the card div that wraps the expanded content.
  const [expandedDays, setExpandedDays] = useState<Set<number>>(() => {
    // M-04: Pre-expand today's day if today falls inside Aug 4–9, 2026.
    const todayIdx = getCurrentDayIndex();
    return new Set(todayIdx >= 0 ? [todayIdx] : [currentDay]);
  });

  // H-05: When currentDay changes (e.g. via #/trip/day4 hash), expand that day.
  // This syncs the accordion with URL-driven navigation.
  useEffect(() => {
    setExpandedDays(prev => {
      if (prev.has(currentDay)) return prev; // already expanded
      const next = new Set(prev);
      next.add(currentDay);
      return next;
    });
  }, [currentDay]);

  // M-04: Auto-scroll to current day on mount. Use a ref to the day wrapper.
  const currentDayRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const todayIdx = getCurrentDayIndex();
    if (todayIdx < 0) return;
    // Defer to next frame so the expanded content has rendered.
    const id = requestAnimationFrame(() => {
      currentDayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggleDay = useCallback((i: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
    setDay(i);
  }, [setDay]);

  const expandAll = useCallback(() => {
    setExpandedDays(new Set([0, 1, 2, 3, 4, 5]));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedDays(new Set());
  }, []);

  return (
    <section id="itinerary" className="relative px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <h1 className="sr-only">Trip Itinerary — Six Days of Wilderness Romance</h1>
      <div className="mx-auto max-w-3xl">
        <FlyIn className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rust-bark/80 px-3 py-1 text-[11px] uppercase tracking-widest text-rust-bg">
            <span aria-hidden>🗺</span> The Adventure Timeline
          </div>
          <h2 className="mt-3 font-lobster text-2xl sm:text-3xl md:text-5xl text-on-light">
            Six days of wilderness romance
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-on-light/70">
            Tap any day to expand the full itinerary. Multiple days can be open at once.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs">
            <button
              onClick={expandAll}
              className="rounded-full bg-rust-brass/20 px-3 py-1 font-semibold text-rust-brass hover:bg-rust-brass/30 min-h-[32px]"
            >
              Expand all
            </button>
            <button
              onClick={collapseAll}
              className="rounded-full bg-rust-bark/10 px-3 py-1 font-semibold text-on-light/70 hover:bg-rust-bark/20 min-h-[32px]"
            >
              Collapse all
            </button>
          </div>
        </FlyIn>

        {/* Vertical timeline — replaces carousel */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rust-brass via-rust-ember to-rust-wax opacity-30" />

          {DAY_PLANS.map((day, i) => {
            const isExpanded = expandedDays.has(i);
            const isPast = i < currentDay;
            const isCurrent = i === currentDay;
            const isToday = getCurrentDayIndex() === i;
            const leg = day.legId ? DRIVE_LEGS.find(l => l.id === day.legId) : null;
            const places = day.placeIds
              .map(id => PLACES.find(p => p.id === id))
              .filter((p): p is Place => Boolean(p));

            return (
              <div
                key={day.day}
                ref={isToday ? currentDayRef : undefined}
                className="relative pl-12 sm:pl-16 mb-4"
              >
                {/* Timeline dot — toggle target */}
                <button
                  onClick={() => toggleDay(i)}
                  className="absolute left-0 top-2 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg transition-all tap-feedback min-h-[44px] min-w-[44px]"
                  style={{
                    backgroundColor: isCurrent ? "#e11d48" : isPast ? "#16a34a" : DAY_ACCENTS[i] || "#b8860b",
                    color: "white",
                    border: isExpanded ? "3px solid #fbbf24" : "3px solid white",
                  }}
                  aria-label={`Day ${i + 1}: ${day.title}. ${isExpanded ? "Collapse" : "Expand"} day.`}
                  aria-expanded={isExpanded}
                  aria-controls={`day-${i + 1}-content`}
                >
                  {i + 1}
                </button>

                {/* Day card — NO card-level onClick (C-02 fix) */}
                <div
                  className={cn(
                    "rounded-2xl overflow-hidden transition-all border-2 bg-[var(--card)]",
                    isExpanded ? "border-[var(--rust-brass)]" : "border-transparent"
                  )}
                >
                  {/* Day header — clickable summary (acts as accordion toggle) */}
                  <button
                    type="button"
                    onClick={() => toggleDay(i)}
                    className="w-full text-left p-4 tap-feedback"
                    aria-expanded={isExpanded}
                    aria-controls={`day-${i + 1}-content`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {isCurrent && <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-rose-600 px-2 py-0.5 rounded-full animate-pulse">Today</span>}
                          {isPast && <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-green-700 px-2 py-0.5 rounded-full">✓ Done</span>}
                          <span className="text-[10px] uppercase tracking-widest text-muted-light">
                            Day {i + 1} · Aug {4 + i}
                          </span>
                        </div>
                        <h3 className="font-lobster text-lg sm:text-xl text-on-light flex items-center gap-2">
                          <SvgIcon name={DAY_ICON_MAP[i] ?? "nearby"} size={20} animated /> {day.title}
                        </h3>
                        {leg && (
                          <div className="mt-1 text-[10px] text-on-light/50">
                            {leg.from} → {leg.to} · {leg.miles} mi · {leg.duration}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-on-light/40" aria-hidden>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </div>

                    {/* Collapsed preview: show first 2 stops */}
                    {!isExpanded && places.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {places.slice(0, 3).map(p => (
                          <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-full bg-rust-bark/10 text-on-light/60">
                            <SvgIcon name={CATEGORY_TO_ICON[p.category] ?? "nearby"} size={12} /> {p.name}
                          </span>
                        ))}
                        {places.length > 3 && <span className="text-[10px] text-on-light/40">+{places.length - 3} more</span>}
                      </div>
                    )}
                  </button>

                  {/* Expanded content: full day slide */}
                  {isExpanded && (
                    <div id={`day-${i + 1}-content`} className="anim-fade-in-up">
                      <DaySlide
                        day={day}
                        index={i}
                        total={DAY_PLANS.length}
                        onSelectPlace={onSelectPlace}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
