/**
 * The Wilderness Romance Adventure - Trip Data
 * Sourced from "The Wilderness Romance Guide.pdf"
 * Trip Window: Tuesday, August 4 – Sunday, August 9, 2026
 * The Big Moment: Friday, August 7, 2026 @ 7:30 PM
 */

export type LatLng = { lat: number; lng: number };

export type PlaceCategory =
  | "stay"
  | "hike"
  | "water"
  | "scenic"
  | "wildlife"
  | "historic"
  | "dining"
  | "railway"
  | "proposal"
  | "stargaze"
  | "nearby";

export type HikeEffort = "none" | "easy" | "moderate" | "strenuous";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  coords: LatLng;
  address?: string;
  description: string;
  highlights: string[];
  tips?: string[];
  cost?: string;
  imageKeys?: string[]; // keys into IMAGES registry
  bookingId?: string;
  accessCode?: string;
  checkIn?: string;
  checkOut?: string;
  vibe?: string;
  /** Hiking effort required to experience this place — used for the "low effort" filter */
  effort?: HikeEffort;
  /** Distance of trail if applicable (e.g., "0.2 mi", "2.5 mi loop") */
  trailDistance?: string;
  /** True if this is a "pretty/unique low-effort" highlight */
  lowEffortScenic?: boolean;
  /** Field-guide talking points (from Chapter 1 dossiers) */
  naturalistNotes?: string[];
}

export interface DriveLeg {
  id: string;
  from: string;
  to: string;
  miles: number;
  duration: string;
  day: string;
  notes?: string;
}

export interface DayPlan {
  day: string;
  date: string;
  title: string;
  emoji: string;
  theme: string;
  description: string;
  placeIds: string[]; // ordered visits
  legId?: string; // primary driving leg
  highlights: string[];
  color: string; // tailwind gradient pair
}

export interface PotentialSite {
  id: string;
  name: string;
  category: PlaceCategory;
  coords: LatLng;
  description: string;
  closestMainStop?: string; // closest main stop
  imageKey?: string;
  why: string;
}

