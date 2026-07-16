"use client";

/**
 * MobileFriendlyMap.tsx — COMPLETELY REWRITTEN
 *
 * Clean, modern map page with:
 *   - Full-screen map with real OSRM road polylines
 *   - Clean sidebar with stop list (grouped by day)
 *   - Stats bar (total miles, stops, legs)
 *   - No roadside markers by default (catalog handles those)
 *   - Theme-aware colors
 *   - Fullscreen mode
 *   - Attraction catalog below the map
 */

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { PLACES, DRIVE_LEGS, DAY_PLANS, TRIP_STATS, type Place } from "@/lib/trip-data";
import roadPolylines from "@/lib/road-polylines.json";
import AttractionCatalog from "./AttractionCatalog";
import RoadsideAttractionsCard from "./RoadsideAttractionsCard";
import { usePreferences } from "@/lib/preferences-context";
import { useTrip } from "@/lib/trip-context";
import { Icon as SvgIcon, CATEGORY_TO_ICON } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";
import { Map as MapIcon, Maximize2, Minimize2, Clock, MapPin, Route, Calendar } from "lucide-react";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl flex items-center justify-center min-h-[400px] bg-emerald-50">
      <div className="text-emerald-700 text-sm animate-pulse flex items-center gap-2">
        <MapIcon className="w-4 h-4" />
        Loading interactive map…
      </div>
    </div>
  ),
});

const LEG_COLORS = ["#0d9488", "#16a34a", "#0284c7", "#d97706", "#7c3aed", "#dc2626"];

