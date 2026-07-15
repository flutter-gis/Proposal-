"use client";

/**
 * AppShell.tsx
 *
 * Fixed top app bar (rust-bark, compacts on scroll) with brand + subtitle +
 * CountdownPill (desktop only; mobile shows it in the hamburger dropdown).
 * Mobile hamburger reveals a dropdown with all 6 tabs.
 *
 * Fixed bottom tab bar with 6 tabs (Home / Trip / Map / Proposal / Us / Settings)
 * and a sliding brass indicator that animates between tabs.
 *
 * Reads `currentPage` and `setPage` from useTrip(). Scrolls to top of the
 * incoming slide.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Home, CalendarDays, Map, Diamond, Heart, Settings } from "lucide-react";
import { useTrip, type PageId } from "@/lib/trip-context";
import { usePreferences } from "@/lib/preferences-context";
import { CountdownPill } from "./CountdownToProposal";
import { cn } from "@/lib/utils";

interface TabDef {
  id: PageId;
  label: string;
  icon: ReactNode;
}

const TABS: TabDef[] = [
  { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
  { id: "trip", label: "Trip", icon: <CalendarDays className="w-4 h-4" /> },
  { id: "map", label: "Map", icon: <Map className="w-4 h-4" /> },
  { id: "proposal", label: "Proposal", icon: <Diamond className="w-4 h-4" /> },
  { id: "us", label: "Us", icon: <Heart className="w-4 h-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

export default function AppShell() {
  const { currentPage, setPage } = useTrip();
  const { effectiveIcon } = usePreferences();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Compact the app bar after a tiny bit of vertical scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (idx: number) => {
    setPage(idx);
    setMenuOpen(false);
    // Scroll the active slide (and the document) to top.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  return (
    <>
      {/* ── Top app bar ─────────────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-300",
          "bark-card border-b border-rust-brass/20 text-rust-cream",
          scrolled ? "py-2" : "py-3"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 md:px-6">
          {/* Brand + subtitle */}
          <button
            onClick={() => go(0)}
            className="flex items-center gap-2 text-left tap-feedback"
            aria-label="Go home"
          >
            <img
              src={`/icons/themes/${effectiveIcon}-192.png`}
              alt="Theme icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex-shrink-0 shadow-sm"
            />
            <div className="hidden sm:block leading-tight">
              <div className="font-serif text-sm font-bold">J &amp; Dee</div>
              <div className="text-[10px] uppercase tracking-widest text-rust-brass/80">
                Aug 4–9 · 2026
              </div>
            </div>
          </button>

          {/* Center countdown pill (desktop only) */}
          <div className="hidden md:block">
            <CountdownPill />
          </div>

          {/* Right: mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 tap-feedback"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <nav className="md:hidden absolute top-full inset-x-0 bark-card border-b border-rust-brass/20 px-4 py-3 anim-fade-in-up">
            <ul className="grid grid-cols-1 gap-1">
              {TABS.map((t, i) => (
                <li key={t.id}>
                  <button
                    onClick={() => go(i)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                      currentPage === i
                        ? "bg-rust-brass/20 text-rust-brass font-semibold"
                        : "hover:bg-white/5 text-rust-cream/80"
                    )}
                  >
                    <span className="opacity-80">{t.icon}</span>
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-center">
              <CountdownPill />
            </div>
          </nav>
        )}
      </header>

      {/* ── Bottom tab bar (mobile + desktop) ──────────────────────────── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-[100] bark-card border-t border-rust-brass/20"
        aria-label="Page navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="relative mx-auto flex max-w-md sm:max-w-lg md:max-w-xl items-stretch justify-between px-1">
          {/* Sliding brass indicator */}
          <li
            aria-hidden
            className="pointer-events-none absolute top-0 h-0.5 bg-rust-brass transition-all duration-300 ease-out"
            style={{
              left: `calc(${(currentPage / TABS.length) * 100}% + 4px)`,
              width: `calc(${100 / TABS.length}% - 8px)`,
            }}
          />
          {TABS.map((t, i) => (
            <li key={t.id} className="flex-1">
              <button
                onClick={() => go(i)}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-0.5 py-2 text-[9px] sm:text-[10px] uppercase tracking-wider tap-feedback",
                  currentPage === i
                    ? "text-rust-brass font-semibold"
                    : "text-rust-cream/60 hover:text-rust-cream"
                )}
                aria-current={currentPage === i ? "page" : undefined}
                aria-label={t.label}
              >
                <span className={cn(currentPage === i && "anim-float")}>{t.icon}</span>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
