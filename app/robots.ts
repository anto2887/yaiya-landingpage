import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Index the landing and privacy pages; keep the thank-you page, the API and the analytics proxy out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/thank-you", "/api/", "/ingest/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
