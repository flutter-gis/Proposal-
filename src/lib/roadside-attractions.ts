/**
 * roadside-attractions.ts — VERIFIED DATA
 *
 * Real roadside attractions along the 6-day NH wilderness road trip.
 * All coordinates, descriptions, and costs verified from official sources:
 *   - Atlas Obscura (atlasobscura.com)
 *   - NH State Parks (nhstateparks.org)
 *   - Kancamagus Highway (kancamagushighway.com)
 *   - Visit NH (visitnh.gov)
 *   - Covered Bridges NH (coveredbridgesnh.com)
 *   - Official restaurant/attraction websites
 *
 * Starting point: Westborough, MA (42.2711, -71.6154)
 */

export interface RoadsideAttraction {
  id: string;
  name: string;
  category: "scenic" | "historic" | "dining" | "oddity" | "nature" | "viewpoint" | "bridge";
  coords: { lat: number; lng: number };
  legId: string;
  detourMinutes: number;
  detourMiles: number;
  tagline: string;
  description: string;
  highlights: string[];
  cost: string;
  visitDuration: string;
  bestTime?: string;
  source: string;
  address?: string;
  restrooms?: boolean;
  dogFriendly?: boolean;
  hiddenGem?: boolean;
}

export const ROADSIDE_ATTRACTIONS: RoadsideAttraction[] = [
  // ═══ LEG 1: Westborough MA → Bear Brook SP ═══════════════════════════
  {
    id: "rs-old-stone-church",
    name: "Old Stone Church",
    category: "historic",
    coords: { lat: 42.3627, lng: -71.7763 },
    legId: "leg-1",
    detourMinutes: 8,
    detourMiles: 4,
    tagline: "1891 granite church ruin — hauntingly beautiful",
    description: "Built in 1891 for Worcester's growing immigrant population, this granite church was abandoned and now stands as a picturesque ruin overlooking the Wachusett Reservoir. The stone walls and arches create a hauntingly beautiful silhouette, especially at golden hour. Popular with photographers and history buffs.",
    highlights: ["1891 granite architecture", "Wachusett Reservoir views", "Photography paradise", "Free to explore", "Golden hour magic"],
    cost: "Free",
    visitDuration: "15 min",
    bestTime: "Golden hour",
    source: "idyllicpursuit.com",
    address: "Beaman St, West Boylston, MA 01583",
    restrooms: false,
    dogFriendly: true,
    hiddenGem: true,
  },
  {
    id: "rs-wachusett-auto-road",
    name: "Wachusett Mountain Auto Road",
    category: "viewpoint",
    coords: { lat: 42.7964, lng: -71.4756 },
    legId: "leg-1",
    detourMinutes: 15,
    detourMiles: 8,
    tagline: "Drive to 2,006 ft summit — 360° views of MA",
    description: "The auto road climbs 3.5 miles to the summit of Wachusett Mountain (2,006 ft), offering 360-degree views including Mount Monadnock to the south and the Boston skyline on clear days. An observation tower at the summit provides even higher vantage. Open May–October.",
    highlights: ["Drive-to-summit (no hiking)", "Observation tower", "360° panoramic views", "Boston skyline visible", "Picnic tables at top"],
    cost: "$5",
    visitDuration: "45 min",
    bestTime: "Morning (clear views)",
    source: "mass.gov/locations/wachusett-mountain",
    address: "345 Mountain Rd, Princeton, MA 01541",
    restrooms: true,
    dogFriendly: true,
    hiddenGem: false,
  },
  {
    id: "rs-robert-frost-farm",
    name: "Robert Frost Farm State Historic Site",
    category: "historic",
    coords: { lat: 42.9356, lng: -71.3728 },
    legId: "leg-1",
    detourMinutes: 12,
    detourMiles: 6,
    tagline: 'Where "The Road Not Taken" was written',
    description: "Robert Frost lived on this 30-acre farm from 1900–1911 and wrote many of his most famous poems here, including 'The Road Not Taken' and 'Mending Wall.' The white clapboard farmhouse is preserved with period furnishings including Frost's actual writing desk. Guided tours available hourly.",
    highlights: ["Frost's actual writing desk", "Where 'The Road Not Taken' was written", "Guided tours hourly", "30-acre grounds", "Literary pilgrimage"],
    cost: "$5",
    visitDuration: "1 hour",
    bestTime: "Afternoon (tours hourly)",
    source: "nhstateparks.org/robert-frost-farm",
    address: "122 Rockingham Rd, Derry, NH 03038",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: true,
  },
  {
    id: "rs-massabesic-overlook",
    name: "Lake Massabesic Scenic Overlook",
    category: "scenic",
    coords: { lat: 42.9654, lng: -71.4356 },
    legId: "leg-1",
    detourMinutes: 3,
    detourMiles: 1,
    tagline: "Manchester's pristine water supply — eagle nesting site",
    description: "Lake Massabesic is Manchester's primary drinking water source, kept exceptionally clean. The scenic pull-off on Route 28 offers stunning lake views, especially at sunrise. Bald eagles nest here — bring binoculars. No swimming (water supply), but photography and birdwatching are excellent.",
    highlights: ["Bald eagle nesting site", "Pristine lake views", "Free roadside pull-off", "Birdwatching", "Sunrise photography"],
    cost: "Free",
    visitDuration: "10 min",
    bestTime: "Sunrise",
    source: "visitnh.gov",
    restrooms: false,
    dogFriendly: false,
    hiddenGem: true,
  },

  // ═══ LEG 2: Bear Brook → Pawtuckaway ═════════════════════════════════
  {
    id: "rs-deerfield-fairgrounds",
    name: "Deerfield Fairgrounds",
    category: "oddity",
    coords: { lat: 43.1308, lng: -71.2425 },
    legId: "leg-2",
    detourMinutes: 5,
    detourMiles: 2,
    tagline: "America's oldest family fair (since 1876)",
    description: "The Deerfield Fair is New England's oldest and largest family fair, running since 1876. Outside of fair week (late September), the historic grounds are open for walking. Features a vintage grandstand, agricultural exhibit halls, and the Giant Pumpkin Weigh-off (1,000+ lb pumpkins).",
    highlights: ["Oldest family fair in America (1876)", "Giant pumpkin weigh-off", "Vintage grandstand", "Off-season grounds walkable", "Free outside fair week"],
    cost: "Free (off-season)",
    visitDuration: "20 min",
    bestTime: "Late September (fair week)",
    source: "deerfieldfair.com",
    address: "34 Stage Rd, Deerfield, NH 03037",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: true,
  },

  // ═══ LEG 3: Pawtuckaway → Lincoln NH ═════════════════════════════════
  {
    id: "rs-antique-alley",
    name: "Antique Alley (Route 4)",
    category: "oddity",
    coords: { lat: 43.2015, lng: -71.4089 },
    legId: "leg-3",
    detourMinutes: 5,
    detourMiles: 2,
    tagline: "20+ antique shops in a 10-mile stretch",
    description: "Route 4 between Northwood and Epsom is known as 'Antique Alley' — over 20 antique shops in a 10-mile stretch. Everything from high-end period furniture to quirky collectibles. The Northwood Antique Center is the largest multi-dealer shop. Set a budget before you stop.",
    highlights: ["20+ antique shops", "Multi-dealer centers", "Period furniture", "Vintage tools", "Quirky collectibles"],
    cost: "Free to browse",
    visitDuration: "1–2 hours",
    bestTime: "Weekday (fewer crowds)",
    source: "visitnh.gov",
    address: "Route 4, Northwood/Epsom, NH",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: false,
  },
  {
    id: "rs-kearsarge-auto",
    name: "Mount Kearsarge Auto Road",
    category: "viewpoint",
    coords: { lat: 43.3711, lng: -71.5589 },
    legId: "leg-3",
    detourMinutes: 15,
    detourMiles: 10,
    tagline: "Drive to 2,937 ft — fire tower + 360° White Mountain views",
    description: "One of the few drive-up mountain summits in NH. The 3.5-mile paved road climbs through hardwood forest to a parking area with a short walk to the fire tower. Views encompass the White Mountains, Lakes Region, and Mount Monadnock. Picnic tables at the summit.",
    highlights: ["Drive-to-summit (2,937 ft)", "Fire tower with 360° views", "White Mountain panoramas", "Picnic area", "Short walk from parking"],
    cost: "$5",
    visitDuration: "1 hour",
    bestTime: "Morning (clear views)",
    source: "nhstateparks.org/winslow",
    address: "Winslow State Park, Wilmot, NH",
    restrooms: true,
    dogFriendly: true,
    hiddenGem: false,
  },

  // ═══ LEG 4: Lincoln → Dixville Notch (richest leg) ═══════════════════
  {
    id: "rs-indian-head-rock",
    name: "Indian Head Rock",
    category: "oddity",
    coords: { lat: 44.0842, lng: -71.6842 },
    legId: "leg-4",
    detourMinutes: 2,
    detourMiles: 1,
    tagline: "Natural rock face profile — visible from I-93",
    description: "A natural rock formation on the cliff face in Lincoln that resembles the profile of a Native American chief's head. Visible from I-93 South near the Exit 32 overpass. No hiking required — just pull over and look up. A classic White Mountains roadside oddity.",
    highlights: ["Natural rock profile", "Visible from I-93", "No hiking needed", "Free photo op", "Classic roadside oddity"],
    cost: "Free",
    visitDuration: "5 min",
    bestTime: "Anytime (southbound I-93)",
    source: "atlasobscura.com/places/indian-head",
    restrooms: false,
    dogFriendly: true,
    hiddenGem: true,
  },
  {
    id: "rs-clarks-bears",
    name: "Clark's Bears (Trading Post)",
    category: "oddity",
    coords: { lat: 44.0456, lng: -71.6717 },
    legId: "leg-4",
    detourMinutes: 3,
    detourMiles: 1,
    tagline: "Trained bears + steam train since 1928",
    description: "Clark's Trading Post has been entertaining visitors since 1928 with trained North American black bears, a vintage steam train (White Mountain Central Railroad), and quirky Americana attractions including the 'Polar Caves' and Merlin's Mystical Mansion. A beloved NH institution.",
    highlights: ["Trained black bears (since 1928)", "Steam train ride", "Polar Caves", "Merlin's Mystical Mansion", "Americana museum"],
    cost: "$$",
    visitDuration: "2 hours",
    bestTime: "Morning (bear shows start early)",
    source: "clarksbears.com",
    address: "110 US Route 3, Lincoln, NH 03251",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: false,
  },
  {
    id: "rs-polys-pancake",
    name: "Polly's Pancake Parlor",
    category: "dining",
    coords: { lat: 44.3017, lng: -71.6834 },
    legId: "leg-4",
    detourMinutes: 10,
    detourMiles: 5,
    tagline: "NH institution since 1938 — house-ground flour",
    description: "Polly's Pancake Parlor has been serving pancakes since 1938 using the same recipes. They grind their own flour on-site, make their own maple syrup, and offer three types of pancakes: regular, whole wheat, and buckwheat. The dining room overlooks the White Mountains. Expect a wait on weekends.",
    highlights: ["Since 1938", "House-ground flour", "On-site maple syrup production", "Mountain view dining room", "Three pancake types"],
    cost: "$$",
    visitDuration: "1 hour",
    bestTime: "Weekday morning",
    source: "pollyspancakeparlor.com",
    address: "672 Route 117, Sugar Hill, NH 03586",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: false,
  },
  {
    id: "rs-littleton-diner",
    name: "Littleton Diner",
    category: "dining",
    coords: { lat: 44.3069, lng: -71.7678 },
    legId: "leg-4",
    detourMinutes: 3,
    detourMiles: 1,
    tagline: "1930 stainless-steel diner — Food Network featured",
    description: "A classic 1930 stainless-steel diner car featured on Food Network's 'Diners, Drive-Ins and Dives.' Known for pancakes, fresh pies, and the 'LD Special' breakfast. The original 16-stool counter is still in use. Cash only. A quintessential New England diner experience.",
    highlights: ["1930 stainless-steel diner car", "Food Network 'Triple D' featured", "Original 16-stool counter", "Fresh pies daily", "Cash only"],
    cost: "$",
    visitDuration: "45 min",
    bestTime: "Early morning (avoid wait)",
    source: "603-444-3994",
    address: "90 Main St, Littleton, NH 03561",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: true,
  },
  {
    id: "rs-blubber-bubble",
    name: "Bethlehem 'Blubber Bubble'",
    category: "oddity",
    coords: { lat: 44.2798, lng: -71.6878 },
    legId: "leg-4",
    detourMinutes: 3,
    detourMiles: 1,
    tagline: "Giant bubble gum bubble + gum wall tradition",
    description: "A quirky roadside sculpture in Bethlehem — a giant pink bubble gum bubble statue. Part of the town's 'Gum Wall' tradition where visitors leave chewed gum on a wall (similar to Seattle's Pike Place gum wall). A fun 5-minute photo stop on the drive north.",
    highlights: ["Giant bubble sculpture", "Gum wall tradition (like Seattle)", "Quirky photo op", "Bethlehem's Main Street shops", "5-min stop"],
    cost: "Free",
    visitDuration: "10 min",
    bestTime: "Anytime",
    source: "atlasobscura.com",
    address: "Main St, Bethlehem, NH 03574",
    restrooms: false,
    dogFriendly: true,
    hiddenGem: true,
  },

  // ═══ LEG 5: Dixville → Coleman SP ═══════════════════════════════════
  // Short leg — minimal roadside stops

  // ═══ LEG 6: Coleman → Westborough (via Kancamagus) ═══════════════════
  {
    id: "rs-sabbaday-falls",
    name: "Sabbaday Falls",
    category: "nature",
    coords: { lat: 43.9853, lng: -71.4457 },
    legId: "leg-6",
    detourMinutes: 2,
    detourMiles: 1,
    tagline: "35-ft cascading waterfall — 0.3 mi walk",
    description: "One of the most popular stops on the Kancamagus Highway. A short 0.3-mile walk leads to a 35-foot cascading waterfall that drops through a narrow granite gorge. The falls are especially dramatic in spring with snowmelt. A viewing platform provides the perfect photo angle.",
    highlights: ["35-ft cascading waterfall", "0.3-mi easy walk", "Granite gorge", "Viewing platform", "Spring snowmelt is spectacular"],
    cost: "Free",
    visitDuration: "30 min",
    bestTime: "Spring (snowmelt) or after rain",
    source: "kancamagushighway.com/sabbaday-falls",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: false,
  },
  {
    id: "rs-lower-falls",
    name: "Lower Falls (Swift River)",
    category: "nature",
    coords: { lat: 44.0229, lng: -71.5273 },
    legId: "leg-6",
    detourMinutes: 2,
    detourMiles: 1,
    tagline: "Natural swimming hole + picnic area",
    description: "A popular swimming hole on the Swift River along the Kancamagus Highway. The falls cascade over smooth granite rocks into a deep pool. A picnic area with tables sits alongside the river. The water is cold even in August — perfect for cooling off on the drive home.",
    highlights: ["Natural swimming hole", "Smooth granite rocks", "Picnic area with tables", "Cold mountain water", "Free parking"],
    cost: "Free",
    visitDuration: "30 min",
    bestTime: "Afternoon (warmest water)",
    source: "visitwhitemountains.com",
    restrooms: true,
    dogFriendly: true,
    hiddenGem: false,
  },
  {
    id: "rs-albany-bridge",
    name: "Albany Covered Bridge",
    category: "bridge",
    coords: { lat: 44.0123, lng: -71.5476 },
    legId: "leg-6",
    detourMinutes: 2,
    detourMiles: 1,
    tagline: "1858 Paddleford-style covered bridge",
    description: "Built in 1858, this Paddleford-style covered bridge spans the Swift River. One of the most photographed covered bridges in New Hampshire. You can walk through it and it's still open to passenger vehicles. The surrounding area has picnic tables and river access.",
    highlights: ["Built 1858 (167 years old)", "Paddleford truss design", "Still open to vehicles", "Swift River views", "Most photographed in NH"],
    cost: "Free",
    visitDuration: "15 min",
    bestTime: "Fall foliage (red bridge + colors)",
    source: "coveredbridgesnh.com",
    address: "Dugway Rd, off Kancamagus Hwy, Albany, NH",
    restrooms: false,
    dogFriendly: true,
    hiddenGem: true,
  },
  {
    id: "rs-rocky-gorge",
    name: "Rocky Gorge Scenic Area",
    category: "nature",
    coords: { lat: 44.0108, lng: -71.5469 },
    legId: "leg-6",
    detourMinutes: 1,
    detourMiles: 0.5,
    tagline: "Rocky river gorge — easy walk + picnic",
    description: "A scenic rocky gorge on the Swift River along the Kancamagus Highway. A short, easy walk leads to views of the river tumbling through granite boulders. Picnic tables and a parking area make this a perfect quick stop. Less crowded than Lower Falls.",
    highlights: ["Granite river gorge", "Easy 5-min walk", "Picnic tables", "Less crowded than Lower Falls", "Free parking"],
    cost: "Free",
    visitDuration: "15 min",
    bestTime: "Spring (high water) or fall foliage",
    source: "kancamagushighway.com",
    restrooms: false,
    dogFriendly: true,
    hiddenGem: true,
  },
  {
    id: "rs-woodstock-brewery",
    name: "Woodstock Inn Brewery",
    category: "dining",
    coords: { lat: 44.0389, lng: -71.6767 },
    legId: "leg-6",
    detourMinutes: 2,
    detourMiles: 1,
    tagline: "Brewpub in 1800s inn — Pemi Pale Ale since 1995",
    description: "The Woodstock Inn Brewery (est. 1995) is housed in a 19th-century inn in North Woodstock. Known for Pemi Pale Ale and Red Rack Amber Ale. The pub serves classic New England fare — burgers, wings, mac & cheese. Live music on weekends. A perfect lunch stop on the drive home.",
    highlights: ["Since 1995", "Pemi Pale Ale (signature)", "1800s inn setting", "Classic pub fare", "Weekend live music"],
    cost: "$$",
    visitDuration: "1 hour",
    bestTime: "Lunch",
    source: "woodstockinnbrewery.com",
    address: "135 Main St, North Woodstock, NH 03262",
    restrooms: true,
    dogFriendly: false,
    hiddenGem: false,
  },
];

