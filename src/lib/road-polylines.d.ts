/**
 * road-polylines.json type definition
 */
export interface RoadLeg {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  distanceMiles: number;
  durationMinutes: number;
}

export interface RoadPolylines {
  legs: RoadLeg[];
  totalMiles: number;
  totalDurationMinutes: number;
  source: string;
  fetchedAt: string;
}
