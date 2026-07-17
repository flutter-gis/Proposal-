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
import { CarIcon as CarIconOld, LightningIcon as LightningIconOld, CroissantIcon } from "./day-icons-svg";
import { ProposalIcon as ProposalHero } from "./icons/hero/ProposalIcon";
import { StargazeIcon as StargazeHero } from "./icons/hero/StargazeIcon";
import { CarIcon as CarHero } from "./icons/hero/CarIcon";
import { LightningIcon as LightningHero } from "./icons/hero/LightningIcon";
import {
  MountainIcon, WalkingIcon, NoneIcon,
  WaterfallIcon, BridgeIcon, NatureIcon, GasIcon, CarrotIcon, TheaterIcon,
  HeartIcon, SparkleIcon, FireIcon, StarIcon, LightbulbIcon, InfinityIcon,
} from "./extra-icons-svg";

// ── Icon name union (all supported icons) ─────────────────────────────
export type IconName =
  | CategoryIconName
  | "car" | "lightning" | "croissant"
  | "mountain" | "walking" | "none"
  | "waterfall" | "bridge" | "nature" | "gas" | "farmstand" | "theater" | "carrot"
  | "heart" | "sparkle" | "fire" | "star" | "lightbulb" | "infinity";

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
  proposal:  { render: ProposalHero,  hasAnimations: true },
  stargaze:  { render: StargazeHero,  hasAnimations: true },
  nearby:    { render: NearbyIcon,    hasAnimations: true },
  swimming:  { render: SwimmingIcon,  hasAnimations: true },
  brewery:   { render: BreweryIcon,   hasAnimations: true },
  grocery:   { render: GroceryIcon,   hasAnimations: true },
  car:       { render: CarHero,       hasAnimations: true },
  lightning: { render: LightningHero, hasAnimations: true },
  croissant: { render: CroissantIcon, hasAnimations: true },
  mountain:  { render: MountainIcon,  hasAnimations: true },
  walking:   { render: WalkingIcon,   hasAnimations: true },
  none:      { render: NoneIcon,      hasAnimations: true },
  waterfall: { render: WaterfallIcon, hasAnimations: true },
  bridge:    { render: BridgeIcon,    hasAnimations: true },
  nature:    { render: NatureIcon,    hasAnimations: true },
  gas:       { render: GasIcon,       hasAnimations: true },
  farmstand: { render: CarrotIcon,    hasAnimations: true },
  theater:   { render: TheaterIcon,   hasAnimations: true },
  carrot:    { render: CarrotIcon,    hasAnimations: true },
  heart:     { render: HeartIcon,     hasAnimations: true },
  sparkle:   { render: SparkleIcon,   hasAnimations: true },
  fire:      { render: FireIcon,      hasAnimations: true },
  star:      { render: StarIcon,      hasAnimations: true },
  lightbulb: { render: LightbulbIcon, hasAnimations: true },
  infinity:  { render: InfinityIcon,  hasAnimations: true },
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

// ── Attraction type → icon name mapping ───────────────────────────────
export const TYPE_TO_ICON: Record<string, IconName> = {
  waterfall: "waterfall",
  viewpoint: "mountain",
  historic: "historic",
  dining: "dining",
  oddity: "theater",
  nature: "nature",
  bridge: "bridge",
  hike: "hike",
  swimming: "swimming",
  brewery: "brewery",
  grocery: "grocery",
  gas: "gas",
  "farm-stand": "farmstand",
  "scenic-drive": "car",
  museum: "historic",
};

// ── Difficulty → icon name mapping ────────────────────────────────────
export const DIFFICULTY_TO_ICON: Record<string, IconName> = {
  "drive-up": "car",
  "easy": "walking",
  "moderate": "hike",
  "strenuous": "mountain",
  "none": "none",
};
