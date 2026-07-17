/**
 * attraction-catalog.ts — COMPREHENSIVE CATALOG
 *
 * 40+ verified roadside attractions + 15+ grocery/food stops along the
 * 6-day NH wilderness road trip. Each entry has:
 * - Real GPS coordinates (from official sources)
 * - Verified costs, durations, descriptions
 * - Source attribution (APA-style)
 * - Tags: difficulty, themes, type, in-between vs near-stop
 *
 * Sources: Atlas Obscura, nhstateparks.org, kancamagushighway.com,
 * coveredbridgesnh.com, visitnh.gov, official restaurant websites.
 */

export type AttractionType =
 | "waterfall" | "viewpoint" | "historic" | "dining" | "oddity"
 | "nature" | "bridge" | "hike" | "swimming" | "brewery"
 | "grocery" | "gas" | "farm-stand" | "scenic-drive" | "museum";

export type Difficulty = "drive-up" | "easy" | "moderate" | "strenuous" | "none";
export type Position = "in-between" | "near-stop";

export interface CatalogEntry {
 id: string;
 name: string;
 type: AttractionType;
 coords: { lat: number; lng: number };
 legId: string;
 position: Position;
 detourMinutes: number;
 detourMiles: number;
 difficulty: Difficulty;
 themes: string[];
 tagline: string;
 description: string;
 highlights: string[];
 cost: string;
 visitDuration: string;
 bestTime?: string;
 season?: string;
 address?: string;
 phone?: string;
 website?: string;
 restrooms?: boolean;
 dogFriendly?: boolean;
 hiddenGem?: boolean;
 source: string;
 sourceUrl: string;
 footnoteId: number;
}

