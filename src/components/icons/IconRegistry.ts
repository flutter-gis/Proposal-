/**
 * IconRegistry.ts — Maps icon names to SVG render functions
 *
 * Each entry has a `render(id, animated)` function that returns SVG
 * children (defs + shapes + animations).
 *
 * The `id` parameter ensures gradient/filter IDs are unique per instance
 * (avoids SVG ID collisions when multiple icons render on the same page).
 */

import { type ReactNode } from "react";
import {
  StayIcon, HikeIcon, WaterIcon, ScenicIcon, WildlifeIcon, HistoricIcon,
  DiningIcon, RailwayIcon, ProposalIcon, StargazeIcon, NearbyIcon,
  SwimmingIcon, BreweryIcon, GroceryIcon,
  type CategoryIconName,
} from "./category-icons-svg";

// ── Icon name union (all supported icons) ─────────────────────────────
// Phase 1: 14 category icons
// Phase 2+: day, difficulty, UI, decorative icons will be added here
export type IconName = CategoryIconName;

// ── Registry entry type ───────────────────────────────────────────────
interface IconEntry {
  render: (id: string, animated: boolean) => ReactNode;
  /** Whether this icon has animations (for testing) */
  hasAnimations: boolean;
}

// ── Registry ──────────────────────────────────────────────────────────
export const ICON_REGISTRY: Record<IconName, IconEntry> = {
  stay:      { render: StayIcon,      hasAnimations: true },
  hike:      { render: HikeIcon,      hasAnimations: true },
  water:     { render: WaterIcon,     hasAnimations: true },
  scenic:    { render: ScenicIcon,    hasAnimations: true },
  wildlife:  { render: WildlifeIcon,  hasAnimations: true },
  historic:  { render: HistoricIcon,  hasAnimations: true },
  dining:    { render: DiningIcon,    hasAnimations: true },
  railway:   { render: RailwayIcon,   hasAnimations: true },
  proposal:  { render: ProposalIcon,  hasAnimations: true },
  stargaze:  { render: StargazeIcon,  hasAnimations: true },
  nearby:    { render: NearbyIcon,    hasAnimations: true },
  swimming:  { render: SwimmingIcon,  hasAnimations: true },
  brewery:   { render: BreweryIcon,   hasAnimations: true },
  grocery:   { render: GroceryIcon,   hasAnimations: true },
};

// ── Category name → icon name mapping ─────────────────────────────────
// Used by components that have a PlaceCategory string and need the icon name.
export const CATEGORY_TO_ICON: Record<string, IconName> = {
  stay: "stay",
  hike: "hike",
  water: "water",
  scenic: "scenic",
  wildlife: "wildlife",
  historic: "historic",
  dining: "dining",
  railway: "railway",
  proposal: "proposal",
  stargaze: "stargaze",
  nearby: "nearby",
  swimming: "swimming",
  brewery: "brewery",
  grocery: "grocery",
};

// ── Export all render functions for direct use ────────────────────────
export {
  StayIcon, HikeIcon, WaterIcon, ScenicIcon, WildlifeIcon, HistoricIcon,
  DiningIcon, RailwayIcon, ProposalIcon, StargazeIcon, NearbyIcon,
  SwimmingIcon, BreweryIcon, GroceryIcon,
};
