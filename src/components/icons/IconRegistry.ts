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
// Phase 2: 3 day icons (car, lightning, croissant)
export type IconName =
  | CategoryIconName
  | "car" | "lightning" | "croissant";

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
export const DAY_ICON_MAP: IconName[] = [
  "car", "hike", "lightning", "proposal", "stargaze", "croissant",
];

// ── Attraction type → icon name mapping (Phase 3-4 icons pending) ────
// For types without custom icons yet, falls back to "nearby".
export const TYPE_TO_ICON: Record<string, IconName> = {
  historic: "historic",
  dining: "dining",
  hike: "hike",
  swimming: "swimming",
  brewery: "brewery",
  grocery: "grocery",
  "scenic-drive": "car",
  museum: "historic",
  // These will map to new icons once extra-icons-svg is fixed:
  waterfall: "water",
  viewpoint: "scenic",
  oddity: "scenic",
  nature: "scenic",
  bridge: "scenic",
  gas: "grocery",
  "farm-stand": "grocery",
};

// ── Difficulty → icon name mapping ────────────────────────────────────
export const DIFFICULTY_TO_ICON: Record<string, IconName> = {
  "drive-up": "car",
  "easy": "hike",
  "moderate": "hike",
  "strenuous": "hike",
  "none": "nearby",
};