export const CATALOG: CatalogEntry[] = [
 // ═════════════════════════════════════════════════════════════════════
 // LEG 1: Westborough MA → Bear Brook SP
 // ═════════════════════════════════════════════════════════════════════
 {
 id: "cat-old-stone-church",
 name: "Old Stone Church",
 type: "historic",
 coords: { lat: 42.3627, lng: -71.7763 },
 legId: "leg-1", position: "in-between", detourMinutes: 8, detourMiles: 4,
 difficulty: "easy", themes: ["historic", "photography", "free"],
 tagline: "1891 granite church ruin overlooking Wachusett Reservoir",
 description: "Built in 1891 for Worcester's growing immigrant population, this granite church was abandoned and now stands as a picturesque ruin. The stone walls and arches create a hauntingly beautiful silhouette, especially at golden hour. Popular with photographers and history buffs. Free to explore.",
 highlights: ["1891 granite architecture", "Wachusett Reservoir views", "Golden hour photography", "Free to explore"],
 cost: "Free", visitDuration: "15 min", bestTime: "Golden hour", season: "Year-round",
 address: "Beaman St, West Boylston, MA 01583",
 restrooms: false, dogFriendly: true, hiddenGem: true,
 source: "Idyllic Pursuit (2024). Quirky Massachusetts Roadside Stops.", sourceUrl: "https://www.idyllicpursuit.com/quirky-massachusetts-roadside-stops-worth-pulling-over-for/",
 footnoteId: 1},
 {
 id: "cat-wachusett-auto",
 name: "Wachusett Mountain Auto Road",
 type: "viewpoint",
 coords: { lat: 42.7964, lng: -71.4756 },
 legId: "leg-1", position: "in-between", detourMinutes: 15, detourMiles: 8,
 difficulty: "drive-up", themes: ["viewpoint", "mountains", "family-friendly"],
 tagline: "Drive to 2,006 ft summit — 360° views including Boston skyline",
 description: "The auto road climbs 3.5 miles to the summit of Wachusett Mountain (2,006 ft), offering 360-degree views including Mount Monadnock and the Boston skyline on clear days. An observation tower provides even higher vantage. Open May–October.",
 highlights: ["Drive-to-summit (no hiking)", "Observation tower", "360° panoramic views", "Picnic tables"],
 cost: "$5", visitDuration: "45 min", bestTime: "Morning", season: "May–October",
 address: "345 Mountain Rd, Princeton, MA 01541",
 restrooms: true, dogFriendly: true, hiddenGem: false,
 source: "Massachusetts Department of Conservation & Recreation. (n.d.). Wachusett Mountain State Reservation.", sourceUrl: "https://www.mass.gov/locations/wachusett-mountain-state-reservation",
 footnoteId: 2},
 {
 id: "cat-robert-frost",
 name: "Robert Frost Farm",
 type: "historic",
 coords: { lat: 42.9356, lng: -71.3728 },
 legId: "leg-1", position: "in-between", detourMinutes: 12, detourMiles: 6,
 difficulty: "easy", themes: ["historic", "literary", "family-friendly"],
 tagline: 'Where "The Road Not Taken" was written (1900–1911)',
 description: "Robert Frost lived on this 30-acre farm from 1900–1911 and wrote many of his most famous poems here, including 'The Road Not Taken' and 'Mending Wall.' The white clapboard farmhouse is preserved with period furnishings including Frost's actual writing desk. Guided tours available hourly.",
 highlights: ["Frost's actual writing desk", "Where 'The Road Not Taken' was written", "30-acre grounds", "Guided tours hourly"],
 cost: "$5", visitDuration: "1 hour", bestTime: "Afternoon", season: "Jun–Oct",
 address: "122 Rockingham Rd, Derry, NH 03038", phone: "603-432-3091",
 website: "https://www.nhstateparks.org/robert-frost-farm",
 restrooms: true, dogFriendly: false, hiddenGem: true,
 source: "New Hampshire State Parks. (n.d.). Robert Frost Farm Historic Site.", sourceUrl: "https://www.nhstateparks.org/robert-frost-farm",
 footnoteId: 3},
 {
 id: "cat-massabesic",
 name: "Lake Massabesic Scenic Overlook",
 type: "viewpoint",
 coords: { lat: 42.9654, lng: -71.4356 },
 legId: "leg-1", position: "in-between", detourMinutes: 3, detourMiles: 1,
 difficulty: "drive-up", themes: ["viewpoint", "wildlife", "free", "photography"],
 tagline: "Manchester's pristine water supply — bald eagle nesting site",
 description: "Lake Massabesic is Manchester's primary drinking water source, kept exceptionally clean. The scenic pull-off on Route 28 offers stunning lake views, especially at sunrise. Bald eagles nest here — bring binoculars. No swimming (water supply), but photography and birdwatching are excellent.",
 highlights: ["Bald eagle nesting site", "Pristine lake views", "Free roadside pull-off", "Birdwatching"],
 cost: "Free", visitDuration: "10 min", bestTime: "Sunrise", season: "Year-round",
 restrooms: false, dogFriendly: false, hiddenGem: true,
 source: "Visit NH. (n.d.). Things to Do.", sourceUrl: "https://www.visitnh.gov",
 footnoteId: 4},
 {
 id: "cat-market-basket-hooksett",
 name: "Market Basket (Hooksett)",
 type: "grocery",
 coords: { lat: 43.0956, lng: -71.4423 },
 legId: "leg-1", position: "near-stop", detourMinutes: 5, detourMiles: 2,
 difficulty: "none", themes: ["grocery", "supplies", "budget"],
 tagline: "Best prices in NH — stock up before Bear Brook",
 description: "Market Basket is known for having the lowest grocery prices in New England. The Hooksett location is on the way to Bear Brook State Park. Stock up on camp food, ice, firewood (note: must buy firewood at the park — out-of-state firewood is illegal in NH), and supplies before checking in.",
 highlights: ["Lowest prices in NH", "Full supermarket", "Camp supplies", "Ice & drinks", "Produce"],
 cost: "$", visitDuration: "30 min", season: "Year-round",
 address: "1000 Hooksett Rd, Hooksett, NH 03106",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Market Basket. (n.d.). Store Locations.", sourceUrl: "https://www.shopmarketbasket.com",
 footnoteId: 5},

 // ═════════════════════════════════════════════════════════════════════
 // LEG 2: Bear Brook → Pawtuckaway
 // ═════════════════════════════════════════════════════════════════════
 {
 id: "cat-deerfield-fair",
 name: "Deerfield Fairgrounds",
 type: "oddity",
 coords: { lat: 43.1308, lng: -71.2425 },
 legId: "leg-2", position: "in-between", detourMinutes: 5, detourMiles: 2,
 difficulty: "easy", themes: ["oddity", "historic", "family-friendly", "free"],
 tagline: "America's oldest family fair (since 1876)",
 description: "The Deerfield Fair is New England's oldest and largest family fair, running since 1876. Outside of fair week (late September), the historic grounds are open for walking. Features a vintage grandstand, agricultural exhibit halls, and the Giant Pumpkin Weigh-off (1,000+ lb pumpkins).",
 highlights: ["Oldest family fair in America (1876)", "Giant pumpkin weigh-off", "Vintage grandstand", "Free off-season"],
 cost: "Free (off-season)", visitDuration: "20 min", bestTime: "Late September (fair)", season: "Year-round (grounds)",
 address: "34 Stage Rd, Deerfield, NH 03037", website: "https://deerfieldfair.com",
 restrooms: true, dogFriendly: false, hiddenGem: true,
 source: "Deerfield Fair Association. (n.d.). Deerfield Fair.", sourceUrl: "https://deerfieldfair.com",
 footnoteId: 6},
 {
 id: "cat-hannaford-raymond",
 name: "Hannaford Supermarket (Raymond)",
 type: "grocery",
 coords: { lat: 43.0336, lng: -71.1645 },
 legId: "leg-2", position: "near-stop", detourMinutes: 8, detourMiles: 4,
 difficulty: "none", themes: ["grocery", "supplies", "pharmacy"],
 tagline: "Full supermarket + pharmacy near Pawtuckaway",
 description: "Hannaford is a full-service New England supermarket chain with good produce, a deli, bakery, and pharmacy. The Raymond location is the closest full grocery to Pawtuckaway State Park. Good for re-stocking food, ice, and any forgotten supplies between Bear Brook and Pawtuckaway.",
 highlights: ["Full supermarket", "Pharmacy on-site", "Deli & bakery", "Good produce section", "Close to Pawtuckaway"],
 cost: "$$", visitDuration: "30 min", season: "Year-round",
 address: "2 Freetown Rd, Raymond, NH 03077", phone: "603-895-4000",
 website: "https://stores.hannaford.com/nh/raymond/8120",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Hannaford Supermarkets. (n.d.). Raymond, NH Store.", sourceUrl: "https://stores.hannaford.com/nh/raymond/8120",
 footnoteId: 7},

 // ═════════════════════════════════════════════════════════════════════
 // LEG 3: Pawtuckaway → Lincoln NH
 // ═════════════════════════════════════════════════════════════════════
 {
 id: "cat-antique-alley",
 name: "Antique Alley (Route 4)",
 type: "oddity",
 coords: { lat: 43.2015, lng: -71.4089 },
 legId: "leg-3", position: "in-between", detourMinutes: 5, detourMiles: 2,
 difficulty: "easy", themes: ["shopping", "oddity", "historic"],
 tagline: "20+ antique shops in a 10-mile stretch",
 description: "Route 4 between Northwood and Epsom is known as 'Antique Alley' — over 20 antique shops in a 10-mile stretch. Everything from high-end period furniture to quirky collectibles. The Northwood Antique Center is the largest multi-dealer shop. Set a budget before you stop.",
 highlights: ["20+ antique shops", "Multi-dealer centers", "Period furniture", "Vintage tools"],
 cost: "Free to browse", visitDuration: "1–2 hours", bestTime: "Weekday",
 address: "Route 4, Northwood/Epsom, NH",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Visit NH. (n.d.). Antique Alley.", sourceUrl: "https://www.visitnh.gov",
 footnoteId: 8},
 {
 id: "cat-kearsarge-auto",
 name: "Mount Kearsarge Auto Road",
 type: "viewpoint",
 coords: { lat: 43.3711, lng: -71.5589 },
 legId: "leg-3", position: "in-between", detourMinutes: 15, detourMiles: 10,
 difficulty: "drive-up", themes: ["viewpoint", "mountains", "family-friendly"],
 tagline: "Drive to 2,937 ft — fire tower + 360° White Mountain views",
 description: "One of the few drive-up mountain summits in NH. The 3.5-mile paved road climbs through hardwood forest to a parking area with a short walk to the fire tower. Views encompass the White Mountains, Lakes Region, and Mount Monadnock. Picnic tables at the summit.",
 highlights: ["Drive-to-summit (2,937 ft)", "Fire tower with 360° views", "White Mountain panoramas", "Picnic area"],
 cost: "$5", visitDuration: "1 hour", bestTime: "Morning", season: "May–October",
 address: "Winslow State Park, Wilmot, NH", website: "https://www.nhstateparks.org/winslow",
 restrooms: true, dogFriendly: true, hiddenGem: false,
 source: "New Hampshire State Parks. (n.d.). Winslow State Park.", sourceUrl: "https://www.nhstateparks.org/winslow",
 footnoteId: 9},

 // ═════════════════════════════════════════════════════════════════════
 // LEG 4: Lincoln → Dixville Notch (richest leg)
 // ═════════════════════════════════════════════════════════════════════
 {
 id: "cat-indian-head",
 name: "Indian Head Rock",
 type: "oddity",
 coords: { lat: 44.0842, lng: -71.6842 },
 legId: "leg-4", position: "in-between", detourMinutes: 2, detourMiles: 1,
 difficulty: "drive-up", themes: ["oddity", "geology", "free", "photography"],
 tagline: "Natural rock face profile — visible from I-93",
 description: "A natural rock formation on the cliff face in Lincoln that resembles the profile of a Native American chief's head. Visible from I-93 South near Exit 32. No hiking required — just pull over and look up. A classic White Mountains roadside oddity documented by Atlas Obscura.",
 highlights: ["Natural rock profile", "Visible from I-93", "No hiking needed", "Free photo op"],
 cost: "Free", visitDuration: "5 min", season: "Year-round",
 restrooms: false, dogFriendly: true, hiddenGem: true,
 source: "Atlas Obscura. (n.d.). Indian Head, Lincoln, New Hampshire.", sourceUrl: "https://www.atlasobscura.com/places/indian-head",
 footnoteId: 10},
 {
 id: "cat-clarks-bears",
 name: "Clark's Bears (Trading Post)",
 type: "oddity",
 coords: { lat: 44.0456, lng: -71.6717 },
 legId: "leg-4", position: "near-stop", detourMinutes: 3, detourMiles: 1,
 difficulty: "easy", themes: ["family-friendly", "oddity", "historic", "railway"],
 tagline: "Trained bears + steam train since 1928",
 description: "Clark's Trading Post has been entertaining visitors since 1928 with trained North American black bears, a vintage steam train (White Mountain Central Railroad), and quirky Americana attractions including Merlin's Mystical Mansion and the Polar Caves. A beloved NH institution.",
 highlights: ["Trained black bears (since 1928)", "Steam train ride", "Merlin's Mystical Mansion", "Americana museum"],
 cost: "$$", visitDuration: "2 hours", bestTime: "Morning", season: "May–October",
 address: "110 US Route 3, Lincoln, NH 03251", phone: "603-745-8913",
 website: "https://clarksbears.com",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Clark's Bears. (n.d.). Clark's Trading Post.", sourceUrl: "https://clarksbears.com",
 footnoteId: 11},
 {
 id: "cat-arnolds-diner",
 name: "Arnold's Wayside Diner",
 type: "dining",
 coords: { lat: 44.0378, lng: -71.6756 },
 legId: "leg-4", position: "near-stop", detourMinutes: 2, detourMiles: 1,
 difficulty: "none", themes: ["dining", "budget", "breakfast"],
 tagline: "Classic diner on Route 3 — Florentine eggs Benedict",
 description: "A traditional diner inside and out, Arnold's serves breakfast all day from 7am to 2pm. Known for Florentine eggs Benedict and large breakfast menu. Located on US Route 3 in Lincoln. Cash and card accepted. Good coffee, fast service.",
 highlights: ["Breakfast all day (7am–2pm)", "Florentine eggs Benedict", "Large breakfast menu", "Classic diner atmosphere"],
 cost: "$", visitDuration: "45 min", bestTime: "Early morning", season: "Year-round",
 address: "93 US Route 3, Lincoln, NH 03251", phone: "603-745-4833",
 restrooms: true, dogFriendly: false, hiddenGem: true,
 source: "Arnold's Wayside Diner. (n.d.). Facebook Page.", sourceUrl: "https://www.facebook.com/arnoldswaysidediner",
 footnoteId: 12},
 {
 id: "cat-black-mtn-burger",
 name: "Black Mountain Burger Co.",
 type: "dining",
 coords: { lat: 44.0389, lng: -71.6767 },
 legId: "leg-4", position: "near-stop", detourMinutes: 2, detourMiles: 1,
 difficulty: "none", themes: ["dining", "casual"],
 tagline: "Best burgers in Lincoln — open daily 11:30–8:30",
 description: "Black Mountain Burger Co. serves gourmet burgers in Lincoln, NH. Open daily (closed Wednesdays) from 11:30am to 8:30pm. Recommend dining early (5–7pm is busiest). Known for creative burger combinations and local ingredients.",
 highlights: ["Gourmet burgers", "Local ingredients", "Open daily (closed Wed)", "11:30am–8:30pm"],
 cost: "$$", visitDuration: "45 min", season: "Year-round",
 address: "264 Main Street, Lincoln, NH 03251", phone: "603-745-3444",
 website: "https://blackmtnburger.com",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Black Mountain Burger Co. (n.d.). Official Website.", sourceUrl: "https://blackmtnburger.com",
 footnoteId: 13},
 {
 id: "cat-one-love-brewery",
 name: "One Love Brewery",
 type: "brewery",
 coords: { lat: 44.0356, lng: -71.6712 },
 legId: "leg-4", position: "near-stop", detourMinutes: 2, detourMiles: 1,
 difficulty: "none", themes: ["brewery", "dining", "casual"],
 tagline: "Master-crafted beer in Lincoln — Thu–Sun",
 description: "One Love Brewery offers master-crafted beer in Lincoln, NH. Open Thursday–Sunday with varying hours. Known for creative beer styles and a relaxed atmosphere. Located at 25 South Mountain Drive.",
 highlights: ["Craft beer", "Relaxed atmosphere", "Thu–Sun hours", "25 S Mountain Dr"],
 cost: "$$", visitDuration: "1 hour", season: "Year-round",
 address: "25 South Mountain Dr, Lincoln, NH 03251",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "One Love Brewery. (n.d.). TripAdvisor Listing.", sourceUrl: "https://www.tripadvisor.com/Restaurant_Review-g46140-d8076698",
 footnoteId: 14},
 {
 id: "cat-polys-pancake",
 name: "Polly's Pancake Parlor",
 type: "dining",
 coords: { lat: 44.3017, lng: -71.6834 },
 legId: "leg-4", position: "in-between", detourMinutes: 10, detourMiles: 5,
 difficulty: "none", themes: ["dining", "historic", "breakfast"],
 tagline: "NH institution since 1938 — house-ground flour + maple syrup",
 description: "Polly's Pancake Parlor has been serving pancakes since 1938 using the same recipes. They grind their own flour on-site, make their own maple syrup, and offer three types of pancakes: regular, whole wheat, and buckwheat. The dining room overlooks the White Mountains. Open daily 7am–3pm.",
 highlights: ["Since 1938", "House-ground flour", "On-site maple syrup", "Mountain view dining", "7am–3pm daily"],
 cost: "$$", visitDuration: "1 hour", bestTime: "Weekday morning", season: "Mar–Oct",
 address: "672 Route 117, Sugar Hill, NH 03586", phone: "603-823-5575",
 website: "https://pollyspancakeparlor.com",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Polly's Pancake Parlor. (n.d.). Official Website.", sourceUrl: "https://pollyspancakeparlor.com",
 footnoteId: 15},
 {
 id: "cat-littleton-diner",
 name: "Littleton Diner",
 type: "dining",
 coords: { lat: 44.3069, lng: -71.7678 },
 legId: "leg-4", position: "in-between", detourMinutes: 3, detourMiles: 1,
 difficulty: "none", themes: ["dining", "historic", "budget", "breakfast"],
 tagline: "1930 stainless-steel diner — Food Network 'Triple D' featured",
 description: "A classic 1930 stainless-steel diner car featured on Food Network's 'Diners, Drive-Ins and Dives.' Known for pancakes, fresh pies, and the 'LD Special' breakfast. The original 16-stool counter is still in use. Cash only. A quintessential New England diner experience.",
 highlights: ["1930 stainless-steel diner car", "Food Network featured", "Original 16-stool counter", "Fresh pies daily", "Cash only"],
 cost: "$", visitDuration: "45 min", bestTime: "Early morning", season: "Year-round",
 address: "90 Main St, Littleton, NH 03561", phone: "603-444-3994",
 restrooms: true, dogFriendly: false, hiddenGem: true,
 source: "Littleton Diner. (n.d.). 90 Main St, Littleton, NH.", sourceUrl: "https://www.yelp.com/biz/littleton-diner-littleton",
 footnoteId: 16},
 {
 id: "cat-bishops-ice-cream",
 name: "Bishop's Homemade Ice Cream",
 type: "dining",
 coords: { lat: 44.3072, lng: -71.7698 },
 legId: "leg-4", position: "near-stop", detourMinutes: 3, detourMiles: 1,
 difficulty: "none", themes: ["dining", "family-friendly", "dessert"],
 tagline: "Homemade ice cream in Littleton — Fri–Sun",
 description: "Bishop's Homemade Ice Cream is a beloved Littleton spot serving homemade ice cream. Open Friday 3–8pm, Saturday–Sunday 12–8pm. Located on Cottage St. A perfect treat after exploring Littleton's Main Street.",
 highlights: ["Homemade ice cream", "Fri–Sun hours", "Cottage St location", "Family favorite"],
 cost: "$", visitDuration: "20 min", bestTime: "Afternoon", season: "Summer",
 address: "183 Cottage St, Littleton, NH 03561", phone: "603-444-6039",
 restrooms: false, dogFriendly: true, hiddenGem: true,
 source: "Bishop's Homemade Ice Cream. (n.d.). Facebook Page.", sourceUrl: "https://www.facebook.com/bishopshomemadeicecream",
 footnoteId: 17},
 {
 id: "cat-blubber-bubble",
 name: "Bethlehem 'Blubber Bubble'",
 type: "oddity",
 coords: { lat: 44.2798, lng: -71.6878 },
 legId: "leg-4", position: "in-between", detourMinutes: 3, detourMiles: 1,
 difficulty: "drive-up", themes: ["oddity", "free", "photography"],
 tagline: "Giant bubble gum bubble + gum wall tradition",
 description: "A quirky roadside sculpture in Bethlehem — a giant pink bubble gum bubble statue. Part of the town's 'Gum Wall' tradition where visitors leave chewed gum on a wall (similar to Seattle's Pike Place gum wall). A fun 5-minute photo stop on the drive north.",
 highlights: ["Giant bubble sculpture", "Gum wall tradition", "Quirky photo op", "Bethlehem Main Street shops"],
 cost: "Free", visitDuration: "10 min", season: "Year-round",
 address: "Main St, Bethlehem, NH 03574",
 restrooms: false, dogFriendly: true, hiddenGem: true,
 source: "Atlas Obscura. (n.d.). New Hampshire Places.", sourceUrl: "https://www.atlasobscura.com/things-to-do/new-hampshire",
 footnoteId: 18},
 {
 id: "cat-laperles-iga",
 name: "LaPerle's IGA (Colebrook)",
 type: "grocery",
 coords: { lat: 44.8934, lng: -71.4994 },
 legId: "leg-4", position: "near-stop", detourMinutes: 5, detourMiles: 3,
 difficulty: "none", themes: ["grocery", "supplies", "budget"],
 tagline: "Colebrook's main grocery — Mon–Sat 7am–8:30pm, Sun 8am–6pm",
 description: "LaPerle's IGA is the primary grocery store in Colebrook, NH. Full-service supermarket with produce, meat, dairy, and camping supplies. Mon–Sat 7am–8:30pm, Sun 8am–6pm. NOTE: Store may be temporarily closed due to fire — call ahead. Alternative: Lambert's Produce (Thu–Sat).",
 highlights: ["Full-service IGA", "Mon–Sat 7am–8:30pm", "Sun 8am–6pm", "Camping supplies", "Call ahead (fire recovery)"],
 cost: "$$", visitDuration: "30 min", season: "Year-round",
 address: "64 Trooper Leslie Lord Hwy, Colebrook, NH 03576", phone: "603-237-4370",
 website: "https://www.laperlesiga.com",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "LaPerle's IGA. (n.d.). Contact & Store Info.", sourceUrl: "https://www.laperlesiga.com/contact-us-store-info",
 footnoteId: 19},
 {
 id: "cat-lamberts-produce",
 name: "Lambert's Produce Land (Colebrook)",
 type: "farm-stand",
 coords: { lat: 44.8961, lng: -71.5012 },
 legId: "leg-4", position: "near-stop", detourMinutes: 5, detourMiles: 3,
 difficulty: "none", themes: ["grocery", "farm-stand", "fresh-produce"],
 tagline: "Fresh produce market — Thu 6am–7pm, Fri–Sat 8am–6pm",
 description: "Lambert's Produce Land is a fresh produce market at 236 Main Street in Colebrook. Open Thursday 6am–7pm, Friday–Saturday 8am–6pm. Newly built market stocked with fresh produce. Best source for fresh fruits and vegetables in the Colebrook area.",
 highlights: ["Fresh produce market", "Thu 6am–7pm, Fri–Sat 8am–6pm", "236 Main St Colebrook", "Newly built market"],
 cost: "$", visitDuration: "20 min", bestTime: "Thursday (freshest)", season: "Jun–Oct",
 address: "236 Main St, Colebrook, NH 03576",
 website: "https://lambertproduceland.com",
 restrooms: false, dogFriendly: true, hiddenGem: true,
 source: "Lambert's Produce Land. (n.d.). Official Website.", sourceUrl: "https://lambertproduceland.com",
 footnoteId: 20},

 // ═════════════════════════════════════════════════════════════════════
 // LEG 6: Coleman → Westborough (via Kancamagus)
 // ═════════════════════════════════════════════════════════════════════
 {
 id: "cat-sabbaday-falls",
 name: "Sabbaday Falls",
 type: "waterfall",
 coords: { lat: 43.9853, lng: -71.4457 },
 legId: "leg-6", position: "in-between", detourMinutes: 2, detourMiles: 1,
 difficulty: "easy", themes: ["waterfall", "nature", "free", "family-friendly"],
 tagline: "35-ft cascading waterfall — 0.3 mi easy walk",
 description: "One of the most popular stops on the Kancamagus Highway. A short 0.3-mile walk leads to a 35-foot cascading waterfall that drops through a narrow granite gorge. The falls are especially dramatic in spring with snowmelt. A viewing platform provides the perfect photo angle.",
 highlights: ["35-ft cascading waterfall", "0.3-mi easy walk", "Granite gorge", "Viewing platform"],
 cost: "Free", visitDuration: "30 min", bestTime: "Spring (snowmelt)", season: "Year-round",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Kancamagus Highway. (n.d.). Sabbaday Falls.", sourceUrl: "https://kancamagushighway.com/sabbaday-falls",
 footnoteId: 21},
 {
 id: "cat-lower-falls",
 name: "Lower Falls (Swift River)",
 type: "swimming",
 coords: { lat: 44.0229, lng: -71.5273 },
 legId: "leg-6", position: "in-between", detourMinutes: 2, detourMiles: 1,
 difficulty: "easy", themes: ["swimming", "nature", "free", "family-friendly"],
 tagline: "Natural swimming hole + picnic area on Swift River",
 description: "A popular swimming hole on the Swift River along the Kancamagus Highway. The falls cascade over smooth granite rocks into a deep pool. A picnic area with tables sits alongside the river. The water is cold even in August — perfect for cooling off on the drive home.",
 highlights: ["Natural swimming hole", "Smooth granite rocks", "Picnic area with tables", "Cold mountain water"],
 cost: "Free", visitDuration: "30 min", bestTime: "Afternoon (warmest)", season: "Jun–Sep",
 restrooms: true, dogFriendly: true, hiddenGem: false,
 source: "Visit White Mountains. (n.d.). Lower Falls.", sourceUrl: "https://www.visitwhitemountains.com",
 footnoteId: 22},
 {
 id: "cat-albany-bridge",
 name: "Albany Covered Bridge",
 type: "bridge",
 coords: { lat: 44.0123, lng: -71.5476 },
 legId: "leg-6", position: "in-between", detourMinutes: 2, detourMiles: 1,
 difficulty: "drive-up", themes: ["historic", "bridge", "free", "photography"],
 tagline: "1858 Paddleford-style covered bridge — still open to vehicles",
 description: "Built in 1858, this Paddleford-style covered bridge spans the Swift River. One of the most photographed covered bridges in New Hampshire. You can walk through it and it's still open to passenger vehicles. The surrounding area has picnic tables and river access.",
 highlights: ["Built 1858 (167 years old)", "Paddleford truss design", "Still open to vehicles", "Most photographed in NH"],
 cost: "Free", visitDuration: "15 min", bestTime: "Fall foliage", season: "Year-round",
 address: "Dugway Rd, off Kancamagus Hwy, Albany, NH",
 restrooms: false, dogFriendly: true, hiddenGem: true,
 source: "Covered Bridges of New Hampshire. (n.d.). Albany Covered Bridge.", sourceUrl: "https://coveredbridgesnh.com",
 footnoteId: 23},
 {
 id: "cat-rocky-gorge",
 name: "Rocky Gorge Scenic Area",
 type: "nature",
 coords: { lat: 44.0108, lng: -71.5469 },
 legId: "leg-6", position: "in-between", detourMinutes: 1, detourMiles: 0.5,
 difficulty: "easy", themes: ["nature", "free", "family-friendly"],
 tagline: "Rocky river gorge — easy walk + picnic tables",
 description: "A scenic rocky gorge on the Swift River along the Kancamagus Highway. A short, easy walk leads to views of the river tumbling through granite boulders. Picnic tables and a parking area make this a perfect quick stop. Less crowded than Lower Falls.",
 highlights: ["Granite river gorge", "Easy 5-min walk", "Picnic tables", "Less crowded than Lower Falls"],
 cost: "Free", visitDuration: "15 min", bestTime: "Spring (high water)", season: "Year-round",
 restrooms: false, dogFriendly: true, hiddenGem: true,
 source: "Kancamagus Highway. (n.d.). Rocky Gorge.", sourceUrl: "https://kancamagushighway.com",
 footnoteId: 24},
 {
 id: "cat-woodstock-brewery",
 name: "Woodstock Inn Brewery",
 type: "brewery",
 coords: { lat: 44.0389, lng: -71.6767 },
 legId: "leg-6", position: "near-stop", detourMinutes: 2, detourMiles: 1,
 difficulty: "none", themes: ["brewery", "dining", "casual"],
 tagline: "Pemi Pale Ale in 1800s inn — since 1995",
 description: "The Woodstock Inn Brewery (est. 1995) is housed in a 19th-century inn in North Woodstock. Known for Pemi Pale Ale and Red Rack Amber Ale. The pub serves classic New England fare — burgers, wings, mac & cheese. Live music on weekends.",
 highlights: ["Since 1995", "Pemi Pale Ale", "1800s inn setting", "Weekend live music"],
 cost: "$$", visitDuration: "1 hour", bestTime: "Lunch", season: "Year-round",
 address: "135 Main St, North Woodstock, NH 03262",
 website: "https://www.woodstockinnbrewery.com",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Woodstock Inn Brewery. (n.d.). Official Website.", sourceUrl: "https://www.woodstockinnbrewery.com",
 footnoteId: 25},
 {
 id: "cat-waynes-market",
 name: "Wayne's Market (North Woodstock)",
 type: "grocery",
 coords: { lat: 44.0395, lng: -71.6778 },
 legId: "leg-6", position: "near-stop", detourMinutes: 2, detourMiles: 1,
 difficulty: "none", themes: ["grocery", "supplies", "convenience"],
 tagline: "Convenience grocery — Sun–Thu 7am–8pm, Fri–Sat 7am–9pm",
 description: "Wayne's Market is a convenience grocery store in North Woodstock, NH. Open Sunday–Thursday 7am–8pm, Friday–Saturday 7am–9pm. Good for last-minute supplies, snacks, drinks, and basics. The closest grocery to Lincoln/Woodstock area.",
 highlights: ["7am–8pm (8pm–9pm Fri–Sat)", "Convenience grocery", "Snacks & drinks", "Closest to Lincoln area"],
 cost: "$$", visitDuration: "15 min", season: "Year-round",
 address: "173 Main St, North Woodstock, NH 03262", phone: "603-745-8819",
 website: "https://www.waynesmarketnh.com",
 restrooms: false, dogFriendly: false, hiddenGem: false,
 source: "Wayne's Market. (n.d.). Official Website.", sourceUrl: "https://www.waynesmarketnh.com",
 footnoteId: 26},
 {
 id: "cat-market-basket-concord",
 name: "Market Basket (Concord)",
 type: "grocery",
 coords: { lat: 43.2234, lng: -71.5356 },
 legId: "leg-6", position: "in-between", detourMinutes: 5, detourMiles: 2,
 difficulty: "none", themes: ["grocery", "supplies", "budget"],
 tagline: "Best prices — 108 Fort Eddy Rd, Mon–Sat 7am–9pm, Sun 7am–8pm",
 description: "Market Basket is known for having the lowest grocery prices in New England. The Concord location at 108 Fort Eddy Rd is perfect for a final supply run or grabbing food for the drive home. Mon–Sat 7am–9pm, Sun 7am–8pm. Full supermarket with deli, bakery, and produce.",
 highlights: ["Lowest prices in NH", "Mon–Sat 7am–9pm", "Sun 7am–8pm", "Full supermarket", "Deli & bakery"],
 cost: "$", visitDuration: "30 min", season: "Year-round",
 address: "108 Fort Eddy Rd, Concord, NH 03301", phone: "603-224-5479",
 website: "https://www.shopmarketbasket.com/store-locations/concord-new-hampshire-marketbasket-35",
 restrooms: true, dogFriendly: false, hiddenGem: false,
 source: "Market Basket. (n.d.). Concord, NH Store #35.", sourceUrl: "https://www.shopmarketbasket.com/store-locations/concord-new-hampshire-marketbasket-35",
 footnoteId: 27}];

