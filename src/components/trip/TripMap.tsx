"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PLACES, POTENTIAL_SITES, DRIVE_LEGS, type Place } from "@/lib/trip-data";
import { ROADSIDE_ATTRACTIONS, CATEGORY_META, type RoadsideAttraction } from "@/lib/roadside-attractions";
import { cn } from "@/lib/utils";

// Fix default marker icons — use locally-hosted copies instead of unpkg CDN
// (avoids broken markers if unpkg is down or blocked by corporate networks)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const CATEGORY_CONFIG: Record<
  string,
  { color: string; emoji: string; label: string; ring: string }
> = {
  stay: { color: "#0d9488", emoji: "🛏️", label: "Stay", ring: "#0f766e" },
  hike: { color: "#16a34a", emoji: "🥾", label: "Hike", ring: "#15803d" },
  water: { color: "#0284c7", emoji: "🚣", label: "Water", ring: "#0369a1" },
  scenic: { color: "#d97706", emoji: "📸", label: "Scenic", ring: "#b45309" },
  wildlife: { color: "#65a30d", emoji: "🦌", label: "Wildlife", ring: "#4d7c0f" },
  historic: { color: "#92400e", emoji: "🏛️", label: "Historic", ring: "#78350f" },
  dining: { color: "#dc2626", emoji: "🍽️", label: "Dining", ring: "#b91c1c" },
  railway: { color: "#7c2d12", emoji: "🚂", label: "Railway", ring: "#9a3412" },
  proposal: { color: "#e11d48", emoji: "💍", label: "Proposal", ring: "#be123c" },
  stargaze: { color: "#6d28d9", emoji: "🌌", label: "Stargaze", ring: "#5b21b6" },
  potential: { color: "#475569", emoji: "📍", label: "Nearby", ring: "#334155" },
};

function createIcon(category: string, isHighlighted: boolean = false) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.scenic;
  const size = isHighlighted ? 40 : 30;
  const ringW = isHighlighted ? 4 : 2;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${cfg.color};
        border: ${ringW}px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35), 0 0 0 ${isHighlighted ? 2 : 0}px ${cfg.ring};
        transform: ${isHighlighted ? "scale(1.1)" : "scale(1)"};
        transition: transform 0.2s;
      ">${cfg.emoji}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Create a small roadside attraction marker (smaller + purple ring)
