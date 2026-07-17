"use client";

/**
 * RoadsideAttractionsCard.tsx — REVAMPED
 *
 * Displays verified road-side attractions near the trip route.
 * Attractions are sorted by detour time (closest = highest priority).
 * Hidden gems are marked with a diamond.
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import { FlyIn } from "./FlyIn";
import {
  ROADSIDE_ATTRACTIONS,
  getAttractionsWithinDetour,
  CATEGORY_META,
  type RoadsideAttraction,
} from "@/lib/roadside-attractions";
import { cn } from "@/lib/utils";
import { Icon as SvgIcon, TYPE_TO_ICON } from "@/components/icons/Icon";
import { Clock, MapPin, DollarSign, Star, Navigation, ChevronDown, Gem, Bookmark, BookmarkCheck, Share2 } from "lucide-react";

const SAVED_KEY = "wilderness-saved-gems";

function loadSaved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSaved(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export default function RoadsideAttractionsCard({
  legId,
  maxDetour = 20,
}: {
  legId?: string;
  maxDetour?: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // M-05: Saved gems persist in localStorage so the couple can mark
  // "we want to do this" ahead of the trip and the choice survives reloads.
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Load saved gems from localStorage on mount (client-only).
  useEffect(() => {
    setSavedIds(loadSaved());
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveSaved(next);
      return next;
    });
  }, []);

  const attractions = useMemo(() => {
    if (legId) {
      return ROADSIDE_ATTRACTIONS.filter(a => a.legId === legId).sort((a, b) => a.detourMinutes - b.detourMinutes);
    }
    return getAttractionsWithinDetour(maxDetour);
  }, [legId, maxDetour]);

  const visibleAttractions = useMemo(() => {
    if (!showSavedOnly) return attractions;
    return attractions.filter(a => savedIds.has(a.id));
  }, [attractions, showSavedOnly, savedIds]);

  if (attractions.length === 0) return null;

  return (
    <FlyIn className="mb-6">
      <div className="leather-card parchment-texture rounded-3xl p-5 md:p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-lobster text-2xl text-on-light mb-1">
              Roadside Gems
            </h3>
            <p className="text-xs text-on-light/60">
              {attractions.length} hidden stops · sorted by detour time
              {legId && " · this leg"}
              {savedIds.size > 0 && ` · ${savedIds.size} saved`}
            </p>
          </div>
          {savedIds.size > 0 && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold border min-h-[32px]",
                showSavedOnly
                  ? "bg-rust-brass text-rust-cream border-transparent"
                  : "bg-transparent text-rust-brass border-rust-brass/30 hover:border-rust-brass/50"
              )}
              aria-pressed={showSavedOnly}
            >
              {showSavedOnly ? "Showing saved" : `Show saved (${savedIds.size})`}
            </button>
          )}
        </div>

        {/* Cards grid */}
        {visibleAttractions.length === 0 ? (
          <div className="text-center py-8 text-on-light/40 text-sm">
            No saved gems yet. Tap the bookmark on any card to save it for later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleAttractions.map((attraction, idx) => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                rank={idx + 1}
                expanded={expandedId === attraction.id}
                onToggle={() => setExpandedId(expandedId === attraction.id ? null : attraction.id)}
                isSaved={savedIds.has(attraction.id)}
                onToggleSave={() => toggleSave(attraction.id)}
              />
            ))}
          </div>
        )}
      </div>
    </FlyIn>
  );
}

