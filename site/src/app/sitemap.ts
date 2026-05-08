import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/locales";
import { listArticles } from "@/lib/articles/registry";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const STATIC_PATHS = ["", "/articles", "/about", "/privacy", "/terms", "/contact", "/disclosure"];

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

  // Articles × locales the article supports
  for (const article of listArticles()) {
    for (const locale of article.locales) {
      out.push({
        url: `${SITE_URL}/${locale}/articles/${article.slug}/`,
        lastModified: article.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            article.locales.map((l) => [
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
