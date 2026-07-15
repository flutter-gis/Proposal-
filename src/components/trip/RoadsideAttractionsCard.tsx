"use client";

/**
 * RoadsideAttractionsCard.tsx
 *
 * Displays road-side attractions near the trip route as expandable cards.
 * Attractions are sorted by detour time (closest = highest priority).
 * By default, only shows attractions within 20 minutes detour — a toggle
 * reveals all attractions.
 *
 * Each card shows:
 *   - Category badge with emoji + color
 *   - Name + tagline
 *   - Detour time + miles
 *   - Cost, visit duration, best time
 *   - Rating + review count
 *   - Highlights
 *   - Expandable full description
 *   - Address + directions links
 *
 * Hidden by default — appears when user clicks "Show Nearby Attractions"
 * on the Map page or Trip page.
 */

import { useState, useMemo } from "react";
import { FlyIn } from "./FlyIn";
import {
  ROADSIDE_ATTRACTIONS,
  getAttractionsWithinDetour,
  CATEGORY_META,
  type RoadsideAttraction,
} from "@/lib/roadside-attractions";
import { cn } from "@/lib/utils";
import { Clock, MapPin, DollarSign, Star, Navigation, ChevronDown, Dog, Accessibility, Calendar } from "lucide-react";

export default function RoadsideAttractionsCard({
  legId,
  maxDetour = 20,
}: {
  legId?: string;
  maxDetour?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const attractions = useMemo(() => {
    if (legId) {
      return ROADSIDE_ATTRACTIONS.filter(
        (a) => a.legId === legId
      ).sort((a, b) => a.detourMinutes - b.detourMinutes);
    }
    return getAttractionsWithinDetour(maxDetour);
  }, [legId, maxDetour]);

  const visibleAttractions = showAll
    ? attractions
    : attractions.filter((a) => a.detourMinutes <= maxDetour);

  if (visibleAttractions.length === 0) return null;

  return (
    <FlyIn className="mb-8">
      <div className="leather-card parchment-texture rounded-3xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-lobster text-2xl text-rust-bark mb-1">
              🗺️ Road-Side Attractions
            </h3>
            <p className="text-xs text-rust-bark/60">
              {visibleAttractions.length} stops within {maxDetour} min detour
              {legId && " of this leg"} · sorted by closeness
            </p>
          </div>
          {attractions.length > visibleAttractions.length && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-semibold text-rust-brass hover:text-rust-ember transition-colors tap-feedback min-h-[44px] px-3"
            >
              {showAll ? "Show less" : `Show all ${attractions.length}`}
            </button>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleAttractions.map((attraction, idx) => (
            <AttractionCard
              key={attraction.id}
              attraction={attraction}
              rank={idx + 1}
              expanded={expandedId === attraction.id}
              onToggle={() =>
                setExpandedId(expandedId === attraction.id ? null : attraction.id)
              }
            />
          ))}
        </div>
      </div>
    </FlyIn>
  );
}

function AttractionCard({
  attraction,
  rank,
  expanded,
  onToggle,
}: {
  attraction: RoadsideAttraction;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = CATEGORY_META[attraction.category];
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${attraction.coords.lat},${attraction.coords.lng}`;
  const appleMapsLink = `https://maps.apple.com/?daddr=${attraction.coords.lat},${attraction.coords.lng}&dirflg=d`;

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 transition-all overflow-hidden",
        expanded ? "border-rust-brass bg-rust-cream/80" : "border-rust-brass/20 bg-rust-cream/50 hover:border-rust-brass/40"
      )}
    >
      {/* Rank badge */}
      <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-rust-brass text-rust-cream flex items-center justify-center text-xs font-bold shadow-md">
        {rank}
      </div>

      <button
        onClick={onToggle}
        className="w-full text-left p-4 pt-3"
        aria-label={`Toggle details for ${attraction.name}`}
      >
        {/* Category badge + detour time */}
        <div className="flex items-start justify-between mb-2 ml-9">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: meta.color }}
          >
            {meta.emoji} {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rust-ember">
            <Clock className="w-3 h-3" />
            +{attraction.detourMinutes}m detour
          </span>
        </div>

        {/* Name + tagline */}
        <h4 className="font-serif text-lg font-bold text-rust-bark mb-1">
          {attraction.name}
        </h4>
        <p className="text-sm text-rust-bark/70 italic mb-2">{attraction.tagline}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-rust-bark/60 mb-2">
          <span className="inline-flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {attraction.cost}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {attraction.visitDuration}
          </span>
          {attraction.rating && (
            <span className="inline-flex items-center gap-1">
              <Star className="w-3 h-3 fill-rust-brass text-rust-brass" />
              {attraction.rating} ({attraction.reviewCount?.toLocaleString()})
            </span>
          )}
          {attraction.bestTime && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {attraction.bestTime}
            </span>
          )}
        </div>

        {/* Detour miles + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] text-rust-bark/50">
            <MapPin className="w-3 h-3" />
            {attraction.detourMiles} mi from route
          </span>
          {attraction.dogFriendly && (
            <span className="text-[10px] text-rust-forest" title="Dog-friendly">
              <Dog className="w-3 h-3 inline" /> Dog OK
            </span>
          )}
          {attraction.accessible && (
            <span className="text-[10px] text-rust-forest" title="Wheelchair accessible">
              <Accessibility className="w-3 h-3 inline" /> ADA
            </span>
          )}
          {!attraction.yearRound && attraction.seasonalNote && (
            <span className="text-[10px] text-rust-ember">
              ⚠ {attraction.seasonalNote}
            </span>
          )}
        </div>

        {/* Expand indicator */}
        <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-rust-brass">
          <ChevronDown
            className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")}
          />
          {expanded ? "Less" : "More"}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 anim-fade-in-up">
          {/* Description */}
          <p className="text-sm text-rust-bark/80 leading-relaxed font-tinos">
            {attraction.description}
          </p>

          {/* Highlights */}
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-rust-forest mb-2">
              Highlights
            </h5>
            <ul className="grid grid-cols-1 gap-1">
              {attraction.highlights.map((h, i) => (
                <li
                  key={i}
                  className="text-xs text-rust-bark/70 flex items-start gap-2"
                >
                  <span className="text-rust-forest mt-0.5">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Address + directions */}
          {attraction.address && (
            <div className="text-xs text-rust-bark/60">
              <MapPin className="w-3 h-3 inline mr-1" />
              {attraction.address}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <a
              href={directionsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-rust-forest text-rust-cream px-3 py-2 text-xs font-bold hover:bg-rust-forest/90 transition-colors tap-feedback"
            >
              <Navigation className="w-3 h-3" />
              Google Maps
            </a>
            <a
              href={appleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-rust-wax/20 border border-rust-wax/40 text-rust-bark px-3 py-2 text-xs font-bold hover:bg-rust-wax/30 transition-colors tap-feedback"
            >
              <Navigation className="w-3 h-3" />
              Apple Maps
            </a>
          </div>

          {/* Contact */}
          {attraction.contact && (
            <div className="text-[10px] text-rust-bark/40 text-center">
              {attraction.contact}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