function createRoadsideIcon(attraction: RoadsideAttraction) {
  const meta = CATEGORY_META[attraction.category];
  const size = 22; // smaller than main markers
  return L.divIcon({
    className: "custom-marker roadside-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${meta.color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.45}px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        opacity: 0.85;
      ">${meta.emoji}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Helper to fly to a place when selected
function FlyToController({
  selectedId,
  places,
}: {
  selectedId: string | null;
  places: Place[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const place = places.find((p) => p.id === selectedId);
    if (place) {
      map.flyTo([place.coords.lat, place.coords.lng], 12, {
        duration: 1.2,
        easeLinearity: 0.4,
      });
    }
  }, [selectedId, places, map]);
  return null;
}

// Fit the map to the full route bounds once on mount — keeps the initial view
// wide (statewide) instead of dropping the user into a road-network close-up.
function FitBoundsOnce() {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [
      [42.35, -71.8],
      [43.1145, -71.3917],
      [43.0833, -71.1933],
      [44.0584, -71.6712],
      [44.8705, -71.3052],
      [45.0647, -71.3267],
      [44.1569, -71.6894],
    ];
    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map]);
  return null;
}

const ROUTE_PATH: [number, number][] = [
  [42.35, -71.8], // Central MA start
  [43.1145, -71.3917], // Bear Brook
  [43.0833, -71.1933], // Pawtuckaway
  [44.0584, -71.6712], // Lincoln
  [44.8705, -71.3052], // Dixville Notch
  [45.0647, -71.3267], // Coleman SP
  [42.35, -71.8], // Return home
];

type BaseLayer = {
  id: string;
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
};

const BASE_LAYERS: BaseLayer[] = [
  {
    id: "streets",
    label: "Map",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  {
    id: "satellite",
    label: "Satellite",
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, USDA",
    maxZoom: 18,
  },
];

export default function TripMap({
  selectedId,
  onSelectPlace,
  showPotential,
  showRoadside = true,
  className,
}: {
  selectedId: string | null;
  onSelectPlace?: (id: string) => void;
  showPotential?: boolean;
  showRoadside?: boolean;
  className?: string;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const [layerId, setLayerId] = useState<string>("streets");

  const activeLayer = BASE_LAYERS.find((l) => l.id === layerId) ?? BASE_LAYERS[0];

  return (
    <div className={cn("relative rounded-2xl overflow-hidden", className)}>
      <MapContainer
        center={[44.0, -71.4]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", minHeight: 500, zIndex: 0 }}
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
        className="bg-emerald-50"
      >
        <TileLayer
          key={activeLayer.id}
          attribution={activeLayer.attribution}
          url={activeLayer.url}
          maxZoom={activeLayer.maxZoom}
        />

        {/* Route polyline — softer, more elegant */}
        <Polyline
          positions={ROUTE_PATH}
          pathOptions={{
            color: "#dc2626",
            weight: 2.5,
            opacity: 0.55,
            dashArray: "8, 10",
            lineCap: "round",
          }}
        />

        {/* Main places */}
        {PLACES.map((place) => (
          <Marker
            key={place.id}
            position={[place.coords.lat, place.coords.lng]}
            icon={createIcon(place.category, selectedId === place.id)}
            zIndexOffset={selectedId === place.id ? 1000 : 0}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold text-base mb-1">{place.name}</div>
                <div className="text-xs text-muted-foreground mb-2 capitalize">
                  {CATEGORY_CONFIG[place.category]?.label} • {place.cost || "FREE"}
                </div>
                <p className="text-sm leading-relaxed mb-2">
                  {place.description.slice(0, 140)}
                  {place.description.length > 140 ? "…" : ""}
                </p>
                {place.address && (
                  <div className="text-xs text-muted-foreground mb-1">
                    📍 {place.address}
                  </div>
                )}
                {onSelectPlace && (
                  <button
                    onClick={() => onSelectPlace(place.id)}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    View full details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nearby recommended places */}
        {showPotential &&
          POTENTIAL_SITES.map((place) => (
            <Marker
              key={place.id}
              position={[place.coords.lat, place.coords.lng]}
              icon={createIcon("potential", false)}
              zIndexOffset={0}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-sm mb-1">{place.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    📍 {place.closestMainStop}
                  </div>
                  <p className="text-xs leading-relaxed mb-2">{place.description}</p>
                  <div className="text-xs italic text-emerald-700">
                    Why: {place.why}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Road-side attractions — small purple markers */}
        {showRoadside &&
          ROADSIDE_ATTRACTIONS.filter((a) => a.detourMinutes <= 20).map((attraction) => (
            <Marker
              key={attraction.id}
              position={[attraction.coords.lat, attraction.coords.lng]}
              icon={createRoadsideIcon(attraction)}
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
                  </div>
                  <div className="font-semibold text-sm mb-1">{attraction.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    +{attraction.detourMinutes} min detour · {attraction.cost}
                  </div>
                  <p className="text-xs leading-relaxed mb-2">{attraction.tagline}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span>⏱ {attraction.visitDuration}</span>
                    {attraction.rating && (
                      <span>⭐ {attraction.rating} ({attraction.reviewCount})</span>
                    )}
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
      </MapContainer>

      {/* Layer switcher — compact, top-left */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-1 flex gap-0.5">
        {BASE_LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setLayerId(layer.id)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-semibold rounded transition-colors",
              layerId === layer.id
                ? "bg-emerald-700 text-white"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Drive legs info — collapsed by default, expandable */}
      <DriveLegsCard />
    </div>
  );
}

function DriveLegsCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md max-w-[220px]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
      >
        <span>Driving Legs</span>
        <span className="text-[10px] text-slate-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1">
          {DRIVE_LEGS.map((leg) => (
            <div key={leg.id} className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{leg.day}:</span>{" "}
              {leg.miles} mi ({leg.duration})
            </div>
          ))}
          <div className="pt-1 mt-1 border-t border-slate-200 text-xs font-semibold text-slate-800">
            Total: 484 mi
          </div>
        </div>
      )}
    </div>
  );
}