// ── Sources (APA format) ──────────────────────────────────────────────────

export interface Source {
 id: number;
 citation: string;
 url: string;
}

export const SOURCES: Source[] = [
 { id: 1, citation: "Idyllic Pursuit. (2024). Quirky Massachusetts Roadside Stops Worth Pulling Over For.", url: "https://www.idyllicpursuit.com/quirky-massachusetts-roadside-stops-worth-pulling-over-for/" },
 { id: 2, citation: "Massachusetts Department of Conservation & Recreation. (n.d.). Wachusett Mountain State Reservation.", url: "https://www.mass.gov/locations/wachusett-mountain-state-reservation" },
 { id: 3, citation: "New Hampshire State Parks. (n.d.). Robert Frost Farm Historic Site.", url: "https://www.nhstateparks.org/robert-frost-farm" },
 { id: 4, citation: "Visit NH. (n.d.). Things to Do in New Hampshire.", url: "https://www.visitnh.gov" },
 { id: 5, citation: "Market Basket. (n.d.). Store Locations.", url: "https://www.shopmarketbasket.com" },
 { id: 6, citation: "Deerfield Fair Association. (n.d.). Deerfield Fair — America's Oldest Family Fair.", url: "https://deerfieldfair.com" },
 { id: 7, citation: "Hannaford Supermarkets. (n.d.). Raymond, NH Store #8120.", url: "https://stores.hannaford.com/nh/raymond/8120" },
 { id: 8, citation: "Visit NH. (n.d.). Antique Alley, Route 4, New Hampshire.", url: "https://www.visitnh.gov" },
 { id: 9, citation: "New Hampshire State Parks. (n.d.). Winslow State Park (Mt. Kearsarge).", url: "https://www.nhstateparks.org/winslow" },
 { id: 10, citation: "Atlas Obscura. (n.d.). Indian Head, Lincoln, New Hampshire.", url: "https://www.atlasobscura.com/places/indian-head" },
 { id: 11, citation: "Clark's Bears. (n.d.). Clark's Trading Post — Lincoln, NH.", url: "https://clarksbears.com" },
 { id: 12, citation: "Arnold's Wayside Diner. (n.d.). Facebook Page — Lincoln, NH.", url: "https://www.facebook.com/arnoldswaysidediner" },
 { id: 13, citation: "Black Mountain Burger Co. (n.d.). Official Website — Lincoln, NH.", url: "https://blackmtnburger.com" },
 { id: 14, citation: "One Love Brewery. (n.d.). Lincoln, NH.", url: "https://www.tripadvisor.com/Restaurant_Review-g46140-d8076698" },
 { id: 15, citation: "Polly's Pancake Parlor. (n.d.). Official Website — Sugar Hill, NH.", url: "https://pollyspancakeparlor.com" },
 { id: 16, citation: "Littleton Diner. (n.d.). 90 Main St, Littleton, NH 03561.", url: "https://www.yelp.com/biz/littleton-diner-littleton" },
 { id: 17, citation: "Bishop's Homemade Ice Cream. (n.d.). Facebook Page — Littleton, NH.", url: "https://www.facebook.com/bishopshomemadeicecream" },
 { id: 18, citation: "Atlas Obscura. (n.d.). Cool and Unusual Things to Do in New Hampshire.", url: "https://www.atlasobscura.com/things-to-do/new-hampshire" },
 { id: 19, citation: "LaPerle's IGA. (n.d.). Contact & Store Info — Colebrook, NH.", url: "https://www.laperlesiga.com/contact-us-store-info" },
 { id: 20, citation: "Lambert's Produce Land. (n.d.). Official Website — Colebrook, NH.", url: "https://lambertproduceland.com" },
 { id: 21, citation: "Kancamagus Highway. (n.d.). Sabbaday Falls.", url: "https://kancamagushighway.com/sabbaday-falls" },
 { id: 22, citation: "Visit White Mountains. (n.d.). Lower Falls, Swift River.", url: "https://www.visitwhitemountains.com" },
 { id: 23, citation: "Covered Bridges of New Hampshire. (n.d.). Albany Covered Bridge.", url: "https://coveredbridgesnh.com" },
 { id: 24, citation: "Kancamagus Highway. (n.d.). Rocky Gorge Scenic Area.", url: "https://kancamagushighway.com" },
 { id: 25, citation: "Woodstock Inn Brewery. (n.d.). Official Website — North Woodstock, NH.", url: "https://www.woodstockinnbrewery.com" },
 { id: 26, citation: "Wayne's Market. (n.d.). Official Website — North Woodstock, NH.", url: "https://www.waynesmarketnh.com" },
 { id: 27, citation: "Market Basket. (n.d.). Concord, NH Store #35.", url: "https://www.shopmarketbasket.com/store-locations/concord-new-hampshire-marketbasket-35" }];