// ============= PLACES =============
export const PLACES: Place[] = [
  {
    id: "bear-brook",
    name: "Bear Brook State Park",
    category: "stay",
    coords: { lat: 43.1145, lng: -71.3917 },
    address: "15 Bear Hill Pond Rd, Allenstown, NH 03275",
    description:
      "New Hampshire's largest developed state park — over 10,000 acres of pine forest, ponds, and trails just 80 miles north of Westborough, MA. Oaks Cabin 1 sits on the Bear Hill Loop, offering a true off-grid retreat with no electricity, no heat, and complete acoustic isolation under a deep pine canopy. The park was originally built by the Civilian Conservation Corps in the 1930s, and that rustic character has been preserved across the decades.",
    highlights: [
      "Oaks Cabin 1 — Bear Hill Loop",
      "10,000+ acres of pine forest",
      "Beaver Pond (electric-motor-free)",
      "CCC Barracks Museum",
      "Catamount Hill Loop trail",
    ],
    tips: [
      "Bring ALL bedding, cookware, lanterns, and stoves — nothing is provided.",
      "Open indoor cooking or candles strictly prohibited.",
      "Central public hot showers are 5 miles away at the primary park loops.",
      "Lock devices in the trunk on arrival — this is your detox window.",
    ],
    cost: "FREE (park entry) + cabin reservation",
    imageKeys: ["bear_brook_real", "cabin", "forest_pine"],
    bookingId: "ReserveAmerica #2-54500258",
    accessCode: "3000",
    checkIn: "Tuesday 1:00 PM – 8:00 PM",
    checkOut: "Wednesday 11:00 AM (strict)",
    vibe: "Complete acoustic isolation within a deep pine canopy shelter",
  },
  {
    id: "beaver-pond",
    name: "Beaver Pond Sunset Paddle",
    category: "water",
    coords: { lat: 43.1289, lng: -71.3742 },
    description:
      "A glassy, electric-motor-free pond 1.8 miles from Bear Hill. Combustion engines are banned here, preserving smooth, mirror-like water ideal for silent canoe strokes. Launch your gear at twilight as the resident beavers begin emerging from their lodges — the pond comes alive with splashes, tail-slaps, and the silhouettes of swimming mammals against an orange sky.",
    highlights: [
      "1.8 miles from Bear Hill cabin",
      "Combustion engines banned — glass water",
      "Active beaver colony at twilight",
      "FREE paddle access",
    ],
    tips: [
      "Launch 30 min before sunset for best beaver activity.",
      "Pack a headlamp with red light mode to preserve night vision.",
      "Silent paddling gets you closer to wildlife — long, slow strokes.",
    ],
    cost: "FREE",
    imageKeys: ["canoe", "sunset_lake"],
  },
  {
    id: "ccc-museum",
    name: "1930s CCC Barracks Museum",
    category: "historic",
    coords: { lat: 43.1056, lng: -71.3908 },
    description:
      "A 1.2-mile walk from Oaks Cabin 1, this property stands as the nation's most intact original Great Depression Civilian Conservation Corps basecamp. The barracks, mess hall, and outbuildings have been preserved as a living museum to the young men who built much of New Hampshire's state park infrastructure between 1933 and 1942. Original tools, photographs, and personal effects are on display.",
    highlights: [
      "1.2 miles from Oaks Cabin 1",
      "Nation's most intact CCC basecamp",
      "Original 1930s barracks & mess hall",
      "FREE self-guided museum access",
    ],
    cost: "FREE",
    imageKeys: ["historic"],
  },
  {
    id: "catamount-hill",
    name: "Catamount Hill Loop Hike",
    category: "hike",
    coords: { lat: 43.1218, lng: -71.4055 },
    description:
      "A low-impact 2.5-mile circuit path leading straight to a flat granite ledge overlooking the southern forest canopy line. The trail rolls gently through mixed hardwood and pine, crossing a few small streams before climbing to a broad panoramic viewpoint. Perfect for a morning hike before the day heats up — bring a thermos of coffee and enjoy the silence from the ledge.",
    highlights: [
      "2.5-mile loop trail",
      "Panoramic forest canopy view",
      "Flat granite ledge summit",
      "Low-impact — suitable for all skill levels",
    ],
    tips: [
      "Start before 9 AM for cooler temps and best lighting on the canopy.",
      "Watch for wild blueberries along the trail in early August.",
    ],
    cost: "FREE",
    imageKeys: ["hiking"],
  },
  {
    id: "pawtuckaway",
    name: "Pawtuckaway State Park",
    category: "stay",
    coords: { lat: 43.0833, lng: -71.1933 },
    address: "128 Mountain Road, Nottingham, NH 01581",
    description:
      "Lakeside waterfront rest backed by high-capacity energy staging. Cabin 4 on Big Island Loop is the powered reset point of the trip — featuring active wall outlets, the only site on this itinerary where you can fully recharge cameras, phones, power banks, and portable fans before the proposal weekend. The park wraps around Pawtuckaway Lake, with a massive freshwater sandy beach and glacial boulder fields left by prehistoric ice sheets.",
    highlights: [
      "Cabin 4 — BIG ISLAND Loop",
      "ACTIVE wall outlets (the only powered cabin!)",
      "Massive freshwater sandy beach",
      "Glacial Erratics Boulder Trail",
      "Kayak/canoe/SUP rentals",
    ],
    tips: [
      "Immediately plug in ALL electronics on arrival.",
      "Beach opens for private use at 5:30 PM when day tourists vacate.",
      "Cell service drops off completely on Big Island loop.",
      "Emergency hardline payphone at the park entrance hub.",
      "Quiet hours: 10:00 PM to 7:00 AM.",
    ],
    cost: "FREE (park entry) + cabin reservation",
    imageKeys: ["pawtuckaway_real", "cabin"],
    bookingId: "ReserveAmerica #2-54500259",
    accessCode: "8745",
    checkIn: "Thursday 1:00 PM",
    checkOut: "Friday 11:00 AM (strict)",
    vibe: "Lakeside waterfront rest backed by high-capacity energy staging",
  },
  {
    id: "pawtuckaway-beach",
    name: "Sunset Shoreline Beach Cove",
    category: "water",
    coords: { lat: 43.0901, lng: -71.1872 },
    description:
      "Walk 1.1 miles from Cabin 4 to the park's sand beach front at 5:30 PM. General day tourists must vacate at this timestamp, leaving an open, quiet beach line for an evening stroll. The freshwater is warm in early August, the sand is soft, and the western exposure makes for an excellent sunset viewing point across the lake.",
    highlights: [
      "1.1 miles from Cabin 4",
      "Open beach after 5:30 PM crowds leave",
      "Freshwater swimming — warm in August",
      "Western sunset exposure",
    ],
    tips: [
      "Bring a beach towel and dry clothes for the walk back.",
      "Pack a picnic dinner to enjoy on the sand.",
    ],
    cost: "FREE",
    imageKeys: ["sunset_lake"],
  },
  {
    id: "glacial-erratics",
    name: "The Glacial Erratics Field",
    category: "scenic",
    coords: { lat: 43.0872, lng: -71.2014 },
    description:
      "Follow the flat, scenic 0.8-mile Boulder Trail heading off Big Island to explore monolithic, house-sized boulders deposited across the forest floor by prehistoric ice sheets. These glacial erratics were carried miles by the Laurentide Ice Sheet 18,000+ years ago and dropped in place when the ice retreated. Some boulders are the size of small houses, creating a surreal moonscape in the middle of the New England woods.",
    highlights: [
      "0.8-mile Boulder Trail",
      "House-sized glacial boulders",
      "18,000-year-old geological wonder",
      "Easy, flat walking path",
    ],
    cost: "FREE",
    imageKeys: ["hiking"],
  },
  {
    id: "granite-railway",
    name: "Granite State Scenic Railway",
    category: "railway",
    coords: { lat: 44.0584, lng: -71.6712 },
    address: "Lincoln, NH rail platform",
    description:
      "A relaxing 80-minute vintage rail journey tracking directly along the rushing waters of the Pemigewasset River. The heritage coaches are restored 1920s-era cars with mahogany trim and large windows. Outside food is welcome on board — pack a premium, custom charcuterie board and matching beverages to eat together while White Mountain views pass outside the coaches. The railway serves as your romantic mid-day transition between Pawtuckaway and the deep North Country hills.",
    highlights: [
      "80-minute scenic vintage rail ride",
      "Tracks the Pemigewasset River",
      "Restored 1920s heritage coaches",
      "Bring-your-own charcuterie picnic",
    ],
    tips: [
      "Book the $32 open-air observation car — eliminates window reflections for photos.",
      "Arrive 15 min early for platform boarding.",
      "Pack charcuterie in a soft cooler with ice pack.",
    ],
    cost: "$27 enclosed coach / $32 open-air observation car (per adult)",
    imageKeys: ["granite_railway_real", "pemigewasset"],
    bookingId: "Advance online booking",
  },
  {
    id: "dixville-notch",
    name: "Dixville Notch Proposal Site",
    category: "proposal",
    coords: { lat: 44.8705, lng: -71.3052 },
    address: "Lake Gloriette pull-off, Route 26, Dixville, NH",
    description:
      "The exact proposal coordinates: 44.870° N, -71.305° W. This is the wide, flat shoreline gravel pull-off on Lake Gloriette, sitting directly on the valley basin floor at the base of the notch mountain pass. Directly across the water, the trees break away and the magnificent, jagged vertical granite face of Table Rock Cliffs shoots 1,000 feet straight up into the sky. Because the pass is so tight, the mountain completely fills your horizon, and the calm lake water creates a mirror reflection of the stone face — the ultimate scene for a 'sunset landscape painting date' cover story.",
    highlights: [
      "GPS: 44.870° N, -71.305° W",
      "1,000-ft vertical granite face of Table Rock",
      "Mirror-calm Lake Gloriette reflection",
      "Perfect sunset alignment (7:30 PM August)",
      "Flat gravel pull-off — easy vehicle access",
    ],
    tips: [
      "Slow to 20 MPH past The Balsams Resort — pull-off is on the right (south side).",
      "Set up travel easels on the flat grassy edge between car door and water.",
      "Photographer team parks 0.2 mi East at Table Rock trailhead lot.",
      "Face South-Southwest across the narrow lake finger for the alignment.",
      "Sunset turns the granite pink and orange ~7:30 PM in early August.",
    ],
    cost: "Completely FREE!",
    imageKeys: ["dixville_notch_real", "table_rock", "sunset_lake"],
    vibe: "The Big Moment — 1,000-foot granite cliff mirror reflection at golden hour",
  },
  {
    id: "table-rock",
    name: "Table Rock Cliffs",
    category: "scenic",
    coords: { lat: 44.8673, lng: -71.3068 },
    description:
      "The 1,000-foot vertical granite face that becomes the visual centerpiece of your proposal. While the official Table Rock hiking trail (1.5-mile steep ascent) leads to the cliff peak, your photographer team will use the official gravel lot at the trailhead as their staging point — parking hidden from view 0.2 miles East of the proposal pull-off. From there, they walk westward along the low brush line bordering the highway, sneaking into position to shoot across the water with telephoto lenses without breaking the surprise.",
    highlights: [
      "1,000-ft vertical granite face",
      "Official trailhead parking lot (photographer staging)",
      "0.2 mi east of proposal pull-off",
      "Trailhead lot is hidden from proposal view",
    ],
    tips: [
      "Photographer team: arrive 30 min before proposal (7:00 PM).",
      "Use telephoto lenses to shoot across the lake from the brush line.",
      "Wear earth tones to blend with the highway-side brush.",
    ],
    cost: "FREE",
    imageKeys: ["table_rock_real"],
  },
  {
    id: "balsams-resort",
    name: "The Balsams Grand Resort",
    category: "historic",
    coords: { lat: 44.8694, lng: -71.3195 },
    description:
      "A historic (currently closed) grand resort complex that looms on your left-hand flank as you ascend Route 26 into Dixville Notch. Built in 1866 as the Dix House, expanded into a 400-room grand hotel in 1918, and once the site of New Hampshire's famous 'midnight voting' tradition for presidential primaries. The massive white-columned building is a striking landmark signaling that you're approaching the proposal zone — slow to 20 MPH past the property line.",
    highlights: [
      "Built 1866, expanded 1918",
      "400-room grand historic hotel (currently closed)",
      "Famous 'midnight voting' tradition site",
      "Visual landmark for proposal approach",
    ],
    tips: [
      "When you see The Balsams on your left, slow to 20 MPH.",
      "Lake Gloriette pull-off is just past the resort property line.",
    ],
    cost: "FREE to view exterior",
    imageKeys: ["balsams_resort_real"],
  },
  {
    id: "coleman-sp",
    name: "Coleman State Park",
    category: "stay",
    coords: { lat: 45.0647, lng: -71.3267 },
    address: "Perch Cabin • Cabins Loop, Coleman State Park, NH",
    description:
      "Secluded engagement celebration under New England's darkest skies. Perch Cabin sits on Little Diamond Pond, 100 feet from the water via the boat ramp line. The cabin is a single self-contained room with a full-size bed, low-draw solar lighting, and a functional propane heater — your basecamp for the post-proposal celebration weekend. The park is located in New Hampshire's remote Great North Woods region, far from urban light glare, with a Bortle Class 2 dark sky rating that makes the Milky Way core visible reflecting across the pond's mirror surface.",
    highlights: [
      "Perch Cabin on Little Diamond Pond",
      "Bortle Class 2 dark sky — Milky Way visible",
      "100 ft from pond via boat ramp",
      "Solar lighting + propane heater",
      "Deep in Great North Woods",
    ],
    tips: [
      "MANDATORY: stop at Coleman Estates Lodge Office to register before cabin.",
      "No sheets, pillows, or linens provided — pack your own.",
      "Strict pet ban — no animals allowed anywhere in the park.",
      "Coin-operated hot showers on site.",
      "Generator hours: 9 AM–12 PM & 5 PM–8 PM only.",
      "Emergency hardline payphone on outside wall of Recreation Hall.",
    ],
    cost: "FREE (park entry) + cabin reservation",
    imageKeys: ["coleman_state_park_real", "cabin", "stargazing"],
    bookingId: "ReserveAmerica #2-54500260",
    checkIn: "Friday night post-proposal",
    checkOut: "Sunday before 11:00 AM",
    vibe: "Secluded engagement celebration under New England's darkest skies",
  },
  {
    id: "little-diamond-pond",
    name: "Little Diamond Pond Midnight Swim",
    category: "water",
    coords: { lat: 45.0649, lng: -71.3291 },
    description:
      "Located 100 feet from your cabin entry door via the boat ramp line. Plan a private, spontaneous celebratory night swim under the stars at 2:00 AM Saturday morning! The pond's mirror-calm surface at this hour reflects the Bortle Class 2 night sky — you'll be floating in the Milky Way. The water in early August is comfortable enough for a 5-10 minute celebratory dip before toweling off and heading back to the warm cabin.",
    highlights: [
      "100 ft from Perch Cabin door",
      "2:00 AM Milky Way reflection swim",
      "Bortle Class 2 dark sky overhead",
      "Warm enough for August night swim",
    ],
    tips: [
      "Bring beach towels laid out on the boat ramp before entering water.",
      "Headlamp with red light to preserve night vision while walking back.",
      "Quick dip — 5-10 min is plenty in the cool night air.",
    ],
    cost: "FREE",
    imageKeys: ["stargazing", "canoe"],
  },
  {
    id: "border-slash",
    name: "US-Canada Border 'The Slash'",
    category: "scenic",
    coords: { lat: 45.3056, lng: -71.3611 },
    description:
      "Journey 22 miles North (40 mins) to Pittsburg, NH. Hike the scenic 4th Connecticut Lake trail circuit up to the 20-foot wide cleared linear strip of earth defining the physical boundary between the US and Canada. Standing on The Slash, you have one foot in New Hampshire and one foot in Quebec. The trail is a moderate 1.2-mile loop through boreal forest to the lake and back, with the border itself clearly marked by a swath cut through the trees extending to the horizon in both directions.",
    highlights: [
      "22 miles north of Coleman State Park",
      "Stand on US-Canada border line",
      "20-foot-wide cleared boundary strip",
      "4th Connecticut Lake loop trail (1.2 mi)",
    ],
    tips: [
      "Bring passports if you plan to actually cross (technically required).",
      "Bug spray essential — boreal forest in August is heavy with mosquitoes.",
      "Pack a lunch — picnic on the border is a once-in-a-lifetime moment.",
    ],
    cost: "FREE",
    imageKeys: ["hiking", "forest_pine"],
  },
  {
    id: "moose-alley",
    name: "Moose Alley Twilight Run",
    category: "wildlife",
    coords: { lat: 45.2234, lng: -71.4022 },
    description:
      "Navigate the Route 3 corridor north of Pittsburg around 8:30 PM Saturday. Activate your vehicle high beams to observe giant native moose grazing inside the roadside peat bogs. Route 3 between Pittsburg and the Canadian border is known as 'Moose Alley' — the highest moose density in the lower 48 states. Moose are most active at twilight and after dark, drawn to the salt-rich peat bogs alongside the highway. Drive slowly, use high beams when no oncoming traffic, and pull completely off the road when stopping to view.",
    highlights: [
      "Route 3 north of Pittsburg, NH",
      "Highest moose density in lower 48",
      "Best viewing 8:30 PM twilight",
      "Multiple moose per evening likely",
    ],
    tips: [
      "Drive 30-40 MPH and scan both sides of the road constantly.",
      "Moose eyes do NOT reflect headlights like deer — harder to spot.",
      "If you stop, pull COMPLETELY off the road — other drivers may not see you.",
      "Never approach a moose on foot — they are aggressive when cornered.",
      "Keep windows up — moose can be territorial.",
    ],
    cost: "FREE",
    imageKeys: ["moose_night"],
  },
  {
    id: "huntington-falls",
    name: "Huntington Cascades Trail",
    category: "scenic",
    coords: { lat: 44.9512, lng: -71.3889 },
    description:
      "Situated 10.5 miles from the cabins. A flat, easy 5-minute stroll off the main road to a beautiful double-tiered tumbling waterfall. Perfect for a quick photo op on Sunday morning before the long drive home. The cascades drop about 25 feet total in two tiers over moss-covered granite ledges, with a small pool at the base. The trailhead is unmarked but well-known locally — look for the small pull-off on Route 3 about 10 minutes south of Colebrook.",
    highlights: [
      "10.5 miles from Coleman cabins",
      "5-minute flat approach trail",
      "Double-tiered tumbling waterfall",
      "Perfect Sunday morning photo op",
    ],
    tips: [
      "Easy enough for any fitness level — wear any comfortable shoes.",
      "Best flow in morning light.",
      "Bring your camera — the mossy granite is photogenic.",
    ],
    cost: "FREE",
    imageKeys: ["huntington_cascade_real"],
  },
  {
    id: "le-rendez-vous",
    name: "Le Rendez-Vous French Bakery",
    category: "dining",
    coords: { lat: 44.9373, lng: -71.4994 },
    address: "Colebrook, NH",
    description:
      "Toast your engagement with fresh breakfast pastries and espresso at this cozy French bakery in Colebrook. The perfect Sunday morning celebration spot — flaky croissants, pain au chocolat, fruit tarts, and rich espresso drinks. The bakery is a local institution, often with a line out the door on weekend mornings. Arrive early for the best selection, then take your treats to go and enjoy them at Huntington Cascades 15 minutes down the road.",
    highlights: [
      "Authentic French pastries in northern NH",
      "Fresh croissants, pain au chocolat, fruit tarts",
      "Espresso drinks & coffee",
      "Engagement celebration breakfast spot",
    ],
    tips: [
      "Arrive before 9 AM for best pastry selection.",
      "Cash is appreciated — small town bakery.",
      "Order pastries to-go for the Huntington Cascades picnic.",
    ],
    cost: "$8-15 per person",
    imageKeys: ["le_rendezvous_colebrook"],
    effort: "none",
  },

  // ============= NEW LOW-EFFORT SCENIC STOPS (+ User-requested) =============
  // Old Man of the Mountain Memorial — the user specifically asked for "the man face mountain"
  {
    id: "old-man-mountain",
    name: "Old Man of the Mountain Memorial Plaza",
    category: "historic",
    coords: { lat: 44.1609, lng: -71.6803 },
    address: "Profile Lake, Franconia Notch State Park, NH",
    description:
      "Old Man of the Mountain — New Hampshire's most famous natural landmark. The original Old Man of the Mountain was a series of five granite cliff ledges on Cannon Mountain that formed a striking human profile when viewed from the north. It was NH's state symbol (on the highway sign, the quarter, and the license plate) until it catastrophically collapsed on May 3, 2003. Today, a stunning memorial plaza at Profile Lake features seven steel 'profilers' that recreate the Old Man's face from the exact original viewing angle when you stand at the right spot. Look through the profiler and the Old Man reappears before your eyes — a powerful, eerie, and uniquely New Hampshire experience.",
    highlights: [
      "Old Man of the Mountain — NH's most famous natural icon",
      "Original rock profile collapsed May 3, 2003",
      "Steel 'profilers' recreate the face from the exact viewing angle",
      "On NH state quarter, license plate, and highway sign",
      "Profile Lake setting — Cannon Mountain backdrop",
      "FREE access, 2-min walk from parking lot",
    ],
    tips: [
      "Stand at the stone viewing pad with your name on the brass plaque — that's the exact spot the profiler recreates the Old Man.",
      "Walk the short plaza loop to read all 7 profiler stations — each tells a piece of the Old Man's history.",
      "Best lighting is mid-morning (after 10 AM) when the cliff face is sunlit.",
      "Bring a coin — NH state quarter features the Old Man.",
      "Combine with The Basin (1 mile south) and Echo Lake (1 mile north) for a perfect low-effort Franconia Notch circuit.",
    ],
    cost: "FREE (NH State Parks — $5 parking fee at Profile Lake lot)",
    imageKeys: ["old_man_mountain", "franconia_notch"],
    effort: "none",
    trailDistance: "0.1 mi flat walk from parking",
    lowEffortScenic: true,
    vibe: "NH's iconic Old Man of the Mountain — steel memorial recreates the collapsed profile",
    naturalistNotes: [
      "The Old Man was first 'discovered' by white settlers in 1805 but was likely known to Abenaki people for centuries before.",
      "The face was held together by turnbuckles and cables installed in 1958 by NH state highway crews — a desperate attempt to slow natural erosion.",
      "Daniel Webster wrote of the Great Stone Face: 'Up in the mountains of New Hampshire, the Creator has hung out a sign to show that here, the people are made of stone.'",
      "The collapse was discovered the morning of May 3, 2003 by workers driving through the notch — overnight, the symbol of NH was simply gone.",
    ],
  },
  // The Basin at Franconia Notch — highway waterfall stop
  {
    id: "the-basin",
    name: "The Basin at Franconia Notch",
    category: "scenic",
    coords: { lat: 44.1089, lng: -71.6833 },
    address: "Franconia Notch State Park, Lincoln, NH",
    description:
      "A magnificent 30-foot-diameter glacial pothole waterfall carved into solid granite by the Pemigewasset River over 25,000 years. The Basin formed at the end of the last Ice Age when swirling meltwater and trapped boulders ground a perfect bowl into the bedrock. The water plunges through a narrow chute into the basin and continues through a deep, polished granite channel that's a spectacular study in hydraulic erosion. The 0.3-mile paved path from the parking lot is fully accessible and stroller-friendly — one of the lowest-effort, highest-reward stops in the White Mountains.",
    highlights: [
      "30-ft glacial pothole carved by Ice Age meltwater",
      "25,000-year-old geological wonder",
      "0.3-mile flat paved walk from parking",
      "Pemigewasset River roaring chute",
      "FREE access (parking fee applies)",
      "Friday 2:20 PM leg-stretcher stop",
    ],
    tips: [
      "Walk the 0.5-mile loop past The Basin to see Cascade Brook and Kinsman Falls — minimal extra effort for big payoff.",
      "Best photography in morning light (10 AM - noon).",
      "Water levels vary — late spring is most dramatic, August is tamer but still beautiful.",
      "Combine with Old Man Memorial (1 mi north) and Flume Gorge (2 mi north) for a Franconia Notch trifecta.",
    ],
    cost: "FREE (NH State Parks — parking fee)",
    imageKeys: ["the_basin", "franconia_notch"],
    effort: "none",
    trailDistance: "0.3 mi flat paved path",
    lowEffortScenic: true,
    vibe: "30-ft glacial pothole waterfall — highway leg-stretcher",
  },
  // Flume Gorge — Sunday STOP 1
  {
    id: "flume-gorge",
    name: "Flume Gorge",
    category: "scenic",
    coords: { lat: 44.1029, lng: -71.6811 },
    address: "Franconia Notch State Park, Lincoln, NH 03251",
    description:
      "An 800-foot-long natural granite gorge with vertical 70-90 ft walls, discovered in 1808 by 93-year-old 'Aunt' Jess Guernsey while fishing. A 2-mile loop boardwalk trail takes you THROUGH the gorge on wooden boardwalks bolted directly to the granite walls, with roaring waterfalls crashing beneath your boots. The narrowest point is just 12 feet wide with granite walls towering 90 feet above. The loop continues past Avalanche Falls, through a covered bridge, past the boulder field called 'The Glacial Erratics', and returns via a scenic forest path. One of the most photographed natural features in New England — and zero strenuous hiking required.",
    highlights: [
      "800-ft natural granite gorge with 90-ft walls",
      "Boardwalks bolted INTO the gorge walls",
      "Avalanche Falls inside the gorge",
      "Covered bridge & glacial boulders",
      "2-mile loop, mostly flat boardwalk",
      "Sunday STOP 1 — 'The Beautiful'",
    ],
    tips: [
      "Open May-October only — perfect for August 9 visit.",
      "$8 entry fee (adult) — buy tickets online in advance to skip the line.",
      "Walk the loop counter-clockwise (right at the entrance) to enter the gorge from the top and walk down with the water.",
      "Wear shoes with grip — boardwalks can be slippery from mist.",
      "Bring a light rain jacket — you WILL get wet inside the gorge from spray.",
      "Allow 1.5-2 hours for the full loop with photo stops.",
    ],
    cost: "$8 per adult (kids 6-11 $6, under 6 free)",
    imageKeys: ["flume_gorge_real", "franconia_notch"],
    effort: "easy",
    trailDistance: "2-mile loop on boardwalk",
    lowEffortScenic: true,
    vibe: "Walk THROUGH an 800-ft granite gorge — Sunday 'Beautiful' stop",
  },
  // Echo Lake Beach — easy beach in Franconia Notch
  {
    id: "echo-lake",
    name: "Echo Lake Beach",
    category: "water",
    coords: { lat: 44.1714, lng: -71.6833 },
    address: "Franconia Notch State Park, Lincoln, NH",
    description:
      "A 16-acre spring-fed mountain lake nestled at the base of Cannon Mountain with a sandy swimming beach and easy 1-mile walking loop around the entire shoreline. The lake is dramatically framed by the vertical granite cliffs of Cannon Mountain and Eagle Cliff — making it one of the most photogenic swimming holes in New England. The water is cool and clear, the beach is sandy and shallow (perfect for wading), and the flat loop trail takes 20 minutes at a leisurely pace. Cannon Cliff looms 1,800 feet above — the same cliff face that once held the Old Man of the Mountain.",
    highlights: [
      "16-acre spring-fed mountain lake",
      "Sandy swimming beach with shallow entry",
      "1-mile flat loop around the entire lake",
      "Cannon Mountain cliff backdrop (1,800 ft)",
      "Bathhouse, changing rooms, and picnic tables",
      "Easy 5-min drive from Old Man Memorial",
    ],
    tips: [
      "Arrive by 10 AM on summer weekends — small lot fills fast.",
      "$5 parking fee (separate from Flume Gorge fee).",
      "Water temp in August is a refreshing 68-72°F.",
      "Walk the loop clockwise — best views of Cannon Cliff are on the far side.",
      "Combine with Flume Gorge and Old Man Memorial for a full Franconia Notch day.",
    ],
    cost: "$5 parking (free with NH State Parks pass)",
    imageKeys: ["echo_lake", "franconia_notch"],
    effort: "none",
    trailDistance: "1 mi flat loop (optional)",
    lowEffortScenic: true,
    vibe: "Sandy beach beneath 1,800-ft Cannon Cliff — easy swim & walk",
  },
  // Artists Bluff — short iconic overlook (moderate but SHORT)
  {
    id: "artists-bluff",
    name: "Artists Bluff Trail",
    category: "scenic",
    coords: { lat: 44.1696, lng: -71.6845 },
    address: "Franconia Notch State Park (park at Echo Lake lot)",
    description:
      "The most photographed overlook in the White Mountains — a 1.2-mile loop trail that climbs just 250 feet to a granite ledge overlooking Echo Lake, with Cannon Mountain and the Kinsman Range filling the background. This is the iconic 'lake-with-mountains' New Hampshire calendar shot. The trail is short and the payoff is enormous. Start at the Echo Lake parking lot and climb the steep-but-short ascent to the bluff, then descend via the loop back to the lot. The total elevation gain is only 250 feet but the views are world-class — a perfect low-effort/high-reward hike.",
    highlights: [
      "Most photographed overlook in NH",
      "1.2-mile loop with only 250 ft elevation gain",
      "Iconic view of Echo Lake + Cannon Mountain",
      "The 'NH calendar shot' — stunning fall foliage views",
      "Easy access from Echo Lake lot",
    ],
    tips: [
      "Park at Echo Lake beach lot — trailhead is across the street.",
      "Go counter-clockwise: climb the steep part first, descend via the longer route.",
      "Best in morning light (8-10 AM) for sun on Cannon Cliff.",
      "Bring a phone/camera — you will take 50+ photos.",
      "Add 30 minutes for photo stops.",
    ],
    cost: "$5 Echo Lake parking fee",
    imageKeys: ["artists_bluff", "franconia_notch"],
    effort: "moderate",
    trailDistance: "1.2 mi loop, 250 ft elevation gain",
    lowEffortScenic: true,
    vibe: "The 'NH calendar shot' — 1.2-mi loop, 250 ft climb, world-class payoff",
  },
  // Sabbaday Falls — Kancamagus, easy 0.5 mi loop
  {
    id: "sabbaday-falls",
    name: "Sabbaday Falls",
    category: "scenic",
    coords: { lat: 43.9853, lng: -71.4457 },
    address: "Kancamagus Highway, Albany, NH",
    description:
      "A spectacular 35-foot cascading waterfall plunging through a narrow carved granite chute into a deep emerald pool. The trail is a flat, easy 0.5-mile loop (15 minutes total) on a well-maintained path through old-growth hemlock forest. The falls drop in three tiers — first a 10-foot slide, then the main 25-foot punchbowl cascade, then a final 5-foot drop into the lower pool. The water has carved a perfect horizontal groove into the granite at the main drop — a 5-foot-deep undercut that's a marvel of erosion. One of the most rewarding low-effort waterfall stops in the White Mountains, just off the famous Kancamagus Highway.",
    highlights: [
      "35-ft three-tiered cascade through carved granite",
      "0.5-mile flat loop trail (15 minutes)",
      "Deep emerald punchbowl pool",
      "Old-growth hemlock forest",
      "Right off the Kancamagus Highway",
      "FREE — no parking fee",
    ],
    tips: [
      "Best flow in spring/early summer — August flow is still lovely but lower.",
      "Walk the loop counter-clockwise to see the falls from below first.",
      "DO NOT swim — the pool is deceptively cold and the current is strong.",
      "Combine with Lower Falls (8 mi west) and Rocky Gorge (5 mi west) for a Kancamagus waterfall trifecta.",
      "Picnic tables at the trailhead — pack lunch.",
    ],
    cost: "FREE",
    imageKeys: ["sabbaday_falls", "franconia_notch"],
    effort: "easy",
    trailDistance: "0.5 mi flat loop",
    lowEffortScenic: true,
    vibe: "35-ft cascading falls on a 0.5-mi flat loop — Kancamagus gem",
  },
  // Lower Falls — Kancamagus, easy swimming hole
  {
    id: "lower-falls",
    name: "Lower Falls on the Swift River",
    category: "water",
    coords: { lat: 44.0229, lng: -71.5273 },
    address: "Kancamagus Highway, Conway, NH",
    description:
      "The most popular swimming hole in the White Mountains — a series of small waterfalls and smooth granite slides on the Swift River, with deep clear pools perfect for cooling off in August. The 'beach' is smooth granite bedrock worn into natural lounge chairs. Zero hiking required — park in the lot and walk 200 feet to the water. The falls are small (4-8 ft) but the swimming is excellent, the water is crystal clear, and the smooth granite slides make natural water parks. A 5-star stop for hot August afternoons on the drive home.",
    highlights: [
      "Natural granite water slides on Swift River",
      "Zero hiking — 200 ft from parking lot",
      "Deep clear swimming pools",
      "Smooth granite 'beach' for sunbathing",
      "Picnic tables & changing rooms",
      "FREE — perfect August cooldown",
    ],
    tips: [
      "Arrive before 11 AM on summer weekends — small lot fills fast.",
      "Water shoes recommended — granite is slippery when wet.",
      "Watch kids closely — current is strong near the main falls.",
      "Walk 0.3 mi upstream to find quieter pools away from the main crowd.",
      "Combine with Sabbaday Falls (8 mi east) and Rocky Gorge (3 mi east).",
    ],
    cost: "FREE (parking fee during summer season)",
    imageKeys: ["lower_falls", "franconia_notch"],
    effort: "none",
    trailDistance: "200 ft from parking",
    lowEffortScenic: true,
    vibe: "Natural granite water slides & swimming pools — 200 ft walk",
  },
  // Rocky Gorge — Kancamagus scenic bridge
  {
    id: "rocky-gorge",
    name: "Rocky Gorge Scenic Area",
    category: "scenic",
    coords: { lat: 44.0108, lng: -71.5469 },
    address: "Kancamagus Highway, Albany, NH",
    description:
      "A dramatic 60-foot-long narrow granite gorge where the Swift River funnels through a steep-walled channel carved over millennia. A footbridge spans the gorge offering views straight down into the rushing water. Below the gorge, the river opens into Lower Falls swimming area. Above the gorge, the river is calmer and a short 0.3-mile trail leads to a beautiful meadow and beaver pond. Zero hiking required to see the gorge — park and walk 100 feet. One of the most photographed stops on the Kancamagus Highway and a perfect low-effort photo op.",
    highlights: [
      "60-ft narrow granite gorge on Swift River",
      "Footbridge with views straight down",
      "0.3-mi meadow trail (optional)",
      "Beaver pond upstream (wildlife)",
      "100 ft walk from parking — totally flat",
      "Most photographed Kancamagus stop",
    ],
    tips: [
      "Best in morning light — the gorge faces east.",
      "Walk across the footbridge and back — 5 minutes total.",
      "DO NOT climb into the gorge — fatal accidents have occurred.",
      "Look for the beaver lodge in the upstream pond — best at dawn/dusk.",
      "Combine with Lower Falls (3 mi west) for swimming.",
    ],
    cost: "FREE",
    imageKeys: ["rocky_gorge", "franconia_notch"],
    effort: "none",
    trailDistance: "100 ft walk (optional 0.3 mi meadow trail)",
    lowEffortScenic: true,
    vibe: "60-ft granite gorge & footbridge — most photographed Kancamagus stop",
  },
  // Benson Park — Sunday STOP 2 (The Weird)
  {
    id: "benson-park",
    name: "Benson Park (Abandoned Wild Animal Farm)",
    category: "historic",
    coords: { lat: 42.7645, lng: -71.4397 },
    address: "19 Kimball Hill Rd, Hudson, NH 03051",
    description:
      "An eerie, fascinating 165-acre park on the ruins of Benson's Wild Animal Farm — a beloved NH roadside attraction that operated from 1927 to 1987 with elephants, gorillas, lions, and trained animal shows. Today the park preserves the overgrown concrete ruins: an elephant barn with steel tether rings still in the floor, a massive gorilla cage, a Kiddie Zoo building, old signs, and stone walls all being slowly reclaimed by forest. Walk the easy 1.5-mile paved loop through the property and explore 'abandoned Jurassic Park' vibes. Strange, beautiful, and uniquely NH —'s 'Sunday Stop 2: The Weird'.",
    highlights: [
      "Ruins of 1927-1987 Benson's Wild Animal Farm",
      "Concrete elephant barn with original tether rings",
      "Massive gorilla cage (where 'Tony the Gorilla' lived)",
      "1.5-mile paved walking loop",
      "Old kiddie zoo & trained animal show signs",
      "Sunday STOP 2 — 'The Weird'",
    ],
    tips: [
      "FREE parking & admission — Hudson town park.",
      "Bring a camera — the overgrown ruins are spectacularly photogenic.",
      "Allow 45 min - 1 hour for the loop with stops.",
      "Best lighting is late afternoon (golden hour on the ruins).",
      "Read the interpretive signs — the farm's history is wild (trained-chimp shows, gorilla that drank Coke, elephant rides).",
      "Combine with a final fuel-up in nearby Nashua before the last stretch home.",
    ],
    cost: "FREE",
    imageKeys: ["benson_park"],
    effort: "easy",
    trailDistance: "1.5 mi paved loop",
    lowEffortScenic: true,
    vibe: "Eerie ruins of 1927 animal farm — Sunday 'Weird' stop",
  },
  // Profile Lake — roadside view of where Old Man was
  {
    id: "profile-lake",
    name: "Profile Lake",
    category: "water",
    coords: { lat: 44.1597, lng: -71.6795 },
    address: "Franconia Notch State Park, Lincoln, NH",
    description:
      "A 13-acre mountain lake sitting directly beneath the cliff where the Old Man of the Mountain once watched over Franconia Notch. The lake is the official viewing point for the Old Man Memorial Plaza and is also a designated fly-fishing-only trout pond. Walk the flat, 0.3-mile shoreline path for the iconic view up at Cannon Cliff — the same cliff that held the Old Man. The lake is spring-fed, crystal clear, and stocked with brook trout. Even if you don't fish, the views of the cliff reflection in the still water are stunning, especially in morning light.",
    highlights: [
      "13-acre spring-fed mountain lake",
      "Directly beneath Old Man of the Mountain cliff",
      "Fly-fishing-only trout pond",
      "0.3-mile flat shoreline path",
      "Cannon Cliff reflection photos",
      "Old Man Memorial Plaza is here",
    ],
    tips: [
      "Best reflection photos before 10 AM (water is calmest).",
      "Fly fishing only — no bait or lures. NH license required.",
      "Walk to the far end of the lake for the best cliff view.",
      "Combine with Old Man Memorial (same parking lot) and Echo Lake (1 mi north).",
    ],
    cost: "FREE (NH State Parks $5 parking fee)",
    imageKeys: ["franconia_notch", "old_man_mountain"],
    effort: "none",
    trailDistance: "0.3 mi flat shoreline",
    lowEffortScenic: true,
    vibe: "Mountain lake beneath the Old Man cliff — best Cannon Cliff reflections",
  },
];

