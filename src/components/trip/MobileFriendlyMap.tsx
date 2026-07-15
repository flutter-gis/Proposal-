"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PLACES, type Place } from "@/lib/trip-data";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import RoadsideAttractionsCard from "./RoadsideAttractionsCard";
import AttractionCatalog from "./AttractionCatalog";
import {
  Map as MapIcon,
  Eye,
  Maximize2,
  Minimize2,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Load TripMap only on client (Leaflet uses `window`)
const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted rounded-2xl flex items-center justify-center min-h-[400px]">
      <div className="text-muted-foreground text-sm animate-pulse">Loading interactive map…</div>
    </div>
  ),
});

// Small inline emoji helper for the stops list (legend is on the map itself)
const CAT_EMOJI: Record<string, string> = {
  stay: "🛏️",
  hike: "🥾",
  water: "🚣",
  scenic: "📸",
  wildlife: "🦌",
  historic: "🏛️",
  dining: "🍽️",
  railway: "🚂",
  proposal: "💍",
  stargaze: "🌌",
  potential: "📍",
};

export default function MobileFriendlyMap({
  onSelectPlace,
  selectedPlace,
}: {
  onSelectPlace: (place: Place) => void;
  selectedPlace: Place | null;
}) {
  const [showPotential, setShowNearby] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(selectedPlace?.id || null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Legend now lives inside TripMap itself, so this toggle is just for the
  // optional potential-picks filter and fullscreen — no separate panel here.

  // Sync selected with parent
  useEffect(() => {
    if (selectedPlace) setSelectedId(selectedPlace.id);
  }, [selectedPlace]);

  // ESC to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const p = PLACES.find((p) => p.id === id);
    if (p) {
      onSelectPlace(p);
      // Close sheet on mobile after selection to show map
      if (window.innerWidth < 768) setSheetOpen(false);
    }
  };

  return (
    <section
      id="map"
      className={cn(
        "py-10 lg:py-20 bg-gradient-to-b from-slate-50 to-emerald-50",
        isFullscreen && "py-0 bg-slate-900"
      )}
    >
      {/* #4 FIX: Visually-hidden H1 for SEO + screen readers */}
      <h1 className="sr-only">Interactive Map — New Hampshire Wilderness Trip Atlas</h1>
      <div className={cn("mx-auto", isFullscreen ? "h-screen px-0" : "px-3 sm:px-4 md:px-6")} style={{ maxWidth: "100%" }}>
        {!isFullscreen && (
          <div className="text-center mb-6 lg:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-200/60 text-emerald-800 text-xs uppercase tracking-widest font-semibold mb-3">
              <MapIcon className="w-3 h-3" />
              Interactive Atlas
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-800 mb-3">
              The Trip Map
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-2">
              Tap any marker to see stop details. Switch between topographic,
              satellite, and voyager basemaps in the top-left. The red dashed
              line is your 484-mile driving route.
            </p>
          </div>
        )}

        <div
          className={cn(
            "grid gap-3 lg:gap-6",
            isFullscreen
              ? "h-screen grid-cols-1 grid-rows-[1fr] lg:grid-cols-[1fr_360px] lg:grid-rows-1"
              : "grid-cols-1 lg:grid-cols-[1fr_300px]"
          )}
        >
          {/* Map container */}
          <div
            className={cn(
              "relative",
              isFullscreen ? "h-full" : "h-[55vh] sm:h-[60vh] lg:h-[650px] min-h-[350px]"
            )}
          >
            <TripMap
              selectedId={selectedId}
              onSelectPlace={handleSelect}
              showRoadside={false}
              className={cn(
                "shadow-2xl border border-slate-200 h-full",
                isFullscreen && "border-0 rounded-none"
              )}
            />

            {/* Top-right controls (just fullscreen now — legend is gone) */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2.5 hover:bg-white transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-slate-700" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-slate-700" />
                )}
              </button>
            </div>

            {/* Mobile bottom-sheet toggle button (always visible) */}
            {!isFullscreen && (
              <button
                onClick={() => setSheetOpen(!sheetOpen)}
                className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-700 text-white rounded-full shadow-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
              >
                {sheetOpen ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" /> Hide stops list
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" /> {PLACES.length} stops · Tap to view
                  </>
                )}
              </button>
            )}

            {/* Nearby toggle - inline bottom-left for desktop, top-left for fullscreen mobile */}
            <div className="absolute bottom-3 left-3 z-[1000] lg:top-auto lg:bottom-3">
              <Card className="bg-white/95 backdrop-blur-sm p-2.5 flex items-center gap-2 border-0 shadow-lg">
                <Label
                  htmlFor="potential-toggle-map"
                  className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Potential Sites</span>
                  <span className="sm:hidden">Potential Sites</span>
                </Label>
                <Switch
                  id="potential-toggle-map"
                  checked={showPotential}
                  onCheckedChange={setShowNearby}
                />
              </Card>
            </div>
          </div>

          {/* Desktop sidebar (lg+) — always visible */}
          {!isFullscreen && (
            <Card className="hidden lg:block p-4 bg-white h-[650px] overflow-hidden flex flex-col">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 px-2 flex items-center justify-between">
                <span>Your {PLACES.length} Planned Stops</span>
                <span className="text-emerald-700 normal-case tracking-normal">
                  {PLACES.length} total
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {PLACES.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelect(place.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 group",
                      selectedId === place.id
                        ? "border-amber-500 bg-amber-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {CAT_EMOJI[place.category]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 group-hover:text-amber-700 transition-colors truncate">
                        {place.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {place.address?.split(",")[0] ||
                          `${place.coords.lat.toFixed(3)}, ${place.coords.lng.toFixed(3)}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-emerald-700 font-medium">
                          {place.cost?.split("(")[0].trim() || "FREE"}
                        </span>
                        {place.lowEffortScenic && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                            Easy
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Fullscreen mode sidebar (lg+) */}
          {isFullscreen && (
            <Card className="hidden lg:flex flex-col p-4 bg-white h-screen border-0 rounded-none">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">
                  {PLACES.length} Planned Stops
                </div>
                <button
                  onClick={() => setIsFullscreen(false)}
                  aria-label="Close fullscreen map"
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {PLACES.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelect(place.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 group",
                      selectedId === place.id
                        ? "border-amber-500 bg-amber-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {CAT_EMOJI[place.category]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">
                        {place.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {place.address?.split(",")[0]}
                      </div>
                      {place.lowEffortScenic && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          Easy stop
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {!isFullscreen && (
        <div
          className={cn(
            "lg:hidden fixed inset-x-0 bottom-0 z-[90] transition-transform duration-300",
            sheetOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Collapse stops list"
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                </button>
                <h3 className="font-bold text-slate-800">
                  {PLACES.length} Planned Stops
                </h3>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Close stops list"
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {PLACES.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelect(place.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3",
                    selectedId === place.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 active:bg-slate-50"
                  )}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {CAT_EMOJI[place.category]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">
                      {place.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {place.address?.split(",")[0] || `${place.coords.lat.toFixed(3)}, ${place.coords.lng.toFixed(3)}`}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-emerald-700 font-medium">
                        {place.cost?.split("(")[0].trim() || "FREE"}
                      </span>
                      {place.lowEffortScenic && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          Easy
                        </span>
                      )}
                      {place.effort && (
                        <span className="text-[10px] text-slate-500">
                          {place.trailDistance}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attraction catalog (all legs) with filters */}
      {!isFullscreen && (
        <div className="mt-8">
          <AttractionCatalog />
        </div>
      )}

      {/* Legacy roadside attractions (per-leg quick cards) */}
      {!isFullscreen && (
        <div className="mt-4">
          <RoadsideAttractionsCard maxDetour={20} />
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 12px 16px;
        }
        /* Larger touch targets on mobile for Leaflet markers */
        @media (max-width: 768px) {
          .leaflet-container .leaflet-control-zoom {
            margin-top: 60px !important;
          }
        }
      `}</style>
    </section>
  );
}