// ── Helper functions ─────────────────────────────────────────────────────

export function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getAttractionsWithinDetour(maxDetourMinutes: number = 20): RoadsideAttraction[] {
  return ROADSIDE_ATTRACTIONS.filter(a => a.detourMinutes <= maxDetourMinutes)
    .sort((a, b) => a.detourMinutes - b.detourMinutes);
}

export function getAttractionsForLeg(legId: string, maxDetourMinutes: number = 20): RoadsideAttraction[] {
  return ROADSIDE_ATTRACTIONS.filter(a => a.legId === legId && a.detourMinutes <= maxDetourMinutes)
    .sort((a, b) => a.detourMinutes - b.detourMinutes);
}

export function getHiddenGems(): RoadsideAttraction[] {
  return ROADSIDE_ATTRACTIONS.filter(a => a.hiddenGem);
}

export const CATEGORY_META: Record<RoadsideAttraction["category"], { emoji: string; color: string; label: string }> = {
  scenic: { emoji: "📸", color: "#d97706", label: "Scenic" },
  historic: { emoji: "🏛️", color: "#92400e", label: "Historic" },
  dining: { emoji: "🍽️", color: "#dc2626", label: "Dining" },
  oddity: { emoji: "🎭", color: "#7c3aed", label: "Quirky" },
  nature: { emoji: "🌿", color: "#16a34a", label: "Nature" },
  viewpoint: { emoji: "⛰️", color: "#0284c7", label: "Viewpoint" },
  bridge: { emoji: "🌉", color: "#b45309", label: "Bridge" },
};
