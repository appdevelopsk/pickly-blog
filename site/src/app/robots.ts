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
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/web-stories/sitemap.xml`,
      // 商品ページ 27,367URL(11ロケール分割・public/sitemaps/)は **意図的に外している**
      // (2026-09-09)。これを載せると Google へ提示する URL が 7,129 → 34,496 になり、
      // 商品ページだけで全体の79%を占めてクロール予算を食い潰していた。
      // 実測(gsc-index-status 2026-08-30, サンプル50): 登録済み18% / 「検出-未登録」58%
      // = 検出しても**クロールすらされない**状態。同一 Google アカウントで
      // fxea365(238URL)は68%、appdevelopsk(299URL)は70%登録されており、
      // URL数と登録率が綺麗に逆相関する。記事を読ませるために商品を下げる。
      //
      // 商品ページは削除も noindex もしていない。sitemap から外すだけで、
      // 内部リンク経由では follow される。失うものは GSC 28日でクリック1件のみ。
      // Bing / AI 検索(ChatGPT・Perplexity)は robots.txt の sitemap 宣言に依存せず
      // 独自にクロールするため、現在の主要流入には影響しない。
      // 復旧は下の1行を戻すだけ。生成物 public/sitemaps/products-*.xml は残してある。
      // `${SITE_URL}/sitemaps/products.xml`,
    ],
    host: SITE_URL,
  };
}
