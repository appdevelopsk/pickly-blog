import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/locales";
import { listArticles } from "@/lib/articles/registry";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { isArticleBodyTranslated } from "@/lib/i18n/loader";
import { ogImageUrl } from "@/lib/og";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const STATIC_PATHS = ["", "/articles", "/about", "/privacy", "/terms", "/contact", "/disclosure"];

const CATEGORIES = [
  "fitness", "food", "tech", "beauty", "home",
  "fashion", "finance", "travel", "parenting", "pets",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const out: MetadataRoute.Sitemap = [];

  // Static pages × 17 locales
  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      out.push({
        url: `${SITE_URL}/${locale}${path}/`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "monthly",
        priority: path === "" ? 1.0 : 0.5,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}/`]),
          ),
        },
      });
    }
  }

  // Category pages × 17 locales
  for (const cat of CATEGORIES) {
    for (const locale of LOCALES) {
      out.push({
        url: `${SITE_URL}/${locale}/category/${cat}/`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${SITE_URL}/${l}/category/${cat}/`]),
          ),
        },
      });
    }
  }

  // Articles × locales — only include pages that get built AND are actually
  // translated. A built-but-untranslated locale renders an English-fallback
  // body (a thin, mixed-language page); those are noindex'd in the page's
  // metadata, so they must stay out of the sitemap and the hreflang cluster too.
  for (const article of listArticles()) {
    const indexLocales = article.locales.filter(
      (l) =>
        LOCALES.includes(l) &&
        hasApprovedAds(article, l) &&
        isArticleBodyTranslated(article.slug, l),
    );
    if (indexLocales.length === 0) continue;
    for (const locale of indexLocales) {
      out.push({
        url: `${SITE_URL}/${locale}/articles/${article.slug}/`,
        lastModified: article.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        // Surface the 1000x1500 OG image in Google Images (image sitemap).
        images: [ogImageUrl(article.slug, locale)],
        alternates: {
          languages: Object.fromEntries(
            indexLocales.map((l) => [
              l,
              `${SITE_URL}/${l}/articles/${article.slug}/`,
            ]),
          ),
        },
      });
    }
  }

  return out;
}
