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
import { CarIcon, LightningIcon, CroissantIcon } from "./day-icons-svg";

// ── Icon name union (all supported icons) ─────────────────────────────
// Phase 1: 14 category icons
// Phase 2: 3 new day icons (car, lightning, croissant) + 3 reused (hike, proposal, stargaze)
export type IconName = CategoryIconName | "car" | "lightning" | "croissant";

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
  car:       { render: CarIcon,       hasAnimations: true },
  lightning: { render: LightningIcon, hasAnimations: true },
  croissant: { render: CroissantIcon, hasAnimations: true },
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
export { CarIcon, LightningIcon, CroissantIcon };

// ── Day index → icon name mapping ─────────────────────────────────────
// Maps day 1-6 to their themed icons.
// Day 1: car (Off-Grid Escape), Day 2: hike (Still Waters),
// Day 3: lightning (Powered Prep), Day 4: proposal (Big Proposal),
// Day 5: stargaze (Dark Skies), Day 6: croissant (Grand Finale)
export const DAY_ICON_MAP: IconName[] = [
  "car",       // Day 1
  "hike",      // Day 2
  "lightning", // Day 3
  "proposal",  // Day 4
  "stargaze",  // Day 5
  "croissant", // Day 6
];
