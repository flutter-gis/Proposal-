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
 * G-12: URL hash sync — the current page is reflected in the URL hash
 * (e.g. #trip, #proposal) so deep-linking and PWA shortcuts work.
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

  setPage: (idx: number) => void;
  setDay: (idx: number) => void;
  setSelectedPlaceId: (id: string | null) => void;
  setDialogOpen: (open: boolean) => void;

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
  // G-12: Initialize page from URL hash if present (e.g. #proposal)
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDay, setCurrentDay] = useState(0); // Day 1 by default
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // I-07/I-08 FIX: Use History API (pushState) instead of hash routing.
  // This fixes: back button, deep-linking, and refresh-on-tab.
  // On mount, read the URL path and set the active page.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname.replace("/", "").toLowerCase();
    const idx = PAGE_IDS.indexOf(path as PageId);
    if (idx >= 0) {
      setCurrentPage(idx);
    }
    // Also check hash for backwards compatibility with old bookmark URLs
    const hash = window.location.hash.replace("#", "").toLowerCase();
    const hashIdx = PAGE_IDS.indexOf(hash as PageId);
    if (hashIdx >= 0) {
      setCurrentPage(hashIdx);
    }
  }, []);

  // When the page changes, push a new history entry (so back button works)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const expectedPage = PAGE_IDS[currentPage % PAGE_IDS.length];
    const currentPath = window.location.pathname.replace("/", "").toLowerCase();
    if (expectedPage !== currentPath) {
      window.history.pushState({ page: expectedPage }, "", `/${expectedPage === "home" ? "" : expectedPage}`);
    }
  }, [currentPage]);

  // Listen for back/forward button (popstate)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = (e: PopStateEvent) => {
      const path = window.location.pathname.replace("/", "").toLowerCase();
      const idx = PAGE_IDS.indexOf(path as PageId);
      if (idx >= 0) {
        setCurrentPage(idx);
      } else {
        setCurrentPage(0); // home
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
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
      setPage,
      setDay: setDay,
      setSelectedPlaceId: setSelectedPlace,
      setDialogOpen: setOpen,
      pageId,
      auroraVariant,
    }),
    [currentPage, currentDay, selectedPlaceId, dialogOpen, setPage, setDay, setSelectedPlace, setOpen, pageId, auroraVariant]
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
