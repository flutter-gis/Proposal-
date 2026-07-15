/**
 * category-icons.ts — Consistent SVG icon mapping (BUG-08 fix)
 *
 * Replaces emoji-as-icons with lucide-react SVG icons.
 * Guarantees pixel-identical rendering across all platforms.
 */
import {
  Bed, Footprints, Sailboat, Camera, Bird, Landmark,
  Utensils, Train, Gem, Telescope, MapPin, type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  stay: Bed,
  hike: Footprints,
  water: Sailboat,
  scenic: Camera,
  wildlife: Bird,
  historic: Landmark,
  dining: Utensils,
  railway: Train,
  proposal: Gem,
  stargaze: Telescope,
  nearby: MapPin,
};

export const CATEGORY_COLOR: Record<string, string> = {
  stay: "#0d9488",
  hike: "#16a34a",
  water: "#0284c7",
  scenic: "#d97706",
  wildlife: "#65a30d",
  historic: "#92400e",
  dining: "#dc2626",
  railway: "#7c2d12",
  proposal: "#e11d48",
  stargaze: "#6d28d9",
  nearby: "#475569",
};
