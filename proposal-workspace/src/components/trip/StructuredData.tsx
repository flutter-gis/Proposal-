/**
 * StructuredData.tsx — G-09
 *
 * JSON-LD structured data for search engine optimization.
 * Tells Google/Bing this is a travel guide with a specific itinerary,
 * making it eligible for rich results in travel searches.
 *
 * Schema types used:
 *   - TouristTrip: the overall 6-day road trip
 *   - TouristAttraction: each major stop along the route
 *   - Place: geographic coordinates for each stop
 *
 * All data is server-rendered (no "use client") so crawlers always see it.
 */

import { PLACES, TRIP_STATS, DAY_PLANS } from "@/lib/trip-data";

export default function StructuredData() {
  // Build TouristAttraction entries for each place with coords
  const attractions = PLACES.filter((p) => p.coords).map((p) => ({
    "@type": "TouristAttraction",
    name: p.name,
    description: p.description,
    address: p.address
      ? {
          "@type": "PostalAddress",
          streetAddress: p.address,
          addressRegion: "NH",
          addressCountry: "US",
        }
      : undefined,
    geo: {
      "@type": "GeoCoordinates",
      latitude: p.coords.lat,
      longitude: p.coords.lng,
    },
    url: `https://wilderness-romance.app/#${p.id}`,
  }));

  // Build the itinerary as an ItemList of TouristAttractions
  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: "The Wilderness Romance Adventure",
    description:
      "A 6-day New Hampshire wilderness road trip and proposal guide, exploring Bear Brook State Park, Pawtuckaway State Park, Dixville Notch, and Coleman State Park. The trip culminates in a sunset proposal at Lake Gloriette beneath Table Rock's 1,000-ft granite cliff.",
    startDate: "2026-08-04",
    endDate: "2026-08-09",
    touristType: "Wilderness / Romantic",
    provider: {
      "@type": "Organization",
      name: "Wilderness Romance",
    },
    itinerary: {
      "@type": "ItemList",
      itemListElement: DAY_PLANS.map((day, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${day.day}: ${day.title}`,
        description: day.description,
      })),
    },
    includesAttraction: attractions,
  };

  // WebApplication schema for the PWA itself
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "The Wilderness Romance Adventure",
    description:
      "Interactive 6-day New Hampshire wilderness road trip and proposal guide with maps, photos, and offline access.",
    applicationCategory: "TravelApplication",
    operatingSystem: "Any (PWA — works on iOS, Android, and desktop browsers)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    installUrl: "https://wilderness-romance.app/",
    permissions: "Offline-capable PWA. No account required.",
  };

  // BreadcrumbList for navigation context
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://wilderness-romance.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Trip",
        item: "https://wilderness-romance.app/#trip",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Map",
        item: "https://wilderness-romance.app/#map",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Proposal",
        item: "https://wilderness-romance.app/#proposal",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Us",
        item: "https://wilderness-romance.app/#us",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Settings",
        item: "https://wilderness-romance.app/#settings",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trip) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
