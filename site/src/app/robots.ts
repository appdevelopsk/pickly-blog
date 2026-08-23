import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

// AI answer/search crawlers — explicitly ALLOWED. LLM referrals (ChatGPT,
// Perplexity, …) already convert (see GROWTH_REPORT.md), so we want the content
// discoverable and citable across every assistant, not just the ones that slip
// through. (Previously these were blocked, costing Claude/Gemini/Apple/Meta
// citations.)
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",          // OpenAI (train + search + live fetch)
  "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai", "Claude-Web", // Anthropic
  "PerplexityBot", "Perplexity-User",                 // Perplexity
  "Google-Extended",                                  // Gemini / AI Overviews grounding
  "Applebot", "Applebot-Extended",                    // Apple Intelligence
  "Amazonbot", "meta-externalagent", "Bytespider", "CCBot", // Amazon / Meta AI / TikTok / Common Crawl
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // AdSense/AdBot crawlers before the wildcard rule
        userAgent: ["Mediapartners-Google", "AdsBot-Google"],
        allow: "/",
      },
      {
        // AI assistants: allow full crawl (drives citable LLM referral traffic)
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: ["/api/", "/og/_raw/", "/go/"],
      },
      {
        // NOTE: /_next/ must stay crawlable. Every page loads its CSS and JS
        // from /_next/static/, so disallowing it made Googlebot render the
        // whole site unstyled and script-less (2026-08-10). Only the API and
        // the raw OG endpoint are off-limits.
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/og/_raw/", "/go/"],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/web-stories/sitemap.xml`],
    host: SITE_URL,
  };
}