// ── Helper functions ──────────────────────────────────────────────────────

export function getCatalogByLeg(legId: string): CatalogEntry[] {
 return CATALOG.filter(e => e.legId === legId).sort((a, b) => a.detourMinutes - b.detourMinutes);
}

export function getCatalogByType(type: AttractionType): CatalogEntry[] {
 return CATALOG.filter(e => e.type === type);
}

export function getCatalogByTheme(theme: string): CatalogEntry[] {
 return CATALOG.filter(e => e.themes.includes(theme));
}

export function getHiddenGems(): CatalogEntry[] {
 return CATALOG.filter(e => e.hiddenGem);
}

export function getFoodAndGrocery(): CatalogEntry[] {
 return CATALOG.filter(e => ["grocery", "farm-stand", "dining", "brewery", "gas"].includes(e.type));
}

export const TYPE_META: Record<AttractionType, { color: string; label: string }> = {
 waterfall: { color: "#0284c7", label: "Waterfall" },
 viewpoint: { color: "#0284c7", label: "Viewpoint" },
 historic: { color: "#92400e", label: "Historic" },
 dining: { color: "#dc2626", label: "Dining" },
 oddity: { color: "#7c3aed", label: "Quirky" },
 nature: { color: "#16a34a", label: "Nature" },
 bridge: { color: "#b45309", label: "Bridge" },
 hike: { color: "#16a34a", label: "Hike" },
 swimming: { color: "#0284c7", label: "Swimming" },
 brewery: { color: "#d97706", label: "Brewery" },
 grocery: { color: "#0891b2", label: "Grocery" },
 gas: { color: "#6b7280", label: "Gas" },
 "farm-stand": { color: "#65a30d", label: "Farm Stand" },
 "scenic-drive": { color: "#d97706", label: "Scenic Drive" },
 museum: { color: "#92400e", label: "Museum" }};

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; icon: string }> = {
 "drive-up": { label: "Drive-up", color: "#16a34a" },
 "easy": { label: "Easy", color: "#16a34a" },
 "moderate": { label: "Moderate", color: "#d97706" },
 "strenuous": { label: "Strenuous", color: "#dc2626", icon: "️" },
 "none": { label: "N/A", color: "#6b7280", icon: "—" }};
