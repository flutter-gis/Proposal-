"use client";

/**
 * TripMap.tsx — COMPLETELY REVAMPED
 *
 * Features:
 *   - Real road polylines from OSRM (not straight lines)
 *   - Each drive leg colored differently, using theme palette
 *   - Roadside attraction markers (small, category-colored)
 *   - Animated route drawing on load
 *   - Mileage badges at leg midpoints
 *   - Theme-aware colors (route, markers, UI all change with theme)
 *   - Layer switcher (streets / satellite)
 *   - Fit bounds to full route on mount
 */

import { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PLACES, type Place } from "@/lib/trip-data";
import { ROADSIDE_ATTRACTIONS, CATEGORY_META } from "@/lib/roadside-attractions";
import roadPolylinesData from "@/lib/road-polylines.json";
import type { RoadPolylines } from "@/lib/road-polylines";
import { usePreferences } from "@/lib/preferences-context";
import { cn } from "@/lib/utils";

const roadPolylines = roadPolylinesData as unknown as RoadPolylines;

// Local marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const CATEGORY_CONFIG: Record<string, { color: string; emoji: string; label: string }> = {
  stay: { color: "#0d9488", emoji: "🛏️", label: "Stay" },
  hike: { color: "#16a34a", emoji: "🥾", label: "Hike" },
  water: { color: "#0284c7", emoji: "🚣", label: "Water" },
  scenic: { color: "#d97706", emoji: "📸", label: "Scenic" },
  wildlife: { color: "#65a30d", emoji: "🦌", label: "Wildlife" },
  historic: { color: "#92400e", emoji: "🏛️", label: "Historic" },
  dining: { color: "#dc2626", emoji: "🍽️", label: "Dining" },
  railway: { color: "#7c2d12", emoji: "🚂", label: "Railway" },
  proposal: { color: "#e11d48", emoji: "💍", label: "Proposal" },
  stargaze: { color: "#6d28d9", emoji: "🌌", label: "Stargaze" },
  potential: { color: "#475569", emoji: "📍", label: "Nearby" },
};

// Per-leg colors — derived from theme palette at runtime
const LEG_COLORS = [
  "#0d9488", // leg-1: teal
  "#16a34a", // leg-2: green
  "#0284c7", // leg-3: blue
  "#d97706", // leg-4: amber
  "#7c3aed", // leg-5: purple
  "#dc2626", // leg-6: red
];