export default function MobileFriendlyMap({ onSelectPlace }: { onSelectPlace?: (place: Place) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { palette } = usePreferences();
  // H-03/L-07: When the user taps a catalog "Map" link or checkbox, the
  // trip-context sets mapHighlightId. We surface it as the selected stop on
  // the map so the marker is highlighted.
  const { mapHighlightId, setMapHighlightId } = useTrip();

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const place = PLACES.find(p => p.id === id);
    if (place && onSelectPlace) onSelectPlace(place);
  }, [onSelectPlace]);

  useEffect(() => {
    if (selectedId && onSelectPlace) {
      const place = PLACES.find(p => p.id === selectedId);
      if (place) onSelectPlace(place);
    }
  }, [selectedId, onSelectPlace]);

  // H-03/L-07: When mapHighlightId arrives from the trip-context (set by the
  // Attraction Catalog's "Map" link), select it on the map.
  useEffect(() => {
    if (!mapHighlightId) return;
    // Try to find as a Place first; if not found, it's an attraction id and
    // we just clear the highlight after a moment.
    const place = PLACES.find(p => p.id === mapHighlightId);
    if (place) {
      setSelectedId(place.id);
      if (onSelectPlace) onSelectPlace(place);
    }
    // Clear after handling so subsequent taps re-trigger.
    const id = setTimeout(() => setMapHighlightId(null), 500);
    return () => clearTimeout(id);
  }, [mapHighlightId, onSelectPlace, setMapHighlightId]);

  // Stats
  const totalMiles = (roadPolylines as any).totalMiles || TRIP_STATS.totalMiles;
  const totalDuration = (roadPolylines as any).totalDurationMinutes || 0;
  const durationStr = `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`;

  return (
    <section
      id="map"
      className={cn(
        "min-h-screen transition-all",
        isFullscreen ? "fixed inset-0 z-[200] bg-slate-900 p-0" : "py-8 lg:py-12"
      )}
      style={{ background: isFullscreen ? "#0f172a" : `linear-gradient(180deg, ${palette.bg} 0%, ${palette.parchment} 100%)` }}
    >
      <h1 className="sr-only">Interactive Map — New Hampshire Wilderness Trip Atlas</h1>

      <div className={cn("mx-auto", isFullscreen ? "h-full px-0" : "px-3 sm:px-4 md:px-6 max-w-7xl")}>
        {/* ── Header ── */}
        {!isFullscreen && (
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs uppercase tracking-widest font-semibold mb-3"
              style={{ backgroundColor: `${palette.primary}20`, color: "var(--text-on-bg)" }}
            >
              <Route className="w-3 h-3" aria-hidden />
              Trip Atlas
            </div>
            <h2 className="font-lobster text-3xl md:text-5xl mb-2 text-on-bg">
              The Journey Map
            </h2>
            <p className="text-sm md:text-base max-w-2xl mx-auto px-2 text-muted-light">
              {totalMiles} miles · {TRIP_STATS.totalDays} days · {TRIP_STATS.majorStops} stops across New Hampshire
            </p>
          </div>
        )}

        {/* ── Stats bar ── */}
        {!isFullscreen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Route className="w-4 h-4" />} label="Total Distance" value={`${totalMiles} mi`} color={palette.primary} />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Drive Time" value={durationStr} color={palette.brass} />
            <StatCard icon={<MapPin className="w-4 h-4" />} label="Major Stops" value={`${TRIP_STATS.majorStops}`} color={palette.accent} />
            <StatCard icon={<Calendar className="w-4 h-4" />} label="Days" value={`${TRIP_STATS.totalDays}`} color={palette.forest} />
          </div>
        )}

        {/* ── Map + Sidebar layout ── */}
        <div className={cn(
          "grid gap-4",
          isFullscreen ? "h-full grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_320px]"
        )}>
          {/* Map */}
          <div className={cn(
            "relative rounded-2xl overflow-hidden shadow-xl",
            isFullscreen ? "h-full rounded-none" : "h-[50vh] sm:h-[55vh] lg:h-[600px] min-h-[350px]"
          )}>
            <TripMap
              selectedId={selectedId}
              onSelectPlace={handleSelect}
              showRoadside={false}
              className="h-full"
            />

            {/* Fullscreen toggle — bottom-right, above the legend on mobile */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="absolute bottom-3 right-3 z-[1001] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
              style={{ marginBottom: isFullscreen ? 0 : "60px" }}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-700" /> : <Maximize2 className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {/* Sidebar — stop list grouped by day */}
          {!isFullscreen && (
            <div
              className="rounded-2xl overflow-y-auto max-h-[600px] shadow-lg bg-[var(--card)]/90 border border-[var(--border)]"
            >
              <div
                className="sticky top-0 px-4 py-3 text-xs uppercase tracking-widest font-bold border-b z-10 bg-[var(--card)] text-on-light border-[var(--border)]"
              >
                All {PLACES.length} Stops by Day
              </div>

              {/* Drive legs summary */}
              <div className="p-3 border-b border-[var(--border)]">
                {DRIVE_LEGS.map((leg, i) => (
                  <div key={leg.id} className="flex items-center gap-2 py-1 text-[11px]">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: LEG_COLORS[i] }} />
                    <span className="font-semibold text-on-light">Leg {i + 1}</span>
                    <span className="truncate text-muted-light">{leg.from} → {leg.to}</span>
                    <span className="ml-auto font-mono text-[10px] text-on-brass">{leg.miles} mi</span>
                  </div>
                ))}
              </div>

              {/* Stops by day */}
              <div className="p-2">
                {DAY_PLANS.map((day, dayIdx) => (
                  <div key={day.day} className="mb-3">
                    <div
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded text-on-brass"
                      style={{ backgroundColor: "var(--theme-anim-glow)" }}
                    >
                      Day {dayIdx + 1} — {day.title}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {day.placeIds.map(placeId => {
                        const place = PLACES.find(p => p.id === placeId);
                        if (!place) return null;
                        const isSelected = place.id === selectedId;
                        return (
                          <button
                            key={place.id}
                            onClick={() => handleSelect(place.id)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-colors flex items-center gap-2",
                              isSelected ? "font-bold bg-[var(--rust-brass)]/20 text-on-brass" : "hover:bg-black/5 text-muted-light"
                            )}
                          >
                            <SvgIcon name={CATEGORY_TO_ICON[place.category] ?? "nearby"} size={14} animated />
                            <span className="truncate flex-1">{place.name}</span>
                            {place.cost && (
                              <span className="text-[9px] opacity-50 flex-shrink-0">{place.cost.split("(")[0].trim()}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Attraction catalog ── */}
        {!isFullscreen && (
          <div className="mt-8 space-y-4">
            <AttractionCatalog />
            <RoadsideAttractionsCard maxDetour={20} />
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-center shadow-sm bg-[var(--card)]/80 border border-[var(--border)]">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-2" style={{ backgroundColor: `${color}20` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="text-lg font-bold text-on-light">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-light">{label}</div>
    </div>
  );
}
