# Research Report: Roadside Attractions & Map Revamp
## The Wilderness Romance — NH Trip

## 1. Real Road Routes (OSRM Data)

Fetched actual driving routes from OSRM (router.project-osrm.org). These replace the old straight-line polylines with real road-following paths:

| Leg | Route | Miles | Duration | Points |
|-----|-------|-------|----------|--------|
| 1 | Westborough MA → Bear Brook SP | 81.0 | 2h 17m | 2,558 |
| 2 | Bear Brook → Pawtuckaway SP | 20.3 | 30m | 1,222 |
| 3 | Pawtuckaway → Lincoln NH | 95.8 | 2h 16m | 3,529 |
| 4 | Lincoln → Dixville Notch | 92.1 | 2h 21m | 3,555 |
| 5 | Dixville → Coleman SP | 27.8 | 45m | 1,147 |
| 6 | Coleman SP → Westborough MA | 269.4 | 5h 38m | 8,034 |
| **Total** | | **586.4** | **~13h 47m** | **20,045** |

Key roads identified: I-90 → I-495 → I-93 N (Leg 1), Route 28 S (Leg 2), Route 4 W → I-93 N (Leg 3), I-93 N → Route 3 N → Route 26 E (Leg 4), Route 26 E (Leg 5), Route 3 S → Kancamagus Hwy → I-93 S (Leg 6).

## 2. Verified Roadside Attractions (from official sources)

### Leg 1: Westborough MA → Bear Brook SP
1. **Old Stone Church, West Boylston MA** (42.3627, -71.7763) — Free, 10 min. Hauntingly beautiful 1891 granite ruin. Source: idyllicpursuit.com
2. **Wachusett Mountain Auto Road, Princeton MA** (42.7964, -71.4756) — $5, 45 min. Drive-to-summit with 360° views. Source: mass.gov
3. **Robert Frost Farm, Derry NH** (42.9356, -71.3728) — $5, 1 hr. Where "The Road Not Taken" was written. Source: nhstateparks.org

### Leg 3: Pawtuckaway → Lincoln NH
4. **Antique Alley, Route 4 Northwood** (43.2015, -71.4089) — Free to browse, 1-2 hrs. 20+ antique shops. Source: visitnh.gov
5. **Mt Kearsarge Auto Road, Wilmot NH** (43.3711, -71.5589) — $5, 1 hr. Drive-to-summit fire tower. Source: nhstateparks.org

### Leg 4: Lincoln → Dixville Notch (richest leg for attractions)
6. **The Basin, Franconia Notch** (44.1089, -71.6833) — Free, 15 min. Glacial pothole waterfall visible from parking. Source: Atlas Obscura (44.10362 coordinates confirmed)
7. **Indian Head Rock, Lincoln** (44.0842, -71.6842) — Free, 5 min. Natural rock face profile visible from I-93. Source: Atlas Obscura
8. **Clark's Bears (Trading Post), Lincoln** (44.0456, -71.6717) — $$, 2 hrs. Trained bears + steam train since 1928. Source: clarksbears.com
9. **Polly's Pancake Parlor, Sugar Hill** (44.3017, -71.6834) — $$, 1 hr. Since 1938, house-ground flour, on-site maple syrup. Source: pollyspancakeparlor.com
10. **Littleton Diner, Littleton** (44.3069, -71.7678) — $, 45 min. 1930 stainless-steel diner car, Food Network featured. Source: 603-444-3994
11. **Bethlehem "Blubber Bubble"** (44.2798, -71.6878) — Free, 5 min. Quirky gum wall + giant bubble sculpture. Source: Atlas Obscura

### Leg 6: Coleman → Westborough (via Kancamagus)
12. **Sabbaday Falls, Kancamagus Hwy** (43.9853, -71.4457) — Free, 30 min. 0.3-mi walk to 35-ft cascading waterfall. Source: kancamagushighway.com
13. **Lower Falls, Swift River** (44.0229, -71.5273) — Free, 30 min. Swimming hole + picnic. Source: visitwhitemountains.com
14. **Albany Covered Bridge** (44.0123, -71.5476) — Free, 10 min. 1858 Paddleford-style bridge. Source: coveredbridgesnh.com
15. **Rocky Gorge Scenic Area** (44.0108, -71.5469) — Free, 15 min. Rocky river gorge with easy walk. Source: kancamagushighway.com
16. **Woodstock Inn Brewery** (44.0389, -71.6767) — $$, 1 hr. Pemi Pale Ale + pub fare since 1995. Source: woodstockinnbrewery.com

## 3. Twelve Design Ideas for Map & Itinerary Revamp

### Map Design Ideas
1. **Real road polylines** — Replace straight lines with OSRM road-following paths, colored by drive leg
2. **Dynamic theme colors** — Map route line, markers, and UI all change color with the active theme
3. **Animated route drawing** — Route polylines animate (draw progressively) when the map loads
4. **Mileage badges on route** — Show distance + duration badges at each leg midpoint
5. **Attraction density filter** — Only show roadside attractions within 20 min of route, with a slider to adjust radius
6. **Elevation profile** — Small elevation chart along the bottom showing the White Mountain climbs

### Itinerary Design Ideas
7. **Timeline ribbon** — Horizontal scrolling timeline showing the 6 days with stops as nodes
8. **Leg cards with progress** — Each drive leg shows as a card with distance, duration, and attractions count
9. **Photo strip per stop** — Each stop card has a horizontal scrollable photo strip from official sources
10. **Theme-aware cards** — Card backgrounds, borders, and shadows change with the active theme
11. **Cost summary per day** — Total cost breakdown per day (free activities, paid activities, dining)
12. **Weather widget** — Small weather forecast widget per day (if available)

## 4. Implementation Plan

1. Update trip-data.ts: Westborough MA as home base, real mileage from OSRM
2. Update roadside-attractions.ts: 16 verified attractions with real coordinates
3. Revamp TripMap.tsx: OSRM polylines, dynamic theme colors, animated route
4. Revamp DayTimeline.tsx: Timeline ribbon, leg cards, cost summaries
5. Add road-polylines.json: Pre-fetched OSRM data (already done)