function AttractionCard({
  attraction,
  rank,
  expanded,
  onToggle,
  isSaved,
  onToggleSave,
}: {
  attraction: RoadsideAttraction;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const meta = CATEGORY_META[attraction.category];
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${attraction.coords.lat},${attraction.coords.lng}`;

  // M-08: Web Share API for native mobile share, with clipboard fallback.
  const handleShare = async () => {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/#/map/attraction-${attraction.id}`;
    const shareText = `Check out this stop on our wilderness trip: ${attraction.name}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: attraction.name, text: shareText, url: shareUrl });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
      }
    } catch {
      // user cancelled or clipboard failed — non-fatal
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 transition-all overflow-hidden",
        expanded ? "border-rust-brass bg-rust-cream/80" : "border-rust-brass/20 bg-rust-cream/50 hover:border-rust-brass/40",
        isSaved && "ring-2 ring-rust-brass/40"
      )}
    >
      {/* Rank + hidden gem badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
        <div className="w-7 h-7 rounded-full bg-rust-brass text-rust-cream flex items-center justify-center text-xs font-bold shadow-md">
          {rank}
        </div>
        {attraction.hiddenGem && (
          <div className="w-7 h-7 rounded-full bg-rust-forest text-rust-cream flex items-center justify-center shadow-md" title="Hidden Gem">
            <Gem className="w-3 h-3" aria-hidden />
          </div>
        )}
      </div>

      {/* Save + Share buttons */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          onClick={onToggleSave}
          className="w-7 h-7 min-h-[32px] min-w-[32px] rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors tap-feedback"
          aria-label={isSaved ? `Remove ${attraction.name} from saved` : `Save ${attraction.name} for later`}
          aria-pressed={isSaved}
        >
          {isSaved ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-rust-brass" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-on-light/50" />
          )}
        </button>
        <button
          onClick={handleShare}
          className="w-7 h-7 min-h-[32px] min-w-[32px] rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors tap-feedback"
          aria-label={`Share ${attraction.name}`}
        >
          <Share2 className="w-3.5 h-3.5 text-on-light/50" />
        </button>
      </div>

      <button
        onClick={onToggle}
        className="w-full text-left p-4 pt-3 min-h-[44px]"
        aria-label={`${expanded ? "Hide" : "Show"} details for ${attraction.name}`}
        aria-expanded={expanded}
      >
        {/* Category badge + detour time */}
        <div className="flex items-start justify-between mb-2 ml-16 mr-16">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: meta.color }}
          >
            <SvgIcon name={TYPE_TO_ICON[attraction.category as string] ?? "nearby"} size={12} /> {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rust-ember">
            <Clock className="w-3 h-3" aria-hidden />
            +{attraction.detourMinutes}m
          </span>
        </div>

        {/* Name + tagline */}
        <h4 className="font-serif text-base font-bold text-on-light mb-1">{attraction.name}</h4>
        <p className="text-xs text-on-light/70 italic mb-2">{attraction.tagline}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-on-light/60 mb-2">
          <span className="inline-flex items-center gap-1">
            <DollarSign className="w-3 h-3" aria-hidden />
            {attraction.cost}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden />
            {attraction.visitDuration}
          </span>
          {attraction.bestTime && (
            <span className="inline-flex items-center gap-1">
              <Star className="w-3 h-3" aria-hidden />
              {attraction.bestTime}
            </span>
          )}
        </div>

        {/* Detour miles + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] text-on-light/50">
            <MapPin className="w-3 h-3" aria-hidden />
            {attraction.detourMiles} mi from route
          </span>
          {attraction.dogFriendly && (
            <span className="text-[10px] text-rust-forest font-semibold">Dog OK</span>
          )}
          {attraction.restrooms && (
            <span className="text-[10px] text-rust-forest font-semibold">Restrooms</span>
          )}
        </div>

        {/* Expand indicator */}
        <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-rust-brass">
          <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} aria-hidden />
          {expanded ? "Less" : "More"}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 anim-fade-in-up">
          <p className="text-sm text-on-light/80 leading-relaxed font-tinos">{attraction.description}</p>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-rust-forest mb-2">Highlights</h5>
            <ul className="grid grid-cols-1 gap-1">
              {attraction.highlights.map((h, i) => (
                <li key={i} className="text-xs text-on-light/70 flex items-start gap-2">
                  <span className="text-rust-forest mt-0.5">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {attraction.address && (
            <div className="text-xs text-on-light/60">
              <MapPin className="w-3 h-3 inline mr-1" aria-hidden />
              {attraction.address}
            </div>
          )}

          <div className="flex gap-2">
            <a
              href={directionsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-rust-forest text-rust-cream px-3 py-2 text-xs font-bold hover:bg-rust-forest/90 transition-colors tap-feedback min-h-[44px]"
            >
              <Navigation className="w-3 h-3" aria-hidden />
              Directions
            </a>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-rust-wax/20 border border-rust-wax/40 text-rust-wax px-3 py-2 text-xs font-bold hover:bg-rust-wax/30 transition-colors tap-feedback min-h-[44px]"
            >
              <Share2 className="w-3 h-3" aria-hidden />
              Share
            </button>
          </div>

          <div className="text-[10px] text-on-light/40 text-center">
            Source: {attraction.source}
          </div>
        </div>
      )}
    </div>
  );
}