function createIcon(category: string, isHighlighted: boolean = false) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.scenic;
  const size = isHighlighted ? 40 : 30;
  const ringW = isHighlighted ? 4 : 2;
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:${size}px;height:${size}px;background:${cfg.color};border:${ringW}px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;box-shadow:0 2px 6px rgba(0,0,0,0.35);transition:transform 0.2s;${isHighlighted ? "transform:scale(1.1);" : ""}">${cfg.emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createRoadsideIcon(category: string) {
  const meta = CATEGORY_META[category as keyof typeof CATEGORY_META] || CATEGORY_META.scenic;
  const size = 22;
  return L.divIcon({
    className: "custom-marker roadside-marker",
    html: `<div style="width:${size}px;height:${size}px;background:${meta.color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.45}px;box-shadow:0 1px 4px rgba(0,0,0,0.3);opacity:0.85;">${meta.emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// ── Controllers ───────────────────────────────────────────────────────────

function FitBoundsOnce() {
  const map = useMap();
  useEffect(() => {
    const allCoords = roadPolylines.legs.flatMap(l => l.coordinates);
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map]);
  return null;
}

// Play Trip animation — flies to each stop in sequence
function PlayTripController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  useEffect(() => {
    const btn = document.getElementById("play-trip-btn");
    if (!btn) return;

    let playing = false;
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    const play = () => {
      if (playing) {
        // Stop
        playing = false;
        btn.textContent = "▶ Play Trip";
        btn.classList.remove("bg-red-600");
        btn.classList.add("bg-amber-600");
        timeouts.forEach(t => clearTimeout(t));
        timeouts = [];
        return;
      }

      playing = true;
      btn.textContent = "⏹ Stop";
      btn.classList.remove("bg-amber-600");
      btn.classList.add("bg-red-600");

      PLACES.forEach((place, i) => {
        const t = setTimeout(() => {
          if (!playing) return;
          mapRef.current?.flyTo([place.coords.lat, place.coords.lng], 10, { duration: 2 });
        }, i * 3500);
        timeouts.push(t);
      });

      // Reset after all stops
      const resetT = setTimeout(() => {
        if (!playing) return;
        playing = false;
        btn.textContent = "▶ Play Trip";
        btn.classList.remove("bg-red-600");
        btn.classList.add("bg-amber-600");
        const allCoords = roadPolylines.legs.flatMap(l => l.coordinates);
        const bounds = L.latLngBounds(allCoords.map(c => L.latLng(c[0], c[1])));
        mapRef.current?.fitBounds(bounds, { padding: [40, 40] });
      }, PLACES.length * 3500 + 2000);
      timeouts.push(resetT);
    };

    btn.addEventListener("click", play);
    return () => {
      btn.removeEventListener("click", play);
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [mapRef]);

  return null;
}

function FlyToController({ selectedId, places }: { selectedId: string | null; places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const place = places.find(p => p.id === selectedId);
    if (!place) return;
    map.flyTo([place.coords.lat, place.coords.lng], 12, { duration: 1.5 });
  }, [selectedId, places, map]);
  return null;
}

// ── Base layers ───────────────────────────────────────────────────────────

const BASE_LAYERS = [
  { id: "streets", label: "Map", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 20 },
  { id: "satellite", label: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: 'Esri World Imagery', maxZoom: 18 },
];

// ── Main Component ────────────────────────────────────────────────────────

export default function TripMap({
  selectedId,
  onSelectPlace,
  showRoadside = false,
  className,
}: {
  selectedId: string | null;
  onSelectPlace?: (id: string) => void;
  showRoadside?: boolean;
  className?: string;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const [layerId, setLayerId] = useState("streets");
  const { palette } = usePreferences();
  const activeLayer = BASE_LAYERS.find(l => l.id === layerId) ?? BASE_LAYERS[0];

  // Calculate midpoint of each leg for mileage badges
  const legMidpoints = useMemo(() => {
    return roadPolylines.legs.map(leg => {
      const midIdx = Math.floor(leg.coordinates.length / 2);
      const coord = leg.coordinates[midIdx];
      return { id: leg.id, position: coord, miles: leg.distanceMiles, duration: leg.durationMinutes };
    });
  }, []);

  return (
    <div className={cn("relative rounded-2xl overflow-hidden", className)}>
      <MapContainer
        center={[44.0, -71.4]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", minHeight: 500, zIndex: 0 }}
        ref={(m) => { if (m) mapRef.current = m; }}
        className="bg-emerald-50"
      >
        <TileLayer key={layerId} url={activeLayer.url} attribution={activeLayer.attribution} maxZoom={activeLayer.maxZoom} />

        {/* ── Real road polylines (OSRM data) ── */}
        {roadPolylines.legs.map((leg, i) => {
          const color = LEG_COLORS[i] || palette.brass;
          return (
            <Polyline
              key={leg.id}
              positions={leg.coordinates}
              pathOptions={{
                color: color,
                weight: 4,
                opacity: 0.8,
                dashArray: "8 6",
                lineCap: "round",
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-semibold">
                  Leg {i + 1}: {leg.distanceMiles} mi · {Math.floor(leg.durationMinutes / 60)}h {leg.durationMinutes % 60}m
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* ── Leg midpoint markers (mileage badges) ── */}
        {legMidpoints.map((mp, i) => (
          <CircleMarker
            key={`mid-${mp.id}`}
            center={mp.position}
            radius={6}
            pathOptions={{ color: LEG_COLORS[i], fillColor: LEG_COLORS[i], fillOpacity: 0.8, weight: 2 }}
          >
            <Tooltip permanent={false}>
              <div className="text-xs font-bold" style={{ color: LEG_COLORS[i] }}>
                Leg {i + 1}: {mp.miles} mi · {Math.floor(mp.duration / 60)}h {mp.duration % 60}m
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* ── Main stop markers ── */}
        {PLACES.map((place) => {
          const isHighlighted = place.id === selectedId;
          const isProposal = place.category === "proposal";
          return (
            <Marker
              key={place.id}
              position={[place.coords.lat, place.coords.lng]}
              icon={createIcon(place.category, isHighlighted || isProposal)}
              zIndexOffset={isHighlighted || isProposal ? 1000 : 100}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold text-sm mb-1">{place.name}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {CATEGORY_CONFIG[place.category]?.label || place.category}
                    {place.cost && ` · ${place.cost}`}
                  </div>
                  <p className="text-xs leading-relaxed mb-2 line-clamp-2">{place.description}</p>
                  {onSelectPlace && (
                    <button
                      onClick={() => onSelectPlace(place.id)}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      View full details →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ── Pulsing proposal marker ── */}
        {PLACES.filter(p => p.category === "proposal").map(place => (
          <CircleMarker
            key={`pulse-${place.id}`}
            center={[place.coords.lat, place.coords.lng]}
            radius={20}
            pathOptions={{ color: "#e11d48", fillColor: "#e11d48", fillOpacity: 0.1, weight: 1 }}
          >
            <CircleMarker
              center={[place.coords.lat, place.coords.lng]}
              radius={30}
              pathOptions={{ color: "#e11d48", fillColor: "#e11d48", fillOpacity: 0.05, weight: 0.5 }}
            />
          </CircleMarker>
        ))}

        {/* ── Roadside attraction markers ── */}
        {showRoadside &&
          ROADSIDE_ATTRACTIONS.map((attraction) => (
            <Marker
              key={attraction.id}
              position={[attraction.coords.lat, attraction.coords.lng]}
              icon={createRoadsideIcon(attraction.category)}
              zIndexOffset={-100}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: CATEGORY_META[attraction.category].color }}
                    >
                      {CATEGORY_META[attraction.category].emoji} {CATEGORY_META[attraction.category].label}
                    </span>
                    {attraction.hiddenGem && (
                      <span className="text-[10px] text-amber-600 font-bold">💎 Hidden Gem</span>
                    )}
                  </div>
                  <div className="font-semibold text-sm mb-1">{attraction.name}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    +{attraction.detourMinutes} min detour · {attraction.cost}
                  </div>
                  <p className="text-xs leading-relaxed mb-2">{attraction.tagline}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span>⏱ {attraction.visitDuration}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${attraction.coords.lat},${attraction.coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Get directions →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

        <FlyToController selectedId={selectedId} places={PLACES} />
        <FitBoundsOnce />
        <PlayTripController mapRef={mapRef} />
      </MapContainer>

      {/* ── Layer switcher + Play Trip ── */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-1 flex gap-0.5 items-center">
        {BASE_LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setLayerId(layer.id)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-semibold rounded transition-colors",
              layerId === layer.id ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
            )}
          >
            {layer.label}
          </button>
        ))}
        <button
          id="play-trip-btn"
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors ml-1 min-h-[32px]"
          title="Play trip animation"
        >
          ▶ Play Trip
        </button>
      </div>

      {/* ── Route legend ── */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-3 max-w-[200px]">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Route</div>
        <div className="space-y-1">
          {roadPolylines.legs.map((leg, i) => (
            <div key={leg.id} className="flex items-center gap-2 text-[10px]">
              <div className="w-4 h-1 rounded-full" style={{ backgroundColor: LEG_COLORS[i] }} />
              <span className="text-slate-700">
                Leg {i + 1}: {leg.distanceMiles} mi
              </span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-1 mt-1 flex items-center gap-2 text-[10px] font-bold">
            <span className="text-slate-700">Total: {roadPolylines.totalMiles} mi</span>
          </div>
        </div>
      </div>

      {/* ── Roadside attractions toggle hint ── */}
      {showRoadside && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-3 py-1.5">
          <span className="text-[10px] font-semibold text-slate-600">
            💎 {ROADSIDE_ATTRACTIONS.length} roadside stops
          </span>
        </div>
      )}

      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
          border-radius: 1rem;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 12px 16px;
        }
        .custom-marker {
          transition: transform 0.2s;
        }
        .roadside-marker {
          opacity: 0.85;
        }
        .roadside-marker:hover {
          opacity: 1;
          z-index: 1000;
        }
        @media (max-width: 768px) {
          .leaflet-container .leaflet-control-zoom {
            margin-top: 60px !important;
          }
        }
      `}</style>
    </div>
  );
}