// ============= DRIVING LEGS =============
export const DRIVE_LEGS: DriveLeg[] = [
  {
    id: "leg-1",
    from: "Westborough, MA",
    to: "Bear Brook State Park",
    miles: 80,
    duration: "1h 30m",
    day: "Tuesday",
    notes: "Pack up camp gear, drive north. Check in by 1:00 PM.",
  },
  {
    id: "leg-2",
    from: "Bear Brook State Park",
    to: "Pawtuckaway State Park",
    miles: 20,
    duration: "30m",
    day: "Thursday",
    notes: "Short morning drive east. Stop for cooler ice re-up along the way.",
  },
  {
    id: "leg-3",
    from: "Pawtuckaway State Park",
    to: "Lincoln, NH Rail Platform",
    miles: 85,
    duration: "1h 20m",
    day: "Friday Morning",
    notes: "Depart 11:00 AM, arrive 12:45 PM for strict 1:00 PM train departure.",
  },
  {
    id: "leg-4",
    from: "Lincoln, NH",
    to: "Dixville Notch Proposal Site",
    miles: 75,
    duration: "1h 30m",
    day: "Friday Afternoon",
    notes: "North up I-93 through Franconia Pass, past Lancaster & Groveton to Colebrook, then Route 26 East.",
  },
  {
    id: "leg-5",
    from: "Dixville Notch",
    to: "Coleman State Park Basecamp",
    miles: 12,
    duration: "20m",
    day: "Friday Night",
    notes: "Quick celebratory post-proposal drive north to Coleman Estates Lodge for check-in.",
  },
  {
    id: "leg-6",
    from: "Coleman State Park",
    to: "Westborough, MA",
    miles: 212,
    duration: "3h 50m",
    day: "Sunday Return",
    notes: "Long scenic transit home. Plan stops for fuel and stretch breaks.",
  },
];

