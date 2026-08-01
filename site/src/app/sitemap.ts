import type { MetadataRoute } from "next";
import { LOCALES, isIndexedLocale, DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { listArticles, listArticlesForLocale } from "@/lib/articles/registry";
import { isDeindexed } from "@/lib/articles/deindexed-slugs";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { isArticleBodyTranslated } from "@/lib/i18n/loader";
import { ogImageUrl } from "@/lib/og";
import { OCCASIONS } from "@/lib/pages/gift-config";
import { USE_CASES } from "@/lib/pages/usecase-config";
import { BRANDS } from "@/lib/pages/brand-config";
import { SALE_EVENTS } from "@/lib/pages/sale-config";
import { TAGS } from "@/lib/pages/tag-config";
import { COMPARISONS } from "@/lib/pages/compare-config";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const STATIC_PATHS = ["", "/articles", "/popular", "/new", "/best-2026", "/search", "/author", "/gifts", "/brands", "/tags", "/compare", "/about", "/privacy", "/terms", "/contact", "/disclosure", "/purpose", "/ranking"];

const BUDGETS = ["50", "100", "200", "500"];

const CATEGORIES = [
  "fitness", "food", "tech", "beauty", "home",
  "fashion", "finance", "travel", "parenting", "pets",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const out: MetadataRoute.Sitemap = [];
  // 検索インデックス対象ロケールのみ sitemap / hreflang に載せる（死蔵言語は除外）。
  const IDX = LOCALES.filter(isIndexedLocale);

  // Static pages × 17 locales
  for (const path of STATIC_PATHS) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}${path}/`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "monthly",
        priority: path === "" ? 1.0 : 0.5,
        alternates: {
          languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}${path}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}${path}/` },
        },
      });
    }
  }

  // Budget pages × 17 locales
  for (const budget of BUDGETS) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}/under/${budget}/`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}/under/${budget}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/under/${budget}/` },
        },
      });
    }
  }

  // Gift guide pages × 17 locales
  for (const occ of OCCASIONS) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}/gifts/${occ.slug}/`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}/gifts/${occ.slug}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/gifts/${occ.slug}/` } },
      });
    }
  }

  // Use-case pages × 17 locales
  for (const uc of USE_CASES) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}/for/${uc.slug}/`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}/for/${uc.slug}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/for/${uc.slug}/` } },
      });
    }
  }

  // Brand pages × 17 locales
  for (const brand of BRANDS) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}/brand/${brand.slug}/`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}/brand/${brand.slug}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/brand/${brand.slug}/` } },
      });
    }
  }

  // Sale event pages × 17 locales
  for (const ev of SALE_EVENTS) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}/sale/${ev.slug}/`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}/sale/${ev.slug}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/sale/${ev.slug}/` } },
      });
    }
  }

  // Tag pages × 17 locales
  for (const tag of TAGS) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}/tag/${tag.slug}/`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: { languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}/tag/${tag.slug}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/tag/${tag.slug}/` } },
      });
    }
  }

  // Compare pages。生成条件は compare/[pair] の generateStaticParams と同一にする。
  // 以前は COMPARISONS × IDX を無条件に出していたため、比較対象2記事のどちらも
  // そのロケールで出せない組み合わせ(=ページが生成されない)まで sitemap に載り、
  // 404 を指すURLが8件あった (2026-08-01)。
  const compareAvailable = (locale: string) =>
    new Set(
      listArticlesForLocale(locale)
        .filter((a) => hasApprovedAds(a, locale))
        .map((a) => a.slug),
    );
  const compareLocales = new Map(IDX.map((l) => [l, compareAvailable(l)]));
  for (const cmp of COMPARISONS) {
    const locales = IDX.filter((l) => {
      const av = compareLocales.get(l);
      return !!av && (av.has(cmp.slugA) || av.has(cmp.slugB));
    });
    for (const locale of locales) {
      out.push({
        url: `${SITE_URL}/${locale}/compare/${cmp.slug}/`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: { languages: { ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/compare/${cmp.slug}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/compare/${cmp.slug}/` } },
      });
    }
  }

  // Category pages × 17 locales
  for (const cat of CATEGORIES) {
    for (const locale of IDX) {
      out.push({
        url: `${SITE_URL}/${locale}/category/${cat}/`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: { ...Object.fromEntries(IDX.map((l) => [l, `${SITE_URL}/${l}/category/${cat}/`])), "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/category/${cat}/` },
        },
      });
    }
  }

  // Articles × locales — only include pages that get built AND are actually
  // translated. A built-but-untranslated locale renders an English-fallback
  // body (a thin, mixed-language page); those are noindex'd in the page's
  // metadata, so they must stay out of the sitemap and the hreflang cluster too.
  for (const article of listArticles()) {
    // 厳選(2026-06-29): 死蔵記事は noindex 済みなので sitemap / hreflang からも除外。
    if (isDeindexed(article.slug)) continue;
    const indexLocales = article.locales.filter(
      (l) =>
        isIndexedLocale(l) &&
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
          languages: {
            ...Object.fromEntries(
              indexLocales.map((l) => [
                l,
                `${SITE_URL}/${l}/articles/${article.slug}/`,
              ]),
            ),
            // 記事ブロックだけ x-default が抜けていて、sitemap 3722件のうち
            // 記事 2567件で未指定だった(他のページ種別には全部付いている)。
            // 既定は en だが、en を配信していない記事もあるので実在するロケールを選ぶ。
            "x-default": `${SITE_URL}/${
              indexLocales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : indexLocales[0]
            }/articles/${article.slug}/`,
          },
        },
      });
    }
  }

  return out;
}
