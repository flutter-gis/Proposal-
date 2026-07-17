"use client";

/**
 * AttractionCatalog.tsx
 *
 * A comprehensive catalog browser with filtering by:
 *   - Type (waterfall, dining, grocery, etc.)
 *   - Difficulty (drive-up, easy, moderate, strenuous)
 *   - Position (in-between stops vs near a stop)
 *   - Theme tags (free, family-friendly, photography, etc.)
 *   - Leg (which drive leg)
 *
 * Each card has an "Add to map" checkbox — off by default.
 * The map stays clean unless the user explicitly adds stops.
 *
 * Cards include footnote links to sources.
 */

import { useState, useMemo, useEffect } from "react";
import { FlyIn } from "./FlyIn";
import {
  CATALOG, TYPE_META, DIFFICULTY_META, SOURCES,
  type CatalogEntry, type AttractionType, type Difficulty,
} from "@/lib/attraction-catalog";
import { cn } from "@/lib/utils";
import { useTrip } from "@/lib/trip-context";
import { Icon as SvgIcon, TYPE_TO_ICON, DIFFICULTY_TO_ICON } from "@/components/icons/Icon";
import { Search, MapPin, Clock, DollarSign, Navigation, ChevronDown, Gem, ExternalLink, Filter } from "lucide-react";