// ============= DAY PLANS =============
export const DAY_PLANS: DayPlan[] = [
  {
    day: "Day 1",
    date: "Tuesday, August 4, 2026",
    title: "The Off-Grid Escape",
    emoji: "🚗",
    theme: "DETOX",
    description:
      "Pack up camp gear in Westborough, MA and drive 81 miles north to Bear Brook State Park. Check into Oaks Cabin 1 by 1:00 PM. Unwind, lock devices in the trunk, and ignite the first campfire cookbook dinner under the pines. This is the deep detox window — no screens, no electricity, no schedule except the sun and the fire.",
    placeIds: ["bear-brook"],
    legId: "leg-1",
    highlights: [
      "81-mile drive from Westborough, MA",
      "Check-in at Oaks Cabin 1 by 1:00 PM",
      "Devices locked in trunk",
      "First campfire dinner",
    ],
    color: "from-emerald-900 via-emerald-700 to-amber-700",
  },
  {
    day: "Day 2",
    date: "Wednesday, August 5, 2026",
    title: "Still Waters & Wildlife",
    emoji: "🥾",
    theme: "EXPLORE",
    description:
      "Morning: Hike the scenic 2.5-mile Catamount Hill Loop for a panoramic forest view from a flat granite ledge. Afternoon: Explore the historic 1930s CCC Barracks Museum. Late afternoon: A silent sunset canoe paddle on Beaver Pond — watch for native beavers emerging at twilight as the water turns to glass.",
    placeIds: ["catamount-hill", "ccc-museum", "beaver-pond"],
    highlights: [
      "Catamount Hill Loop morning hike",
      "CCC Museum afternoon history",
      "Beaver Pond sunset paddle",
      "Active beaver sightings at twilight",
    ],
    color: "from-amber-800 via-yellow-700 to-emerald-700",
  },
  {
    day: "Day 3",
    date: "Thursday, August 6, 2026",
    title: "The Powered Preparation",
    emoji: "⚡",
    theme: "RECHARGE",
    description:
      "11:00 AM: Leave Bear Brook and drive 30 minutes east to Pawtuckaway State Park. 1:00 PM: Unlock Cabin 4 on Big Island — immediately plug in all camera arrays, back up power banks, and portable fans! 5:30 PM: Walk down to the massive freshwater sandy beach for an isolated sunset soak once the daily crowds leave.",
    placeIds: ["pawtuckaway", "glacial-erratics", "pawtuckaway-beach"],
    legId: "leg-2",
    highlights: [
      "30-min drive east to Pawtuckaway",
      "Cabin 4 check-in with POWER",
      "Full electronic recharge cycle",
      "Private beach sunset after 5:30 PM",
      "Glacial Erratics Boulder Trail",
    ],
    color: "from-sky-800 via-cyan-700 to-amber-700",
  },
  {
    day: "Day 4",
    date: "Friday, August 7, 2026",
    title: "THE BIG PROPOSAL DAY",
    emoji: "💍",
    theme: "THE MOMENT",
    description:
      "11:00 AM: Check out of Pawtuckaway → drive north into the White Mountains. 1:00 PM: Board the Granite State Scenic Railway in Lincoln for a romantic riverside charcuterie lunch excursion. 2:20 PM: Quick 15-min leg-stretcher at The Basin in Franconia Notch — a 30-ft glacial pothole waterfall. 2:40 PM: Stop at the Old Man of the Mountain Memorial Plaza — the iconic 'man face rock' that was NH's state symbol until it collapsed in 2003. Steel profilers recreate the face from the exact original viewing angle. 5:30 PM: Deploy the surprise landscape painting date setup at the edge of Lake Gloriette in Dixville Notch. 7:00 PM: Photo team sneaks into hidden tracking slots along the highway brush line. 7:30 PM: THE PROPOSAL — drop to one knee as the setting sun turns the 1,000-foot vertical granite cliffs pink and orange. Night: Drive 20 minutes north to Coleman State Park and celebrate inside the cozy Perch Cabin.",
    placeIds: ["granite-railway", "the-basin", "old-man-mountain", "balsams-resort", "dixville-notch", "table-rock", "coleman-sp"],
    legId: "leg-3",
    highlights: [
      "Granite State Scenic Railway 1:00 PM departure",
      "The Basin waterfall leg-stretcher @ 2:20 PM",
      "Old Man of the Mountain Memorial @ 2:40 PM — the 'man face rock'",
      "Lake Gloriette painting setup @ 5:30 PM",
      "Photographer team in position @ 7:00 PM",
      "THE PROPOSAL @ 7:30 PM sharp",
      "1,000-ft granite cliffs turn pink & orange",
      "Perch Cabin celebration @ Coleman State Park",
    ],
    color: "from-rose-900 via-pink-800 to-amber-700",
  },
  {
    day: "Day 5",
    date: "Saturday, August 8, 2026",
    title: "Frontier Horizons & Dark Skies",
    emoji: "🌌",
    theme: "CELEBRATE",
    description:
      "Afternoon: Journey to Pittsburg, NH and hike the border circuit to stand directly on the physical US-Canada line ('The Slash'). 8:30 PM: Take a twilight run up Route 3 through 'Moose Alley' to locate giant native moose feeding in the peat bogs. 2:00 AM: Leverage an exceptional Bortle Class 2 star field to view the Milky Way and take a celebratory dip in Little Diamond Pond!",
    placeIds: ["border-slash", "moose-alley", "little-diamond-pond"],
    highlights: [
      "US-Canada border 'Slash' hike",
      "Moose Alley twilight wildlife run @ 8:30 PM",
      "2:00 AM Milky Way viewing",
      "Midnight celebratory pond swim",
      "Bortle Class 2 dark sky",
    ],
    color: "from-indigo-950 via-violet-900 to-emerald-800",
  },
  {
    day: "Day 6",
    date: "Sunday, August 9, 2026",
    title: "The Double-Header Grand Finale",
    emoji: "🥐",
    theme: "GRAND FINALE",
    description:
      "Morning: Toast your engagement with fresh almond croissants and espresso at Le Rendez-Vous French Bakery in Colebrook. 10:15 AM: Flat 5-min stroll to Huntington Cascades double-tiered waterfall. Noon: Sunday Double-Header Stop 1 'The Beautiful' — Flume Gorge, walking the 2-mi boardwalk through an 800-ft granite gorge. 2 PM: Mountain lunch in Lincoln. 3:30 PM: Sunday Double-Header Stop 2 'The Weird' — Benson Park, exploring the eerie ruins of an abandoned 1927 wild animal farm. 4:30 PM: Smooth cruise home to Westborough, MA.",
    placeIds: ["le-rendez-vous", "huntington-falls", "flume-gorge", "benson-park"],
    legId: "leg-6",
    highlights: [
      "Le Rendez-Vous almond croissants & espresso",
      "Huntington Cascades 5-min approach walk",
      "STOP 1 'The Beautiful': Flume Gorge 2-mi boardwalk @ noon",
      "STOP 2 'The Weird': Benson Park abandoned animal farm @ 3:30 PM",
      "212-mile scenic drive home",
      "Engagement celebration conclusion",
    ],
    color: "from-amber-700 via-orange-700 to-emerald-800",
  },
];

