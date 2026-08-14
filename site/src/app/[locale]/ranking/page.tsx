import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import type { ArticleMeta } from "@/lib/articles/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";
import { DEFAULT_OG_IMAGES } from "@/lib/og";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ORDER = [
  "fitness", "food", "tech", "home", "beauty",
  "fashion", "travel", "parenting", "pets", "finance",
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", home: "🏠", beauty: "✨",
  fashion: "👗", travel: "✈️", parenting: "👶", pets: "🐾", finance: "💰",
};

function getThumbnail(article: ArticleMeta): string | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
  }
  return null;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RankingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));

  // Group by category, sort each group by offerIds.length desc
  const byCategory: Record<string, ArticleMeta[]> = {};
  for (const article of allArticles) {
    if (!byCategory[article.category]) byCategory[article.category] = [];
    (byCategory[article.category] as ArticleMeta[]).push(article);
  }
  for (const cat of Object.keys(byCategory)) {
    (byCategory[cat] as ArticleMeta[]).sort((a, b) => b.offerIds.length - a.offerIds.length);
  }

  // Top 3 per category for the hero row
  const topOverall = CATEGORY_ORDER
    .flatMap((cat) => (byCategory[cat] ?? []).slice(0, 1))
    .slice(0, 5);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best of Every Category | Pickly Rankings",
    url: `${SITE_URL}/${locale}/ranking`,
    numberOfItems: allArticles.length,
    itemListElement: topOverall.map((a, i) => {
      const { title } = loadArticleCardMeta(a.slug, locale);
      return { "@type": "ListItem", position: i + 1, name: title, url: `${SITE_URL}/${locale}/articles/${a.slug}` };
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "Rankings", item: `${SITE_URL}/${locale}/ranking/` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        {/* Breadcrumb */}
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400" aria-label="breadcrumb">
          <Link href="/" className="hover:text-slate-600 transition-colors">{t("site.name")}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{tt("pages.rankingTitle", "Rankings")}</span>
        </nav>

        {/* Hero */}
        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-xs font-bold text-brand-700">
            🏆 {tt("pages.rankingTitle", "Rankings")}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {tt("pages.rankingSub", "Best of every category")}
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
            {tt("pages.rankingDesc", `Top picks ranked by depth of comparison — ${allArticles.length} reviews across ${CATEGORY_ORDER.filter(c => byCategory[c]?.length).length} categories.`, { reviews: allArticles.length, categories: CATEGORY_ORDER.filter(c => byCategory[c]?.length).length })}
          </p>
        </section>

        {/* Per-category sections */}
        <div className="space-y-12">
          {CATEGORY_ORDER.filter((cat) => (byCategory[cat]?.length ?? 0) > 0).map((cat) => {
            const articles = byCategory[cat] ?? [];
            const top3 = articles.slice(0, 3);
            let catLabel: string = cat;
            try { catLabel = t(`category.${cat}`); } catch { /* missing */ }
            const icon = CATEGORY_ICONS[cat] ?? "📦";

            return (
              <section key={cat}>
                {/* Category header */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{icon}</span>
                    <h2 className="text-lg font-black text-slate-900">{catLabel}</h2>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">
                      {articles.length}
                    </span>
                  </div>
                  <Link
                    href={`/category/${cat}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    {tt("pages.viewAll", "View all →")}
                  </Link>
                </div>

                {/* Top 3 cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  {top3.map((a, idx) => {
                    const { title, description } = loadArticleCardMeta(a.slug, locale);
                    const imgSrc = getThumbnail(a);
                    const isProductImg = !!imgSrc;
                    return (
                      <Link
                        key={a.slug}
                        href={`/articles/${a.slug}`}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
                      >
                        {/* Rank badge */}
                        <span className={`absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow ${
                          idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : "bg-amber-700"
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                          <ArticleCardImage
                            src={imgSrc}
                            alt={title}
                            className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}
                          >
                            <CategoryPlaceholder category={a.category} title={title} />
                          </ArticleCardImage>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 line-clamp-2 transition-colors">
                            {title}
                          </h3>
                          {description && (
                            <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">{description}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {tt("pages.picksCompared", `${a.offerIds.length} picks compared`, { count: a.offerIds.length })}
                            </span>
                            <span className="text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              {tt("home.read", "Read →")}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* More in this category */}
                {articles.length > 3 && (
                  <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                    {articles.slice(3, 6).map((a, idx) => {
                      const { title } = loadArticleCardMeta(a.slug, locale);
                      const imgSrc = getThumbnail(a);
                      const isProductImg = !!imgSrc;
                      return (
                        <li key={a.slug}>
                          <Link
                            href={`/articles/${a.slug}`}
                            className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-50"
                          >
                            <span className="shrink-0 w-7 text-center text-sm font-black text-slate-300">
                              #{idx + 4}
                            </span>
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              <ArticleCardImage
                                src={imgSrc}
                                alt={title}
                                className={`h-full w-full ${isProductImg ? "object-contain p-1" : "object-cover"}`}
                              >
                                <CategoryPlaceholder category={a.category} />
                              </ArticleCardImage>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                                {title}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{tt("home.picks", `${a.offerIds.length} picks`, { count: a.offerIds.length })}</p>
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </Link>
                        </li>
                      );
                    })}
                    {articles.length > 6 && (
                      <li>
                        <Link
                          href={`/category/${cat}`}
                          className="flex items-center justify-center px-4 py-3 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          {tt("pages.moreCatReviews", `+${articles.length - 6} more ${catLabel} reviews →`, { count: articles.length - 6, cat: catLabel })}
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* View all CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-8 py-3 text-sm font-bold text-brand-600 transition-all hover:bg-brand-600 hover:text-white"
          >
            {tt("pages.browseAllReviews", `Browse all ${allArticles.length} reviews →`, { count: allArticles.length })}
          </Link>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  // ★本文は 17 言語で出しているのに metadata だけ英語直書きだった (2026-08-04)。
  const t = await getTranslations({ locale });
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };
  const title = tt("pages.rankingSub", "Best of every category");
  // rankingDesc は {reviews} と {categories} を要求する。渡さないと FORMATTING_ERROR で
  // 英語フォールバックに落ちる (ビルドログにしか出ない)。
  const ranked = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const categoryCount = new Set(ranked.map((a) => a.category)).size;
  const description = tt(
    "pages.rankingDesc",
    "Top picks ranked by depth of comparison.",
    { reviews: ranked.length, categories: categoryCount },
  );
  const canonicalUrl = `${SITE_URL}/${locale}/ranking`;
  return {
    title: serpTitle(title),
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: localeAlternates("/ranking", locale).languages,
    },
    openGraph: { images: DEFAULT_OG_IMAGES, type: "website", title, description, url: canonicalUrl, siteName: "Pickly" },
    twitter: { card: "summary", title, description },
  };
}