export default function AttractionCatalog({ legId }: { legId?: string }) {
  const { setPage } = useTrip();
  const [selectedTypes, setSelectedTypes] = useState<Set<AttractionType>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<Set<Difficulty>>(new Set());
  const [selectedPosition, setSelectedPosition] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(""); // H-02: debounce 300ms
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mapSelections, setMapSelections] = useState<Set<string>>(new Set());

  // H-02: Debounce search input by 300ms to avoid excessive re-renders on rapid typing.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    let result = CATALOG;
    if (legId) result = result.filter(e => e.legId === legId);
    if (selectedTypes.size > 0) result = result.filter(e => selectedTypes.has(e.type));
    if (selectedDifficulty.size > 0) result = result.filter(e => selectedDifficulty.has(e.difficulty));
    if (selectedPosition.size > 0) result = result.filter(e => selectedPosition.has(e.position));
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.tagline.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.themes.some(t => t.includes(q))
      );
    }
    return result.sort((a, b) => a.detourMinutes - b.detourMinutes);
  }, [legId, selectedTypes, selectedDifficulty, selectedPosition, debouncedQuery]);

  const toggleType = (type: AttractionType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setSelectedDifficulty(prev => {
      const next = new Set(prev);
      next.has(diff) ? next.delete(diff) : next.add(diff);
      return next;
    });
  };

  const togglePosition = (pos: string) => {
    setSelectedPosition(prev => {
      const next = new Set(prev);
      next.has(pos) ? next.delete(pos) : next.add(pos);
      return next;
    });
  };

  const toggleMapSelection = (id: string) => {
    setMapSelections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <FlyIn className="mb-6">
      <div className="leather-card parchment-texture rounded-3xl p-5 md:p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-lobster text-2xl text-on-light mb-1">
              Attraction Catalog
            </h3>
            <p className="text-xs text-on-light/60">
              {filtered.length} of {legId ? CATALOG.filter(e => e.legId === legId).length : CATALOG.length} stops
              {mapSelections.size > 0 && ` · ${mapSelections.size} added to map`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rust-brass hover:text-rust-ember min-h-[44px] px-3 rounded-full border border-rust-brass/30 hover:border-rust-brass/50"
            aria-expanded={showFilters}
            aria-haspopup="true"
            aria-controls="catalog-filters-panel"
          >
            <Filter className="w-4 h-4" aria-hidden />
            {showFilters ? "Hide Filters" : "Filters"}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4" role="search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-light/40" aria-hidden />
          <input
            type="search"
            placeholder="Search attractions, food, grocery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search attractions"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-rust-cream/60 border border-rust-brass/30 text-sm text-on-light placeholder:text-on-light/40 focus:outline-none focus:border-rust-brass focus:ring-1 focus:ring-rust-brass min-h-[44px]"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div
            id="catalog-filters-panel"
            className="mb-4 space-y-3 p-4 bg-rust-cream/40 rounded-2xl border border-rust-brass/20 anim-fade-in-up"
          >
            {/* Type filters */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-light/50 mb-2">Type</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TYPE_META).map(([type, meta]) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type as AttractionType)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all min-h-[32px]",
                      selectedTypes.has(type as AttractionType)
                        ? "text-white border-transparent"
                        : "bg-transparent text-on-light/60 border-rust-brass/30 hover:border-rust-brass/50"
                    )}
                    style={selectedTypes.has(type as AttractionType) ? { backgroundColor: meta.color } : {}}
                  >
                    <SvgIcon name={TYPE_TO_ICON[type as string] ?? "nearby"} size={12} /> {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty filters */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-light/50 mb-2">Difficulty</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(DIFFICULTY_META).map(([diff, meta]) => (
                  <button
                    key={diff}
                    onClick={() => toggleDifficulty(diff as Difficulty)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all min-h-[32px]",
                      selectedDifficulty.has(diff as Difficulty)
                        ? "text-white border-transparent"
                        : "bg-transparent text-on-light/60 border-rust-brass/30 hover:border-rust-brass/50"
                    )}
                    style={selectedDifficulty.has(diff as Difficulty) ? { backgroundColor: meta.color } : {}}
                  >
                    <SvgIcon name={DIFFICULTY_TO_ICON[diff as string] ?? "none"} size={12} /> {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position filters */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-light/50 mb-2">Position</div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => togglePosition("in-between")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all min-h-[32px]",
                    selectedPosition.has("in-between")
                      ? "bg-rust-forest text-white border-transparent"
                      : "bg-transparent text-on-light/60 border-rust-brass/30 hover:border-rust-brass/50"
                  )}
                >
                  In-between stops
                </button>
                <button
                  onClick={() => togglePosition("near-stop")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all min-h-[32px]",
                    selectedPosition.has("near-stop")
                      ? "bg-rust-forest text-white border-transparent"
                      : "bg-transparent text-on-light/60 border-rust-brass/30 hover:border-rust-brass/50"
                  )}
                >
                  Near a stop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((entry, idx) => (
            <CatalogCard
              key={entry.id}
              entry={entry}
              rank={idx + 1}
              expanded={expandedId === entry.id}
              onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              onMapToggle={() => toggleMapSelection(entry.id)}
              onViewOnMap={() => {
                // H-03: Map checkbox toggles map view — navigate to Map tab and
                // signal which attraction to highlight via URL hash.
                toggleMapSelection(entry.id);
                setPage(2); // Map tab index in PAGE_IDS
                if (typeof window !== "undefined") {
                  window.history.pushState(null, "", `#/map/attraction-${entry.id}`);
                  window.dispatchEvent(new HashChangeEvent("hashchange"));
                }
              }}
              isOnMap={mapSelections.has(entry.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-on-light/40 text-sm">
            No attractions match your filters.
          </div>
        )}
      </div>
    </FlyIn>
  );
}

