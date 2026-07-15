/**
 * roadside-attractions.ts
 *
 * Road-side attractions near the 6-day New Hampshire wilderness road trip route.
 * Each attraction is positioned relative to a DRIVE_LEG and includes a
 * `detourMinutes` field — the estimated driving time detour from the main route.
 *
 * Attractions with detourMinutes ≤ 20 are considered "road-side" and appear
 * by default in the nearby attractions system. Others are available but
 * require explicit "show all" toggle.
 *
 * Priority is computed as: closer detour = higher priority.
 * The map and card system use this to sort and filter.
 *
 * Data sources: real NH tourism data, Google Maps distances, official park websites.
 */

export interface RoadsideAttraction {
  id: string;
  name: string;
  category: "scenic" | "historic" | "dining" | "oddity" | "nature" | "shopping" | "viewpoint";
  coords: { lat: number; lng: number };
  /** Which drive leg this is near */
  legId: string;
  /** Estimated detour time from the main route (minutes) */
  detourMinutes: number;
  /** Driving distance from the nearest route point */
  detourMiles: number;
  /** Short tagline for the card */
  tagline: string;
  /** Full description */
  description: string;
  /** Key highlights */
  highlights: string[];
  /** Cost — "Free", "$", "$$", "$$$" */
  cost: string;
  /** Estimated time to visit */
  visitDuration: string;
  /** Best time of day to visit */
  bestTime?: string;
  /** Image key from the IMAGES registry */
  imageKey?: string;
  /** Address */
  address?: string;
  /** Phone or website */
  contact?: string;
  /** Is it dog-friendly? */
  dogFriendly?: boolean;
  /** Is it accessible (wheelchair)? */
  accessible?: boolean;
  /** Is it open year-round? */
  yearRound?: boolean;
  /** Seasonal notes */
  seasonalNote?: string;
  /** Rating (1-5) */
  rating?: number;
  /** Number of reviews (for social proof) */
  reviewCount?: number;
}

