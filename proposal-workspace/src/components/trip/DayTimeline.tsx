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

import { memo, useMemo } from "react";
import { DAY_PLANS, PLACES, DRIVE_LEGS, type DayPlan, type Place } from "@/lib/trip-data";
import { useTrip } from "@/lib/trip-context";
import { type QuoteTheme } from "@/lib/quotes";
import Carousel from "./Carousel";
import DayHeader from "./DayHeader";
import GlassStopCard, { WaxSealBadge } from "./GlassStopCard";
import QuoteCallout from "./QuoteCallout";
import { FlyIn } from "./FlyIn";

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
          <span aria-hidden>🚗</span>
          <span className="font-semibold">{leg.from} → {leg.to}</span>
          <span className="opacity-60">· {leg.miles} mi · {leg.duration}</span>
        </div>
      )}

      {/* Stops — single column, full width */}
      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <WaxSealBadge size={36} color="#7a2418">
            {day.emoji}
          </WaxSealBadge>
          <div className="font-serif text-base font-bold text-rust-bark">
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

      {/* Highlights + Quote at the bottom */}
      <div className="mt-6 leather-card parchment-texture rounded-2xl p-4">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-rust-ember font-semibold">
          Day {index + 1} Highlights
        </div>
        <ul className="space-y-1.5">
          {day.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-rust-bark/75">
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
  const labels = useMemo(
    () => DAY_PLANS.map((d) => `${d.day} — ${d.title}`),
    []
  );

  return (
    <section id="itinerary" className="relative px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16">
      <h1 className="sr-only">Trip Itinerary — Six Days of Wilderness Romance</h1>
      <div className="mx-auto max-w-3xl">
        <FlyIn className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rust-bark/80 px-3 py-1 text-[11px] uppercase tracking-widest text-rust-bg">
            <span aria-hidden>🗺</span> 🌲 The Adventure Timeline
          </div>
          <h2 className="mt-3 font-serif text-2xl sm:text-3xl md:text-5xl font-bold text-rust-bark">
            🌲 Six days of wilderness romance ✨
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-rust-bark/70">
            Swipe or use the arrows to move between days 👆.
          </p>
        </FlyIn>

        <Carousel
          index={currentDay}
          onChange={setDay}
          accents={DAY_ACCENTS}
          labels={labels}
        >
          {DAY_PLANS.map((day, i) => (
            <DaySlide
              key={day.day}
              day={day}
              index={i}
              total={DAY_PLANS.length}
              onSelectPlace={onSelectPlace}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