function CatalogCard({
  entry, rank, expanded, onToggle, onMapToggle, onViewOnMap, isOnMap,
}: {
  entry: CatalogEntry; rank: number; expanded: boolean;
  onToggle: () => void; onMapToggle: () => void; onViewOnMap: () => void; isOnMap: boolean;
}) {
  const meta = TYPE_META[entry.type];
  const diffMeta = DIFFICULTY_META[entry.difficulty];
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${entry.coords.lat},${entry.coords.lng}`;

  return (
    <div className={cn(
      "relative rounded-2xl border-2 transition-all overflow-hidden",
      expanded ? "border-rust-brass bg-rust-cream/80" : "border-rust-brass/20 bg-rust-cream/50 hover:border-rust-brass/40",
      isOnMap && "ring-2 ring-rust-forest/50"
    )}>
      {/* Rank + hidden gem + map toggle */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
        {/* L-07: Rank number is now clickable — navigates to Map tab and
            highlights this attraction. Same behavior as the Map checkbox. */}
        <button
          type="button"
          onClick={onViewOnMap}
          className="w-6 h-6 min-h-[28px] min-w-[28px] rounded-full bg-rust-brass text-rust-cream flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-rust-ember transition-colors tap-feedback"
          aria-label={`Show ${entry.name} on map`}
          title="Show on map"
        >
          {rank}
        </button>
        {entry.hiddenGem && (
          <div className="w-6 h-6 rounded-full bg-rust-forest text-rust-cream flex items-center justify-center shadow-md" title="Hidden Gem">
            <Gem className="w-2.5 h-2.5" aria-hidden />
          </div>
        )}
      </div>

      {/* Map toggle — H-03: now navigates to Map tab and highlights the attraction. */}
      <div className="absolute top-2 right-2 z-10">
        <label className="flex items-center gap-1 cursor-pointer bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm min-h-[32px]">
          <input
            type="checkbox"
            checked={isOnMap}
            onChange={(e) => {
              onMapToggle();
              if (e.target.checked) onViewOnMap();
            }}
            className="w-3.5 h-3.5 accent-rust-forest"
            aria-label={`Show ${entry.name} on the map`}
          />
          <span className="text-[9px] font-semibold text-on-light" aria-hidden>Map</span>
        </label>
      </div>

      <button
        onClick={onToggle}
        className="w-full text-left p-4 pt-3 min-h-[44px]"
        aria-label={`${expanded ? "Hide" : "Show"} details for ${entry.name}`}
        aria-expanded={expanded}
      >
        {/* Badges */}
        <div className="flex items-start justify-between mb-2 ml-14 mr-12">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: meta.color }}>
            <SvgIcon name={TYPE_TO_ICON[entry.type as string] ?? "nearby"} size={12} /> {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: diffMeta.color }}>
            <SvgIcon name={DIFFICULTY_TO_ICON[entry.difficulty as string] ?? "none"} size={12} /> {diffMeta.label}
          </span>
        </div>

        {/* Name + tagline */}
        <h4 className="font-serif text-sm font-bold text-on-light mb-1">{entry.name}</h4>
        <p className="text-xs text-on-light/70 italic mb-2">{entry.tagline}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-on-light/60 mb-1">
          <span className="inline-flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" aria-hidden />{entry.cost}</span>
          <span className="inline-flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" aria-hidden />{entry.visitDuration}</span>
          <span className="inline-flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" aria-hidden />+{entry.detourMinutes}m</span>
          <span className="text-on-light/40 capitalize">{entry.position === "in-between" ? "Between" : "Near stop"}</span>
        </div>

        {/* Theme tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          {entry.themes.slice(0, 4).map(tag => (
            <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-rust-brass/10 text-rust-brass/60 font-semibold">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-rust-brass">
          <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} aria-hidden />
          {expanded ? "Less" : "More"}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 anim-fade-in-up">
          <p className="text-xs text-on-light/80 leading-relaxed font-tinos">{entry.description}</p>

          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-rust-forest mb-1.5">Highlights</h5>
            <ul className="space-y-0.5">
              {entry.highlights.map((h, i) => (
                <li key={i} className="text-[11px] text-on-light/70 flex items-start gap-1.5">
                  <span className="text-rust-forest mt-0.5">✓</span>{h}
                </li>
              ))}
            </ul>
          </div>

          {entry.address && <div className="text-[11px] text-on-light/60"><MapPin className="w-2.5 h-2.5 inline mr-1" />{entry.address}</div>}
          {entry.phone && <div className="text-[11px] text-on-light/60">{entry.phone}</div>}

          <div className="flex gap-2">
            <a href={directionsLink} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-rust-forest text-rust-cream px-3 py-2 text-[11px] font-bold hover:bg-rust-forest/90 min-h-[44px]">
              <Navigation className="w-3 h-3" /> Directions
            </a>
            {entry.website && (
              <a href={entry.website} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-rust-wax/20 border border-rust-wax/40 text-on-light px-3 py-2 text-[11px] font-bold hover:bg-rust-wax/30 min-h-[44px]">
                <ExternalLink className="w-3 h-3" /> Website
              </a>
            )}
          </div>

          {/* Footnote */}
          <div className="text-[9px] text-on-light/40 border-t border-rust-brass/10 pt-2">
            <sup>[{entry.footnoteId}]</sup>{" "}
            <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {entry.source}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