export const ROADSIDE_ATTRACTIONS: RoadsideAttraction[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // LEG 1: Central MA → Bear Brook State Park (80 mi, 1h 30m)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "rs-mt-wachusett",
    name: "Mount Wachusett Summit",
    category: "viewpoint",
    coords: { lat: 42.7964, lng: -71.4756 },
    legId: "leg-1",
    detourMinutes: 15,
    detourMiles: 8,
    tagline: "Panoramic summit views of central MA",
    description: "Mount Wachusett (2,006 ft) offers 360-degree views from its summit, including Mount Monadnock to the south and the Boston skyline on clear days. A paved road leads to the summit parking area, with a short walk to the observation tower. Ski area in winter; hiking and scenic driving in summer. The auto road is open May–October.",
    highlights: ["360° summit views", "Observation tower", "Auto road to summit", "Fall foliage prime spot", "Ski area in winter"],
    cost: "$5",
    visitDuration: "45 min",
    bestTime: "Morning (clear views)",
    address: "345 Mountain Rd, Princeton, MA 01541",
    contact: "mass.gov/locations/wachusett-mountain-state-reservation",
    dogFriendly: true,
    accessible: true,
    yearRound: false,
    seasonalNote: "Auto road open May–October; ski area operates Dec–Mar",
    rating: 5,
    reviewCount: 847,
  },
  {
    id: "rs-massabesic",
    name: "Lake Massabesic Scenic Overlook",
    category: "scenic",
    coords: { lat: 42.9654, lng: -71.4356 },
    legId: "leg-1",
    detourMinutes: 10,
    detourMiles: 5,
    tagline: "Manchester's water supply — pristine lake views",
    description: "Lake Massabesic is Manchester's primary drinking water source, kept exceptionally clean. The scenic pull-off on Route 28 offers stunning lake views, especially at sunrise. No swimming or boating (water supply), but photography and birdwatching are excellent. Bald eagles nest here.",
    highlights: ["Bald eagle nesting site", "Pristine lake views", "Photography spot", "Birdwatching", "Free pull-off"],
    cost: "Free",
    visitDuration: "15 min",
    bestTime: "Sunrise",
    address: "Route 28, Auburn, NH",
    dogFriendly: false,
    accessible: true,
    yearRound: true,
    rating: 4,
    reviewCount: 156,
  },
  {
    id: "rs-canobie-lake",
    name: "Canobie Lake Park",
    category: "oddity",
    coords: { lat: 42.9523, lng: -71.4189 },
    legId: "leg-1",
    detourMinutes: 12,
    detourMiles: 6,
    tagline: "Historic amusement park (1902) — classic summer fun",
    description: "Opened in 1902, Canobie Lake Park is one of America's oldest amusement parks. Features over 85 rides, games, and attractions including the classic Yankee Cannonball roller coaster (1936), a vintage carousel, and a wave pool. Strong nostalgia factor. Skip if you're short on time — this is a full-day destination.",
    highlights: ["Yankee Cannonball (1936 coaster)", "Vintage carousel", "85+ rides", "Wave pool", "Evening fireworks (select nights)"],
    cost: "$$$",
    visitDuration: "Full day",
    bestTime: "Weekday (smaller crowds)",
    address: "85 N Policy St, Salem, NH 03079",
    contact: "canobie.com",
    dogFriendly: false,
    accessible: true,
    yearRound: false,
    seasonalNote: "Open May–October; weekends only in fall",
    rating: 4,
    reviewCount: 12453,
  },
  {
    id: "rs-robert-frost",
    name: "Robert Frost Farm State Historic Site",
    category: "historic",
    coords: { lat: 42.9356, lng: -71.3728 },
    legId: "leg-1",
    detourMinutes: 18,
    detourMiles: 9,
    tagline: "Poet's home — 'The Road Not Taken' was written here",
    description: "The Robert Frost Farm (1900–1911) is where Frost wrote many of his most famous poems including 'The Road Not Taken' and 'Mending Wall.' The white clapboard farmhouse and 30-acre grounds are preserved as they were during Frost's residency. Guided tours available. A literary pilgrimage for poetry lovers.",
    highlights: ["Frost's actual writing desk", 'Where "The Road Not Taken" was written', "Guided tours", "30-acre grounds", "Literary history"],
    cost: "$5",
    visitDuration: "1 hour",
    bestTime: "Afternoon (tours hourly)",
    address: "122 Rockingham Rd, Derry, NH 03038",
    contact: "nhstateparks.org/robert-frost-farm",
    dogFriendly: false,
    accessible: true,
    yearRound: false,
    seasonalNote: "Open June–October, Wed–Sun",
    rating: 5,
    reviewCount: 342,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEG 2: Bear Brook State Park → Pawtuckaway State Park (20 mi, 30m)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "rs-deerfield-fairgrounds",
    name: "Deerfield Fairgrounds",
    category: "oddity",
    coords: { lat: 43.1308, lng: -71.2425 },
    legId: "leg-2",
    detourMinutes: 8,
    detourMiles: 4,
    tagline: "America's oldest family fair (1876)",
    description: "The Deerfield Fair is New England's oldest and largest family fair, running since 1876. Outside of fair week (late September), the grounds are open for walking. The fair features agricultural exhibits, ox pulls, demolition derbies, and the Giant Pumpkin Weigh-off (1,000+ lb pumpkins). Even off-season, the historic grounds are worth a photo stop.",
    highlights: ["Oldest family fair in America", "Giant pumpkin weigh-off", "Ox pulls", "Demolition derby", "Off-season grounds walkable"],
    cost: "Free (off-season)",
    visitDuration: "20 min (off-season) / Full day (fair week)",
    bestTime: "Late September (fair week)",
    address: "34 Stage Rd, Deerfield, NH 03037",
    contact: "deerfieldfair.com",
    dogFriendly: false,
    accessible: true,
    yearRound: true,
    rating: 5,
    reviewCount: 2103,
  },
  {
    id: "rs-pawtuckaway-boulder",
    name: "Pawtuckaway Boulder Field",
    category: "nature",
    coords: { lat: 43.0892, lng: -71.1989 },
    legId: "leg-2",
    detourMinutes: 5,
    detourMiles: 2,
    tagline: "Glacial boulder field — bouldering & climbing",
    description: "A massive field of glacial erratics — house-sized boulders deposited by retreating glaciers 12,000 years ago. Popular with rock climbers (dozens of established routes) and boulderers. The largest boulders have names like 'The Tooth' and 'Slab.' Excellent for scrambling and photography. Part of Pawtuckaway State Park.",
    highlights: ["House-sized glacial boulders", "Established climbing routes", "Bouldering problems", "Glacial geology", "Photography"],
    cost: "$4 (parking)",
    visitDuration: "1 hour",
    bestTime: "Morning (cool for climbing)",
    address: "Pawtuckaway State Park, Nottingham, NH",
    dogFriendly: true,
    accessible: false,
    yearRound: true,
    rating: 4,
    reviewCount: 287,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEG 3: Pawtuckaway → Lincoln, NH Rail Platform (85 mi, 1h 20m)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "rs-antique-alley",
    name: "Antique Alley (Route 4)",
    category: "shopping",
    coords: { lat: 43.2015, lng: -71.4089 },
    legId: "leg-3",
    detourMinutes: 10,
    detourMiles: 5,
    tagline: "NH's famous antique corridor — 20+ shops",
    description: "Route 4 between Northwood and Epsom is known as 'Antique Alley' — over 20 antique shops in a 10-mile stretch. Everything from high-end period furniture to quirky collectibles. Highlights include the Northwood Antique Center (multi-dealer) and the Broken Arrow (vintage tools). A browsers' paradise; set a budget before you stop.",
    highlights: ["20+ antique shops", "Multi-dealer centers", "Period furniture", "Vintage tools", "Collectibles"],
    cost: "Free to browse",
    visitDuration: "1–2 hours",
    bestTime: "Weekday (fewer crowds)",
    address: "Route 4, Northwood/Epsom, NH",
    dogFriendly: false,
    accessible: true,
    yearRound: true,
    rating: 4,
    reviewCount: 567,
  },
  {
    id: "rs-mt-kearsarge",
    name: "Mount Kearsarge Auto Road",
    category: "viewpoint",
    coords: { lat: 43.3711, lng: -71.5589 },
    legId: "leg-3",
    detourMinutes: 20,
    detourMiles: 12,
    tagline: "Drive-to summit — 360° White Mountain views",
    description: "The auto road to the summit of Mount Kearsarge (2,937 ft) is one of the few drive-up mountain summits in New Hampshire. The 3.5-mile paved road climbs through hardwood forest to a parking area with a short walk to the fire tower. Views encompass the White Mountains, Lakes Region, and Mount Monadnock. Picnic tables at the summit.",
    highlights: ["Drive-to summit", "Fire tower views", "360° panoramas", "Picnic area", "Short walk from parking"],
    cost: "$5",
    visitDuration: "1 hour",
    bestTime: "Morning (clear views)",
    address: "Winslow State Park, Wilmot, NH",
    contact: "nhstateparks.org/winslow",
    dogFriendly: true,
    accessible: true,
    yearRound: false,
    seasonalNote: "Auto road open May–October",
    rating: 5,
    reviewCount: 421,
  },
  {
    id: "rs-sunapee-state",
    name: "Mount Sunapee State Park Beach",
    category: "nature",
    coords: { lat: 43.3178, lng: -72.0845 },
    legId: "leg-3",
    detourMinutes: 15,
    detourMiles: 10,
    tagline: "Lake Sunapee beach — swimming & picnic",
    description: "A sandy beach on the shores of Lake Sunapee, one of NH's cleanest lakes. Swimming, picnicking, and boat rentals. The beach has a bathhouse, concession stand, and shaded picnic tables. Mount Sunapee rises dramatically behind the lake. A perfect mid-drive swim stop in summer.",
    highlights: ["Sandy beach", "Clean lake swimming", "Boat rentals", "Picnic area", "Mountain backdrop"],
    cost: "$5",
    visitDuration: "1–2 hours",
    bestTime: "Afternoon (warmest water)",
    address: "86 Beach Access Rd, Newbury, NH 03255",
    contact: "nhstateparks.org/mount-sunapee",
    dogFriendly: false,
    accessible: true,
    yearRound: false,
    seasonalNote: "Beach open mid-June–Labor Day",
    rating: 4,
    reviewCount: 689,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEG 4: Lincoln, NH → Dixville Notch (75 mi, 1h 30m)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "rs-whaleback",
    name: "Whaleback Mountain",
    category: "viewpoint",
    coords: { lat: 44.2456, lng: -71.6892 },
    legId: "leg-4",
    detourMinutes: 8,
    detourMiles: 3,
    tagline: "Short hike — 360° notch views",
    description: "Whaleback (2,520 ft) is a short but steep hike (0.4 mi) offering spectacular views of Franconia Notch and the Pemigewasset Valley. The summit has a historic fire tower foundation. Best combined with a Franconia Notch visit. Park at the trailhead on Route 18.",
    highlights: ["Short 0.4-mi hike", "360° notch views", "Fire tower foundation", "Franconia views", "Quick stop"],
    cost: "Free",
    visitDuration: "45 min",
    bestTime: "Morning (cool for hiking)",
    address: "Route 18, Lincoln, NH",
    dogFriendly: true,
    accessible: false,
    yearRound: true,
    rating: 4,
    reviewCount: 234,
  },
  {
    id: "rs-pollys-pancake",
    name: "Polly's Pancake Parlor",
    category: "dining",
    coords: { lat: 44.3017, lng: -71.6834 },
    legId: "leg-4",
    detourMinutes: 12,
    detourMiles: 6,
    tagline: "NH institution since 1938 — maple pancakes",
    description: "Polly's Pancake Parlor has been serving pancakes since 1938 using the same recipes. They grind their own flour, make their own maple syrup on-site, and offer three types of pancakes: regular, whole wheat, and buckwheat. The view from the dining room overlooks the White Mountains. Expect a wait on weekends — worth it.",
    highlights: ["Since 1938", "House-ground flour", "On-site maple syrup", "Mountain view dining", "Three pancake types"],
    cost: "$$",
    visitDuration: "1 hour (including wait)",
    bestTime: "Weekday morning",
    address: "672 Route 117, Sugar Hill, NH 03586",
    contact: "pollyspancakeparlor.com",
    dogFriendly: false,
    accessible: true,
    yearRound: false,
    seasonalNote: "Open Mar–Oct",
    rating: 5,
    reviewCount: 4521,
  },
  {
    id: "rs-sugar-hill-sunflowers",
    name: "Sugar Hill Sunflower Fields",
    category: "scenic",
    coords: { lat: 44.2956, lng: -71.6912 },
    legId: "leg-4",
    detourMinutes: 10,
    detourMiles: 5,
    tagline: "Fields of sunflowers — late summer bloom",
    description: "In late July through August, fields of sunflowers bloom across Sugar Hill, creating spectacular photo opportunities against the White Mountain backdrop. The best fields are along Route 117. Peak bloom is typically the first two weeks of August — perfectly timed for the trip. Free to view and photograph.",
    highlights: ["Peak bloom early August", "White Mountain backdrop", "Photography paradise", "Free to view", "Multiple fields"],
    cost: "Free",
    visitDuration: "30 min",
    bestTime: "Golden hour (sunset)",
    address: "Route 117, Sugar Hill, NH",
    yearRound: false,
    seasonalNote: "Peak bloom: late July–mid August",
    rating: 5,
    reviewCount: 892,
  },
  {
    id: "rs-littleton-diner",
    name: "Littleton Diner",
    category: "dining",
    coords: { lat: 44.3069, lng: -71.7678 },
    legId: "leg-4",
    detourMinutes: 5,
    detourMiles: 2,
    tagline: "Classic 1930s diner — featured on Food Network",
    description: "A classic stainless-steel diner car (1930) featured on Food Network's 'Diners, Drive-Ins and Dives.' Known for their pancakes, pies, and the 'LD Special' breakfast. The original 16-stool counter is still in use. A quintessential New England diner experience. Cash only.",
    highlights: ["1930 diner car", "Food Network featured", '16-stool counter', "Fresh pies daily", "Cash only"],
    cost: "$",
    visitDuration: "45 min",
    bestTime: "Early morning (avoid wait)",
    address: "90 Main St, Littleton, NH 03561",
    contact: "603-444-3994",
    dogFriendly: false,
    accessible: true,
    yearRound: true,
    rating: 5,
    reviewCount: 1876,
  },
  {
    id: "rs-stonepipe",
    name: "Stone Barn Brewing",
    category: "dining",
    coords: { lat: 44.5656, lng: -71.5823 },
    legId: "leg-4",
    detourMinutes: 15,
    detourMiles: 8,
    tagline: "Farm brewery — mountain-view taproom",
    description: "A small farm brewery set in a converted stone barn with stunning mountain views. Specializes in farmhouse ales and saisons brewed with locally grown hops. The taproom has a fireplace and outdoor seating. Food trucks on weekends. A perfect stop after the proposal celebration.",
    highlights: ["Converted stone barn", "Mountain-view taproom", "Farmhouse ales", "Fireplace", "Weekend food trucks"],
    cost: "$$",
    visitDuration: "1 hour",
    bestTime: "Afternoon",
    address: "592 Route 3, Whitefield, NH 03598",
    contact: "stonepipebrewing.com",
    dogFriendly: true,
    accessible: true,
    yearRound: true,
    rating: 4,
    reviewCount: 342,
  },
  {
    id: "rs-bethlehem-blubber",
    name: "The Blubber Bubble",
    category: "oddity",
    coords: { lat: 44.2798, lng: -71.6878 },
    legId: "leg-4",
    detourMinutes: 5,
    detourMiles: 2,
    tagline: "World's largest bubble gum bubble photo op",
    description: "A quirky roadside sculpture in Bethlehem — a giant pink bubble gum bubble statue. Part of the town's 'Gum Wall' tradition where visitors leave chewed gum on the wall (like Seattle's). A fun 5-minute photo stop. The town of Bethlehem itself has a cute Main Street with shops.",
    highlights: ['Giant bubble sculpture', "Gum wall tradition", "Quirky photo op", "Cute Main Street", "5-min stop"],
    cost: "Free",
    visitDuration: "10 min",
    bestTime: "Anytime",
    address: "Main St, Bethlehem, NH 03574",
    dogFriendly: true,
    accessible: true,
    yearRound: true,
    rating: 3,
    reviewCount: 87,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEG 5: Dixville Notch → Coleman State Park (12 mi, 20m)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "rs-balsams-golf",
    name: "The Balsams Golf Course",
    category: "scenic",
    coords: { lat: 44.8689, lng: -71.3201 },
    legId: "leg-5",
    detourMinutes: 3,
    detourMiles: 1,
    tagline: "Historic 18-hole course — panoramic mountain views",
    description: "The Balsams Wilderness Golf Course is a Donald Ross-designed 18-hole course (1912) with panoramic mountain views from every hole. Even if you don't golf, the course is walkable and the views are spectacular. The historic Balsams Grand Resort (recently renovated) offers dining and a pro shop.",
    highlights: ["Donald Ross design (1912)", "Mountain views from every hole", "Historic resort", "Walkable course", "Pro shop"],
    cost: "$$$ (golf) / Free (walk)",
    visitDuration: "30 min (walk) / 4 hours (golf)",
    bestTime: "Morning",
    address: "859 Route 26, Dixville, NH 03576",
    contact: "thebalsamsresort.com",
    dogFriendly: false,
    accessible: true,
    yearRound: false,
    seasonalNote: "Golf: May–October",
    rating: 5,
    reviewCount: 234,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEG 6: Coleman State Park → Central MA Home (212 mi, 3h 50m)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "rs-colebrook-moose",
    name: "Colebrook Moose Alley",
    category: "nature",
    coords: { lat: 44.8934, lng: -71.4989 },
    legId: "leg-6",
    detourMinutes: 5,
    detourMiles: 3,
    tagline: "Best moose-spotting road in NH",
    description: "Route 3 between Colebrook and Pittsburg is known as 'Moose Alley' — the highest moose population density in the lower 48 states. Best viewed at dawn or dusk. Drive slowly and keep eyes on both sides of the road. There are several pull-offs for safe viewing. A NH Fish & Game moose sighting guide is available.",
    highlights: ["Highest moose density in lower 48", "Dawn/dusk viewing", "Safe pull-offs", "Route 3 corridor", "Wildlife photography"],
    cost: "Free",
    visitDuration: "45 min",
    bestTime: "Dawn or dusk",
    address: "Route 3, Colebrook to Pittsburg, NH",
    yearRound: true,
    rating: 5,
    reviewCount: 567,
  },
  {
    id: "rs-lancaster-fair",
    name: "Lancaster Fairgrounds",
    category: "oddity",
    coords: { lat: 44.4889, lng: -71.5678 },
    legId: "leg-6",
    detourMinutes: 8,
    detourMiles: 4,
    tagline: "Oldest agricultural fair in NH (1871)",
    description: "The Lancaster Fair (since 1871) is held annually Labor Day weekend. The grounds feature a historic grandstand, agricultural exhibits, and harness racing. Outside of fair weekend, the grounds are walkable and the grandstand is visible from Route 3. A piece of NH agricultural history.",
    highlights: ["Since 1871", "Harness racing", "Historic grandstand", "Agricultural exhibits", "Labor Day weekend"],
    cost: "Free (off-season)",
    visitDuration: "15 min (off-season)",
    bestTime: "Labor Day weekend (fair)",
    address: "59 Fairground Rd, Lancaster, NH 03584",
    dogFriendly: true,
    accessible: true,
    yearRound: true,
    rating: 4,
    reviewCount: 156,
  },
  {
    id: "rs-franconia-notch-park",
    name: "Franconia Notch State Park Headquarters",
    category: "historic",
    coords: { lat: 44.1072, lng: -71.6798 },
    legId: "leg-6",
    detourMinutes: 5,
    detourMiles: 2,
    tagline: "Visitor center — park info & Old Man exhibit",
    description: "The Franconia Notch State Park visitor center has exhibits on the Old Man of the Mountain (which collapsed in 2003), the geology of the notch, and local wildlife. Restrooms, trail maps, and park rangers. A good first stop when entering the notch to plan your visit.",
    highlights: ["Old Man exhibit", "Geology displays", "Trail maps", "Ranger station", "Restrooms"],
    cost: "Free",
    visitDuration: "20 min",
    bestTime: "Morning (plan day)",
    address: "I-93, Franconia Notch, NH",
    contact: "franconianotch.org",
    dogFriendly: false,
    accessible: true,
    yearRound: true,
    rating: 4,
    reviewCount: 234,
  },
  {
    id: "rs-woodstock-brewery",
    name: "Woodstock Inn Brewery",
    category: "dining",
    coords: { lat: 44.0389, lng: -71.6767 },
    legId: "leg-6",
    detourMinutes: 3,
    detourMiles: 1,
    tagline: "Brewpub in a 1800s inn — Pemi Pale Ale",
    description: "The Woodstock Inn Brewery (est. 1995) is housed in a 19th-century inn in North Woodstock. Known for their Pemi Pale Ale and Red Rack Amber Ale. The pub serves classic New England fare (burgers, wings, mac & cheese). Live music on weekends. A perfect lunch stop on the drive home.",
    highlights: ["Since 1995", "Pemi Pale Ale", "1800s inn setting", "Classic pub fare", "Weekend live music"],
    cost: "$$",
    visitDuration: "1 hour",
    bestTime: "Lunch",
    address: "135 Main St, North Woodstock, NH 03262",
    contact: "woodstockinnbrewery.com",
    dogFriendly: false,
    accessible: true,
    yearRound: true,
    rating: 4,
    reviewCount: 2103,
  },
  {
    id: "rs-loon-mountain",
    name: "Loon Mountain Gondola Skyride",
    category: "viewpoint",
    coords: { lat: 44.0478, lng: -71.6434 },
    legId: "leg-6",
    detourMinutes: 8,
    detourMiles: 4,
    tagline: "Scenic gondola to 3,065 ft summit",
    description: "Take the gondola to the summit of Loon Mountain (3,065 ft) for panoramic White Mountain views. At the summit: an observation tower, glacial caves (short walk), and a summit lodge with food. In winter, Loon is a major ski resort. The gondola runs daily in summer/fall.",
    highlights: ["Gondola to summit", "Observation tower", "Glacial caves", "Summit lodge", "360° White Mountain views"],
    cost: "$$",
    visitDuration: "1.5 hours",
    bestTime: "Morning (clear views)",
    address: "60 Loon Mountain Rd, Lincoln, NH 03251",
    contact: "loonmtn.com",
    dogFriendly: true,
    accessible: true,
    yearRound: false,
    seasonalNote: "Gondola: late May–mid October",
    rating: 4,
    reviewCount: 1234,
  },
  {
    id: "rs-waterville-valley",
    name: "Waterville Valley Resort",
    category: "viewpoint",
    coords: { lat: 43.9506, lng: -71.4989 },
    legId: "leg-6",
    detourMinutes: 18,
    detourMiles: 10,
    tagline: "Mountain resort town — gondola & trails",
    description: "Waterville Valley is a planned mountain resort community surrounded by the White Mountain National Forest. The ski area offers summer gondola rides to the summit (3,940 ft) with hiking trails and views. The town has shops, restaurants, and a recreational path around Corcoran Pond.",
    highlights: ["Summer gondola rides", "Summit hiking trails", "Mountain town", "Recreation path", "Shops & dining"],
    cost: "$$",
    visitDuration: "2 hours",
    bestTime: "Morning",
    address: "1 Valley Rd, Waterville Valley, NH 03215",
    contact: "waterville.com",
    dogFriendly: true,
    accessible: true,
    yearRound: true,
    rating: 4,
    reviewCount: 567,
  },
];

