import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Explicitly allow AdSense/AdBot crawlers before the wildcard rule
        userAgent: ["Mediapartners-Google", "AdsBot-Google"],
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/og/_raw/"],
      },
      {
        // Block AI crawlers from training on content (opt-out)
        userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
