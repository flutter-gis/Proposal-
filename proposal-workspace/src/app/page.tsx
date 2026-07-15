"use client";

/**
 * page.tsx (V32)
 *
 * TripProvider wraps everything.
 * BootSequence plays once per session.
 * AuroraRoot is ONE canvas at z-0 behind every page.
 * AppShell provides the top app bar + bottom tab bar.
 * SlideDeck renders the 5 pages (Home / Trip / Map / Proposal / Us).
 *
 * PlaceDetailDialog and AmbientMusicPlayer are overlays.
 *
 * All backgrounds opaque bg-rust-cream so AuroraRoot peeks through subtle
 * margins but never washes out content.
 */

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { TripProvider, useTrip } from "@/lib/trip-context";
import { PreferencesProvider, usePreferences } from "@/lib/preferences-context";
import EngagementReveal3D from "@/components/trip/EngagementReveal3D";
import AuroraRoot from "@/components/trip/AuroraRoot";
import MilkyWayOverlay from "@/components/trip/MilkyWayOverlay";
import AppShell from "@/components/trip/AppShell";
import SlideDeck, { type SlidePage } from "@/components/trip/SlideDeck";
import ScrollProgressTrail from "@/components/trip/ScrollProgressTrail";
import HeroSection from "@/components/trip/HeroSection";
import TripOverview from "@/components/trip/TripOverview";
import DayTimeline from "@/components/trip/DayTimeline";
import MobileFriendlyMap from "@/components/trip/MobileFriendlyMap";
import CountdownToProposal from "@/components/trip/CountdownToProposal";
import ProposalPage from "@/components/trip/ProposalPage";
import RelationshipMetrics from "@/components/trip/RelationshipMetrics";
import RingShowcase from "@/components/trip/RingShowcase";
import CouplePhotos from "@/components/trip/CouplePhotos";
import PhotoGallery from "@/components/trip/PhotoGallery";
import SettingsPage from "@/components/trip/SettingsPage";
import KeyboardShortcuts from "@/components/trip/KeyboardShortcuts";
import MusicPlayer from "@/components/trip/MusicPlayer";
import PlaceDetailDialog from "@/components/trip/PlaceDetailDialog";
import { PLACES, type Place } from "@/lib/trip-data";

function AppContent() {
  const { selectedPlaceId, setSelectedPlaceId, dialogOpen, setDialogOpen, currentPage, setPage } = useTrip();
  const { effectiveIcon } = usePreferences();
  const showMilkyWay = effectiveIcon === "stargazing";

  const selectedPlace: Place | null = selectedPlaceId
    ? PLACES.find((p) => p.id === selectedPlaceId) ?? null
    : null;

  const handleSelectPlace = useCallback(
    (place: Place) => {
      setSelectedPlaceId(place.id);
      setDialogOpen(true);
    },
    [setSelectedPlaceId, setDialogOpen]
  );

  const pages: SlidePage[] = [
    // ── PAGE 1: HOME ─────────────────────────────────────────────────────
    {
      id: "home",
      label: "Home",
      content: (
        <>
          <HeroSection />
          <TripOverview />
        </>
      ),
    },

    // ── PAGE 2: TRIP ─────────────────────────────────────────────────────
    {
      id: "trip",
      label: "Trip",
      content: (
        <DayTimeline onSelectPlace={handleSelectPlace} />
      ),
    },

    // ── PAGE 3: MAP ──────────────────────────────────────────────────────
    {
      id: "map",
      label: "Map",
      content: (
        <MobileFriendlyMap
          onSelectPlace={handleSelectPlace}
          selectedPlace={selectedPlace}
        />
      ),
    },

    // ── PAGE 4: PROPOSAL ─────────────────────────────────────────────────
    {
      id: "proposal",
      label: "Proposal",
      content: (
        <>
          <CountdownToProposal />
          <ProposalPage />
        </>
      ),
    },

    // ── PAGE 5: US ───────────────────────────────────────────────────────
    {
      id: "us",
      label: "Us",
      content: (
        <>
          <RelationshipMetrics />
          <CouplePhotos />
          <RingShowcase />
          <PhotoGallery />
          <Footer />
        </>
      ),
    },

    // ── PAGE 6: SETTINGS ─────────────────────────────────────────────────
    {
      id: "settings",
      label: "Settings",
      content: <SettingsPage />,
    },
  ];

  return (
    <>
      {/* 3D engagement reveal loads FIRST — covers everything until done */}
      <EngagementReveal3D />
      {/* Site loads behind the overlay (hidden until reveal fades) */}
      <div className={cn("transition-opacity duration-0", undefined)}>
        <AuroraRoot />
        {/* Milky Way overlay activates only when the user picks the
            stargazing icon — adds a cosmic band of ~150 stars + gas haze
            above AuroraRoot but below content. */}
        {showMilkyWay && <MilkyWayOverlay />}
        <AppShell />
        <ScrollProgressTrail />
        <div id="main-content" tabIndex={-1} className="outline-none">
          <SlideDeck pages={pages} current={currentPage} onChange={setPage} />
        </div>

        {/* Overlays */}
        <PlaceDetailDialog
          place={selectedPlace}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
        <KeyboardShortcuts />
        <MusicPlayer />
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="mt-auto bark-card text-center py-10 px-4">
      <div
        className="relative inline-flex items-center justify-center anim-breathe mb-4"
        style={{ "--glow-color": "rgba(184,134,11,0.25)" } as React.CSSProperties}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" aria-hidden>
          <ellipse cx="100" cy="30" rx="90" ry="22" fill="none"
            stroke="rgba(184,134,11,0.3)" strokeWidth="1"
            className="anim-route-draw" style={{ animationDuration: "3s" }} />
        </svg>
        <span className="relative z-10 font-serif italic text-lg sm:text-xl text-rust-brass anim-shimmer">
          8.7.26 | As One
        </span>
      </div>
      <p className="text-xs text-rust-cream/50 max-w-md mx-auto leading-relaxed">
        🎉 J &amp; Dee have an exciting moment to share! 💛 #JAndDeeSayIDo 🌲
      </p>
    </footer>
  );
}

export default function Home() {
  return (
    <TripProvider>
      <PreferencesProvider>
        <AppContent />
      </PreferencesProvider>
    </TripProvider>
  );
}