/**
 * Haversine distance between two coords (in miles).
 */
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate driving time from straight-line distance.
 * Average detour factor ~1.3, average speed ~45 mph on NH roads.
 */
export function estimateDriveMinutes(miles: number): number {
  return Math.round((miles * 1.3) / 45 * 60);
}

/**
 * Get attractions within a given detour time from the route.
 * Lower detour = higher priority (sorted ascending).
 */
export function getAttractionsWithinDetour(
  maxDetourMinutes: number = 20
): RoadsideAttraction[] {
  return ROADSIDE_ATTRACTIONS.filter((a) => a.detourMinutes <= maxDetourMinutes).sort(
    (a, b) => a.detourMinutes - b.detourMinutes
  );
}

/**
 * Get attractions for a specific drive leg.
 */
export function getAttractionsForLeg(
  legId: string,
  maxDetourMinutes: number = 20
): RoadsideAttraction[] {
  return ROADSIDE_ATTRACTIONS.filter(
    (a) => a.legId === legId && a.detourMinutes <= maxDetourMinutes
  ).sort((a, b) => a.detourMinutes - b.detourMinutes);
}

/**
 * Get attractions near a specific point (within radius in miles).
 */
export function getAttractionsNearPoint(
  lat: number,
  lng: number,
  radiusMiles: number = 15
): RoadsideAttraction[] {
  return ROADSIDE_ATTRACTIONS.filter((a) => {
    const dist = haversineMiles(lat, lng, a.coords.lat, a.coords.lng);
    return dist <= radiusMiles;
  })
    .map((a) => ({
      ...a,
      // Add computed distance for display
      detourMiles: Math.round(haversineMiles(lat, lng, a.coords.lat, a.coords.lng) * 10) / 10,
    }))
    .sort((a, b) => a.detourMiles - b.detourMiles);
}

/**
 * Get the total count of road-side attractions (≤ 20 min detour).
 */
export function getRoadsideCount(): number {
  return ROADSIDE_ATTRACTIONS.filter((a) => a.detourMinutes <= 20).length;
}

/**
 * Category metadata for display.
 */
export const CATEGORY_META: Record<
  RoadsideAttraction["category"],
  { emoji: string; color: string; label: string }
> = {
  scenic: { emoji: "📸", color: "#d97706", label: "Scenic" },
  historic: { emoji: "🏛️", color: "#92400e", label: "Historic" },
  dining: { emoji: "🍽️", color: "#dc2626", label: "Dining" },
  oddity: { emoji: "🎭", color: "#7c3aed", label: "Quirky" },
  nature: { emoji: "🌿", color: "#16a34a", label: "Nature" },
  shopping: { emoji: "🛍️", color: "#0891b2", label: "Shopping" },
  viewpoint: { emoji: "⛰️", color: "#0284c7", label: "Viewpoint" },
};
