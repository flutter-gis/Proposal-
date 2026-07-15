/**
 * fetch-routes.ts — Fetch real road polylines from OSRM API
 * 
 * Calls the public OSRM routing API to get actual driving routes
 * (not straight lines) for each of the 6 drive legs.
 * Saves results to src/lib/road-polylines.json
 */

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// Drive leg coordinates (lng,lat format for OSRM)
const LEGS = [
  {
    id: "leg-1",
    name: "Westborough MA → Bear Brook State Park",
    coords: [
      [-71.6154, 42.2711], // Westborough, MA
      [-71.4356, 42.9654], // Manchester, NH (via Route 3 / I-93)
      [-71.3917, 43.1145], // Bear Brook State Park
    ],
  },
  {
    id: "leg-2",
    name: "Bear Brook → Pawtuckaway State Park",
    coords: [
      [-71.3917, 43.1145], // Bear Brook
      [-71.2425, 43.1308], // Deerfield (Route 4)
      [-71.1933, 43.0833], // Pawtuckaway
    ],
  },
  {
    id: "leg-3",
    name: "Pawtuckaway → Lincoln NH",
    coords: [
      [-71.1933, 43.0833], // Pawtuckaway
      [-71.4089, 43.2015], // Northwood (Antique Alley)
      [-71.4708, 43.5276], // Laconia
      [-71.6889, 43.7574], // Plymouth
      [-71.6712, 44.0584], // Lincoln (Granite Railway)
    ],
  },
  {
    id: "leg-4",
    name: "Lincoln NH → Dixville Notch",
    coords: [
      [-71.6712, 44.0584], // Lincoln
      [-71.6798, 44.1072], // Franconia Notch
      [-71.7678, 44.3069], // Littleton
      [-71.5678, 44.4889], // Lancaster
      [-71.4989, 44.8934], // Colebrook
      [-71.3052, 44.8705], // Dixville Notch
    ],
  },
  {
    id: "leg-5",
    name: "Dixville Notch → Coleman State Park",
    coords: [
      [-71.3052, 44.8705], // Dixville Notch
      [-71.3195, 44.8694], // Balsams
      [-71.3267, 45.0647], // Coleman State Park
    ],
  },
  {
    id: "leg-6",
    name: "Coleman State Park → Westborough MA",
    coords: [
      [-71.3267, 45.0647], // Coleman SP
      [-71.4989, 44.8934], // Colebrook
      [-71.4457, 43.9853], // Kancamagus / Conway
      [-71.6889, 43.7574], // Plymouth
      [-71.5356, 43.2082], // Concord
      [-71.6154, 42.2711], // Westborough, MA
    ],
  },
];

interface OSRMResponse {
  code: string;
  routes: Array<{
    geometry: {
      type: string;
      coordinates: [number, number][]; // [lng, lat]
    };
    distance: number; // meters
    duration: number; // seconds
  }>;
}

async function fetchRoute(leg: typeof LEGS[0]): Promise<{
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  distanceMiles: number;
  durationMinutes: number;
}> {
  const coordString = leg.coords.map(c => `${c[0]},${c[1]}`).join(";");
  const url = `${OSRM_BASE}/${coordString}?overview=full&geometries=geojson`;

  console.log(`Fetching route for ${leg.id}: ${leg.name}...`);

  try {
    const response = await fetch(url);
    const data: OSRMResponse = await response.json();

    if (data.code !== "Ok" || !data.routes.length) {
      console.error(`❌ OSRM failed for ${leg.id}: ${data.code}`);
      return {
        id: leg.id,
        name: leg.name,
        coordinates: leg.coords.map(c => [c[1], c[0]] as [number, number]),
        distanceMiles: 0,
        durationMinutes: 0,
      };
    }

    const route = data.routes[0];
    // Convert [lng, lat] to [lat, lng] for Leaflet
    const coordinates = route.geometry.coordinates.map(
      (c) => [c[1], c[0]] as [number, number]
    );

    const distanceMiles = Math.round((route.distance / 1609.34) * 10) / 10;
    const durationMinutes = Math.round(route.duration / 60);

    console.log(`✅ ${leg.id}: ${coordinates.length} points, ${distanceMiles} mi, ${durationMinutes} min`);

    return {
      id: leg.id,
      name: leg.name,
      coordinates,
      distanceMiles,
      durationMinutes,
    };
  } catch (err) {
    console.error(`❌ Fetch failed for ${leg.id}: ${err}`);
    return {
      id: leg.id,
      name: leg.name,
      coordinates: leg.coords.map(c => [c[1], c[0]] as [number, number]),
      distanceMiles: 0,
      durationMinutes: 0,
    };
  }
}

async function main() {
  console.log("🚀 Fetching real road routes from OSRM...\n");

  const results = await Promise.all(LEGS.map(fetchRoute));

  const totalMiles = results.reduce((sum, r) => sum + r.distanceMiles, 0);
  const totalMinutes = results.reduce((sum, r) => sum + r.durationMinutes, 0);

  console.log(`\n📊 Total: ${totalMiles} mi, ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`);

  const output = {
    legs: results,
    totalMiles: Math.round(totalMiles * 10) / 10,
    totalDurationMinutes: totalMinutes,
    source: "OSRM (router.project-osrm.org)",
    fetchedAt: new Date().toISOString(),
  };

  const fs = await import("fs");
  const path = await import("path");
  const outputPath = path.join(process.cwd(), "src", "lib", "road-polylines.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved to ${outputPath}`);
}

main().catch(console.error);
