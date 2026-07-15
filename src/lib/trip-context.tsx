"use client";

/**
 * trip-context.tsx
 *
 * Single source of truth for the app's "current view" state: which page
 * is active, which day in the Trip timeline is focused, which place is
 * selected (for the detail dialog), and whether the dialog is open.
 *
 * Also derives:
 *   - pageId     — short id for the active page (home / trip / map / proposal / us)
 *   - auroraVariant — which AuroraRoot palette to use, page-driven and
 *                     day-aware when the user is on the Trip page.
 *
 * H-05: URL routing now extends to deep links:
 *   /            → Home
 *   /trip        → Trip tab
 *   /trip#day4   → Trip tab, Day 4 expanded + scrolled into view
 *   /trip#stop5  → Trip tab, place detail dialog opens for stop #5
 *   /map         → Map tab
 *   /proposal    → Proposal tab
 *   /us          → Us tab
 *   /settings    → Settings tab
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PageId = "home" | "trip" | "map" | "proposal" | "us" | "settings";

export type AuroraVariant =
  | "forest"
  | "homecoming"
  | "moss"
  | "sunset"
  | "cosmic"
  | "dawn"
  | "lake"
  | "goldenhour"
  | "midnight";

interface TripContextValue {
  currentPage: number; // 0-based slide index
  currentDay: number; // 0-based day index in DAY_PLANS (active in Trip page)
  selectedPlaceId: string | null;
  dialogOpen: boolean;
  /** Place ID to highlight on the Map (set when navigating from catalog "Map" checkbox). */
  mapHighlightId: string | null;

  setPage: (idx: number) => void;
  setDay: (idx: number) => void;
  setSelectedPlaceId: (id: string | null) => void;
  setDialogOpen: (open: boolean) => void;
  setMapHighlightId: (id: string | null) => void;

  pageId: PageId;
  auroraVariant: AuroraVariant;
}

const PAGE_IDS: PageId[] = ["home", "trip", "map", "proposal", "us", "settings"];

// Per-page default aurora palette. The Trip page is special — it day-aware
// picks a palette based on which day the user is currently viewing.
const PAGE_TO_AURORA: Record<PageId, AuroraVariant> = {
  home: "dawn",
  trip: "forest", // overridden below by day-aware logic
  map: "moss",
  proposal: "sunset",
  us: "cosmic",
  settings: "forest",
};

// Day 1..6 → aurora variant. Mirrors DayHeader's day textures.
const DAY_TO_AURORA: AuroraVariant[] = [
  "forest", // Day 1 — Off-Grid Escape
  "lake", // Day 2 — Still Waters & Wildlife
  "moss", // Day 3 — Powered Preparation
  "goldenhour", // Day 4 — The Big Proposal
  "cosmic", // Day 5 — Frontier Horizons & Dark Skies
  "homecoming", // Day 6 — Double-Header Grand Finale
];

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDay, setCurrentDay] = useState(0); // Day 1 by default
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mapHighlightId, setMapHighlightId] = useState<string | null>(null);

  // ── H-05: Parse URL on mount. Using HASH routing to avoid 404s on refresh
  //   (path-based routing requires actual Next.js route files). Supported:
  //     #trip         → Trip tab
  //     #trip/day4    → Trip tab, day 4 active
  //     #trip/stop-5  → Trip tab, open dialog for stop-5
  //     #map          → Map tab
  //     #proposal     → Proposal tab
  //     #us           → Us tab
  //     #settings     → Settings tab
  //     #attraction-X → (on any tab) highlight attraction X on map if user navigates there
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
    // First path segment is the page id
    const [seg, ...rest] = hash.split("/");
    const idx = PAGE_IDS.indexOf(seg as PageId);
    if (idx >= 0) setCurrentPage(idx);
    // Day reference: #trip/day4
    const dayMatch = rest[0]?.match(/^day(\d)$/);
    if (dayMatch) {
      const d = parseInt(dayMatch[1], 10);
      if (d >= 1 && d <= 6) {
        setCurrentPage(1); // Trip
        setCurrentDay(d - 1);
      }
    }
    // Stop reference: #trip/stop-bear-brook
    const stopMatch = rest[0]?.match(/^stop-(.+)$/);
    if (stopMatch) {
      const placeId = stopMatch[1];
      setSelectedPlaceId(placeId);
      setDialogOpen(true);
    }
    // Attraction highlight: #/map/attraction-massabesic
    const attractionMatch = hash.match(/(?:^|\/)attraction-(.+)$/);
    if (attractionMatch) {
      setMapHighlightId(attractionMatch[1]);
    }
  }, []);

  // When the page changes, update the URL hash (so back button + sharing work)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const expectedPage = PAGE_IDS[currentPage % PAGE_IDS.length];
    const currentHash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
    const currentFirstSeg = currentHash.split("/")[0];
    if (expectedPage !== currentFirstSeg) {
      const newHash = expectedPage === "home" ? "" : `#/${expectedPage}`;
      window.history.pushState({ page: expectedPage }, "", `${window.location.pathname}${newHash}`);
    }
  }, [currentPage]);

  // Listen for back/forward button (popstate + hashchange)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
      const [seg, ...rest] = hash.split("/");
      const idx = PAGE_IDS.indexOf(seg as PageId);
      if (idx >= 0) {
        setCurrentPage(idx);
      } else {
        setCurrentPage(0); // home
      }
      // Re-parse nested segments.
      const dayMatch = rest[0]?.match(/^day(\d)$/);
      if (dayMatch) {
        const d = parseInt(dayMatch[1], 10);
        if (d >= 1 && d <= 6) {
          setCurrentPage(1);
          setCurrentDay(d - 1);
        }
      }
      const stopMatch = rest[0]?.match(/^stop-(.+)$/);
      if (stopMatch) {
        setSelectedPlaceId(stopMatch[1]);
        setDialogOpen(true);
      } else {
        setSelectedPlaceId(null);
        setDialogOpen(false);
      }
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);

  const setPage = useCallback((idx: number) => {
    setCurrentPage(((idx % PAGE_IDS.length) + PAGE_IDS.length) % PAGE_IDS.length);
  }, []);

  const setDay = useCallback((idx: number) => {
    setCurrentDay(((idx % 6) + 6) % 6);
  }, []);

  const setSelectedPlace = useCallback((id: string | null) => {
    setSelectedPlaceId(id);
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setDialogOpen(open);
  }, []);

  const setMapHighlight = useCallback((id: string | null) => {
    setMapHighlightId(id);
  }, []);

  const pageId = PAGE_IDS[currentPage % PAGE_IDS.length];

  const auroraVariant = useMemo<AuroraVariant>(() => {
    if (pageId === "trip") {
      return DAY_TO_AURORA[currentDay % DAY_TO_AURORA.length];
    }
    return PAGE_TO_AURORA[pageId];
  }, [pageId, currentDay]);

  const value = useMemo<TripContextValue>(
    () => ({
      currentPage,
      currentDay,
      selectedPlaceId,
      dialogOpen,
      mapHighlightId,
      setPage,
      setDay: setDay,
      setSelectedPlaceId: setSelectedPlace,
      setDialogOpen: setOpen,
      setMapHighlightId: setMapHighlight,
      pageId,
      auroraVariant,
    }),
    [currentPage, currentDay, selectedPlaceId, dialogOpen, mapHighlightId, setPage, setDay, setSelectedPlace, setOpen, setMapHighlight, pageId, auroraVariant]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error("useTrip must be used inside <TripProvider>");
  }
  return ctx;
}
