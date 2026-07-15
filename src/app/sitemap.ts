import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://w1jq650c98f0-d.space-z.ai";
  const routes = ["", "/trip", "/map", "/proposal", "/us", "/settings"];
  const now = new Date();

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : route === "/proposal" ? 0.9 : 0.7,
  }));
}
