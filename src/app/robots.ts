import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://w1jq650c98f0-d.space-z.ai";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