// ============= POTENTIAL SITES =============
export const POTENTIAL_SITES: PotentialSite[] = [
  // Near Bear Brook / Pawtuckaway (Central/Southern NH)
  {
    id: "nearby-mount-major",
    name: "Mount Major",
    category: "hike",
    coords: { lat: 43.5108, lng: -71.2702 },
    description:
      "A popular 3.6-mile loop hike in Alton, NH with sweeping views of Lake Winnipesaukee from the summit granite ledges. About 35 miles north of Bear Brook — a worthwhile detour if you want a more challenging hike than Catamount Hill.",
    closestMainStop: "Bear Brook State Park (~35 mi)",
    imageKey: "hiking",
    why: "Best panoramic view hike in the lakes region — solid half-day trip option.",
  },
  {
    id: "nearby-winnipesaukee",
    name: "Lake Winnipesaukee",
    category: "water",
    coords: { lat: 43.6404, lng: -71.2845 },
    description:
      "New Hampshire's largest lake (44,000 acres) with 183 miles of shoreline. Day-trip options from Bear Brook or Pawtuckaway include boat rentals, lakeside dining in Wolfeboro or Meredith, and the MS Mount Washington scenic cruise.",
    closestMainStop: "Pawtuckaway State Park (~40 mi)",
    imageKey: "canoe",
    why: "Classic NH lakes region experience — lakeside dining and boat cruises available.",
  },
  // Near Lincoln / Franconia (White Mountains)
  {
    id: "nearby-flume-gorge",
    name: "Flume Gorge",
    category: "scenic",
    coords: { lat: 44.1029, lng: -71.6811 },
    description:
      "An 800-foot-long natural granite gorge with 70-90 ft walls in Franconia Notch State Park. A 2-mile loop boardwalk trail takes you through the gorge, past waterfalls, and through a covered bridge. Open May-October, $8 entry fee. A perfect add-on if you have time before or after the Granite State Scenic Railway.",
    closestMainStop: "Lincoln, NH rail platform (~6 mi)",
    imageKey: "flume",
    why: "Most photographed natural feature in NH — spectacular narrow granite walls.",
  },
  {
    id: "nearby-basin",
    name: "The Basin at Franconia Notch",
    category: "scenic",
    coords: { lat: 44.1089, lng: -71.6833 },
    description:
      "A 20-foot-diameter pothole carved into granite by the Pemigewasset River over thousands of years. Right off I-93 in Franconia Notch — a 5-minute walk from the parking lot. Free to visit. The river plunges into the basin and continues through a narrow chute, making for dramatic photos and a refreshing mist on hot summer days.",
    closestMainStop: "Lincoln, NH rail platform (~5 mi)",
    imageKey: "waterfall",
    why: "Iconic NH roadside attraction — perfect quick stop on the drive north.",
  },
  {
    id: "nearby-mt-washington",
    name: "Mount Washington",
    category: "scenic",
    coords: { lat: 44.2706, lng: -71.3033 },
    description:
      "The highest peak in the northeastern US (6,288 ft), famous for the 'world's worst weather' — a wind speed record of 231 mph was set here in 1934. Visible from I-93 as you drive through Franconia Pass. Drive the Mt. Washington Auto Road ($35 per car) or take the Cog Railway ($72) to the summit. The summit observatory and Tip Top House are worth the trip if you have a free morning.",
    closestMainStop: "Lincoln, NH (~40 mi)",
    imageKey: "mtwashington",
    why: "Highest peak in NE USA — bucket-list side trip if time allows.",
  },
  {
    id: "nearby-cannon-mtn",
    name: "Cannon Mountain Aerial Tramway",
    category: "scenic",
    coords: { lat: 44.1569, lng: -71.6894 },
    description:
      "A 5-minute aerial tramway ride to the 4,080-ft summit of Cannon Mountain, offering 360-degree views of the White Mountains and into Canada on clear days. $25 per adult. Located in Franconia Notch State Park, just 10 minutes north of Lincoln — an easy add-on if you arrive early for the railway.",
    closestMainStop: "Lincoln, NH rail platform (~8 mi)",
    imageKey: "mtwashington",
    why: "Easy summit views without hiking — tram ride is itself an experience.",
  },
  {
    id: "nearby-clarks-trading-post",
    name: "Clark's Trading Post",
    category: "historic",
    coords: { lat: 44.0456, lng: -71.6717 },
    description:
      "A classic White Mountains roadside attraction since 1928, featuring trained bear shows, an old-time steam train ride, and a museum of oddities. Located in Lincoln, NH — walking distance from the rail platform. A fun, kitschy pre-train departure activity if you arrive early in Lincoln.",
    closestMainStop: "Lincoln, NH rail platform (~0.5 mi)",
    imageKey: "railway",
    why: "Quirky classic NH attraction — walkable from the railway platform.",
  },
  // Near Dixville Notch / Colebrook
  {
    id: "nearby-lake-umbagog",
    name: "Lake Umbagog National Wildlife Refuge",
    category: "wildlife",
    coords: { lat: 44.7333, lng: -71.0667 },
    description:
      "A 7,800-acre pristine lake straddling the NH-Maine border, known for bald eagle nesting sites, loon populations, and moose sightings. Canoe and kayak rentals available in Errol, NH. About 25 miles east of Dixville Notch — a beautiful detour on the drive up to Coleman State Park.",
    closestMainStop: "Dixville Notch (~25 mi)",
    imageKey: "canoe",
    why: "Top wildlife refuge in NH — eagles, loons, and moose in pristine habitat.",
  },
  {
    id: "nearby-moose-falls",
    name: "Beaver Brook Falls Natural Area",
    category: "scenic",
    coords: { lat: 44.8833, lng: -71.4500 },
    description:
      "A roadside 30-foot cascading waterfall on Route 145 just north of Colebrook. Small natural area with picnic tables and a short trail. A nice quick stop on your Sunday morning drive between Le Rendez-Vous bakery and Huntington Cascades.",
    closestMainStop: "Colebrook, NH (~5 mi)",
    imageKey: "waterfall",
    why: "Easy roadside cascade — quick photo stop on the Sunday drive.",
  },
  {
    id: "nearby-coos-trail",
    name: "Cohos Trail Section 1",
    category: "hike",
    coords: { lat: 45.0756, lng: -71.3542 },
    description:
      "The northernmost section of the 170-mile Cohos Trail, running from Coleman State Park to the Canadian border. Even a short 2-3 mile out-and-back section offers a taste of remote Great North Woods hiking through boreal forest, with chances to see moose, bear, and boreal birds. Trailheads are accessible from Route 3 near Pittsburg.",
    closestMainStop: "Coleman State Park (~3 mi)",
    imageKey: "hiking",
    why: "Bucket-list long-distance trail — sample a remote northern NH section.",
  },
  // Near Coleman / Pittsburg
  {
    id: "nearby-fourth-ct-lake",
    name: "4th Connecticut Lake",
    category: "water",
    coords: { lat: 45.3117, lng: -71.3583 },
    description:
      "The smallest and northernmost of the Connecticut Lakes, sitting right on the US-Canada border. The source of the Connecticut River — a 1.2-mile loop trail leads to this pristine pond. Part of the Border Slash hike — you'll see this lake as part of that circuit.",
    closestMainStop: "Coleman State Park (~22 mi)",
    imageKey: "canoe",
    why: "Source of the Connecticut River — historic hydrological landmark.",
  },
  {
    id: "nearby-bear-rock",
    name: "Garfield Ridge / Mount Garfield",
    category: "hike",
    coords: { lat: 44.2056, lng: -71.6217 },
    description:
      "A 5-mile round-trip hike to a 4,500-ft summit with panoramic White Mountain views, located along the drive between Lincoln and Dixville Notch. Skip if pressed for time on Friday, but a superb hike if you can extend the trip by a day. The summit ledges offer one of the best 360-degree views in the Whites for the hiking effort.",
    closestMainStop: "Lincoln, NH (~15 mi)",
    imageKey: "hiking",
    why: "Best summit-to-effort ratio in the Whites — panoramic views.",
  },
  // === NEW LOW-EFFORT NEARBY STOPS (user-requested) ===
  {
    id: "nearby-cannon-tramway",
    name: "Cannon Mountain Aerial Tramway",
    category: "scenic",
    coords: { lat: 44.1569, lng: -71.6894 },
    description:
      "A 5-minute aerial tramway ride to the 4,080-ft summit of Cannon Mountain — the same mountain that once held the Old Man of the Mountain. The tram runs every 15 minutes in summer and offers 360-degree views extending to Canada and the Atlantic on clear days. At the summit: an observation tower, short Rim Trail (0.5 mi, easy), and a cafeteria. ZERO hiking required to reach a 4,000+ ft summit — perfect for visitors who want White Mountain summit views without the climb.",
    closestMainStop: "Old Man Memorial (~1 mi north)",
    imageKey: "cannon_aerial",
    why: "5-min tram ride to a 4,080-ft summit — zero hiking, Canada views on clear days",
  },
  {
    id: "nearby-kancamagus",
    name: "Kancamagus Highway Scenic Drive",
    category: "scenic",
    coords: { lat: 43.9853, lng: -71.4457 },
    description:
      "34-mile National Scenic Byway from Lincoln to Conway, considered one of the best fall foliage drives in the world. Even in August, the drive offers dramatic mountain vistas, river views, and access to multiple low-effort stops: Sabbaday Falls, Lower Falls swimming hole, Rocky Gorge, and the Albany Covered Bridge. Drive the full length in 1 hour with no stops, or budget 3-4 hours to explore. Multiple pull-offs with interpretive signs.",
    closestMainStop: "Lincoln, NH (start of byway)",
    imageKey: "franconia_notch",
    why: "World-famous scenic drive — multiple low-effort waterfall & swimming stops along the way",
  },
  {
    id: "nearby-albany-bridge",
    name: "Albany Covered Bridge",
    category: "historic",
    coords: { lat: 44.0123, lng: -71.5476 },
    description:
      "An 1858 Paddleford truss covered bridge spanning the Swift River on the Kancamagus Highway. One of the most photographed covered bridges in New England — park in the small lot and walk 100 feet onto the bridge. The bridge is still open to foot traffic (cars prohibited since 1984). Inside the bridge you can see the original hand-hewn timber construction. Combine with Rocky Gorge (same parking lot) and Lower Falls (3 mi west) for a perfect Kancamagus stop.",
    closestMainStop: "Kancamagus Highway (~5 mi east of Lincoln)",
    imageKey: "franconia_notch",
    why: "1858 covered bridge — 100 ft walk from parking, iconic NH photo op",
  },
  {
    id: "nearby-saco-river",
    name: "Saco River Swimming & Tubing",
    category: "water",
    coords: { lat: 44.0607, lng: -71.1317 },
    description:
      "The Saco River in Conway/North Conway is one of the warmest, cleanest rivers in New England — perfect for swimming, tubing, and canoeing in August. Multiple public access points with sandy beaches. Flat, lazy current makes it safe for all ages. Tube rentals available in Conway for ~$15/person for a 4-mile float. A perfect afternoon cooldown stop on the drive home via Route 302.",
    closestMainStop: "Conway, NH (~30 mi east of Lincoln)",
    imageKey: "lower_falls",
    why: "Warmest swimming river in NH — sandy beaches & lazy tube floats",
  },
  {
    id: "nearby-franconia-ridge",
    name: "Franconia Ridge Trail (Strenuous)",
    category: "hike",
    coords: { lat: 44.1408, lng: -71.6417 },
    description:
      "The legendary 8.6-mile loop over Mount Lafayette (5,260 ft), Mount Lincoln (5,089 ft), and Little Haystack (4,800 ft) — one of the most spectacular alpine ridge walks in the eastern US. Above treeline for 1.7 miles with 360° views. STRENUOUS — 3,900 ft elevation gain, 6-8 hours round trip. Only attempt if you have an extra day, are fit, and have proper gear. Otherwise, admire the ridge from below at Echo Lake or artists Bluff.",
    closestMainStop: "Franconia Notch (~3 mi from Old Man Memorial)",
    imageKey: "mtwashington",
    why: "Bucket-list White Mountain ridge walk — but STRENUOUS, plan a separate day",
  },
  {
    id: "nearby-bear-notch",
    name: "Bear Notch Road Scenic Drive",
    category: "scenic",
    coords: { lat: 44.0413, lng: -71.5381 },
    description:
      "An 8-mile scenic alternative cut-through between the Kancamagus Highway and Route 302 in Bartlett. Quiet, shaded by deep forest, with multiple pulloffs for photos and a beautiful covered bridge at the western end. A relaxing alternative to the busier highways, especially on the Sunday drive home.",
    closestMainStop: "Kancamagus Highway (~10 mi east of Lincoln)",
    imageKey: "franconia_notch",
    why: "Quiet scenic shortcut — alternate Sunday return route home",
  },
];

// ============= TRIP STATS =============
export const TRIP_STATS = {
  totalDays: 6,
  totalMiles: 586,
  stateParks: 3,
  stateParksList: ["Bear Brook", "Pawtuckaway", "Coleman"],
  proposalTimestamp: "Friday, August 7, 2026 @ 7:30 PM",
  ringEngraving: "8.7.26 | As One",
  tripStart: "Tuesday, August 4, 2026",
  tripEnd: "Sunday, August 9, 2026",
  majorStops: 27,
  nearbyRecommendations: 18,
  freeActivities: 22,
  bortleClass: 2,
  ringCoordinates: "44.870° N, -71.305° W",
  lowEffortStops: 11,
};

// ============= PRO TIPS =============
export const PRO_TIPS = [
  {
    icon: "🛏",
    title: "Boutique Bedding Upgrade",
    text: "All state park cabin beds are basic wooden frames supporting utility vinyl pads. Packing premium fitted sheets, full down pillows, and a high-loft duvet completely upgrades the cabin into a cozy, romantic mountain retreat!",
  },
  {
    icon: "💡",
    title: "Atmospheric Fairy Lights",
    text: "Bring a few bundles of battery-powered copper fairy lights. Hanging them along the exposed interior roof trusses of the Bear Brook and Coleman structures adds warm accent properties without requiring grid power interfaces.",
  },
  {
    icon: "🔥",
    title: "The Local Firewood Rule",
    text: "Out-of-state firewood is strictly illegal to move across New Hampshire borders due to wood-boring insect quarantines. Safe, dry campfire wood bundles are sold right on-site at the park store kiosks for ~$7.00 per bundle.",
  },
  {
    icon: "🦟",
    title: "Odorless Bug Defense",
    text: "August in the New Hampshire woods brings out mosquitoes and blackflies. Use a Picaridin-based bug barrier spray instead of DEET. It provides reliable defensive shielding without releasing a harsh chemical odor footprint, keeping the romantic mood fresh.",
  },
  {
    icon: "🗺",
    title: "Download Offline Maps Ahead",
    text: "Cell service drops to absolute zero once you travel North of Berlin, NH, and vanishes across the Pawtuckaway island loops. Before you leave Pawtuckaway on Friday morning, open your smartphone mapping app and hit 'Download Offline Area' covering the White Mountain and Coos County quadrants to secure real-time GPS direction processing without cellular arrays!",
  },
];
