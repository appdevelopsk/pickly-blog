import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL } from "@/lib/og";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";
import { resolvePrice } from "@/lib/affiliates/price";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};
const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

function getThumbnail(a: ArticleMeta, locale: string): string | null {
  for (const id of a.offerIds) {
    const o = CATALOG.find((x) => x.id === id);
    if (!o) continue;
    const img = getOfferImageUrl(o);
    if (img) return img;
  }
  if (a.ogImage && a.ogImage !== "auto") return `${OG_BASE_URL}${a.ogImage}-${locale}.png`;
  return null;
}
function firstOffer(a: ArticleMeta): AffiliateOffer | null {
  for (const id of a.offerIds) {
    const o = CATALOG.find((x) => x.id === id);
    if (o) return o;
  }
  return null;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function NewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const all = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));

  // Sort newest first; group into this-week / this-month / older
  const sorted = [...all].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );

  const now = new Date("2026-06-10"); // deterministic for SSG
  const weekAgo  = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);

  const thisWeek  = sorted.filter((a) => new Date(a.publishedAt) >= weekAgo);
  const thisMonth = sorted.filter((a) => new Date(a.publishedAt) >= monthAgo && new Date(a.publishedAt) < weekAgo);
  const older     = sorted.filter((a) => new Date(a.publishedAt) < monthAgo).slice(0, 24);

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "New Reviews", item: `${SITE_URL}/${locale}/new/` },
    ],
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  function Grid({ articles, rank }: { articles: ArticleMeta[]; rank?: boolean }) {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a, idx) => {
          const { title, description } = loadArticleCardMeta(a.slug, locale);
          const imgSrc = getThumbnail(a, locale);
          const isProductImg = imgSrc && !imgSrc.includes("/og/");
          const offer = firstOffer(a);
          return (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
              >
                <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                  <ArticleCardImage src={imgSrc} alt={title}
                    className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}>
                    <CategoryPlaceholder category={a.category} title={title} />
                  </ArticleCardImage>
                  {rank && (
                    <span className="absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-[10px] font-black text-white shadow">
                      NEW
                    </span>
                  )}
                  {(offer && resolvePrice(offer, locale)) && (
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                      {resolvePrice(offer, locale)}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {offer?.badge && <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">🏆 {offer.badge}</p>}
                  <h2 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
                    {title}
                  </h2>
                  {description && <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {CATEGORY_ICONS[a.category]} &nbsp;
                      {tt(`home.type${a.type.charAt(0).toUpperCase()}${a.type.slice(1)}`, TYPE_LABELS[a.type] ?? a.type)} · {tt("home.picks", `${a.offerIds.length} picks`, { count: a.offerIds.length })}
                    </span>
                    <span className="text-xs text-slate-300">{a.publishedAt}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">New</span>
      </nav>

      <section className="py-10 md:py-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-bold text-green-700">
          🆕 {tt("pages.latestBadge", "Latest reviews")}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          {tt("pages.newTitle", "New this month")}
        </h1>
        <p className="mt-2 text-base text-slate-500">
          {tt("pages.newDesc", `Recently published reviews and comparisons — ${all.length} total across 10 categories.`, { count: all.length, categories: 10 })}
        </p>
      </section>

      {thisWeek.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {tt("pages.thisWeek", "This week")}
            <span className="text-sm font-normal text-slate-400">({thisWeek.length})</span>
          </h2>
          <Grid articles={thisWeek} rank />
        </section>
      )}

      {thisMonth.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-black text-slate-900">
            {tt("pages.thisMonth", "This month")}
            <span className="ml-2 text-sm font-normal text-slate-400">({thisMonth.length})</span>
          </h2>
          <Grid articles={thisMonth} />
        </section>
      )}

      {older.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-black text-slate-900">
            Earlier
            <span className="ml-2 text-sm font-normal text-slate-400">({older.length} shown)</span>
          </h2>
          <Grid articles={older} />
        </section>
      )}
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
  const title = tt("pages.newTitle", "New this month");
  // newDesc は {count} と {categories} を要求する (未指定だと FORMATTING_ERROR で英語へ落ちる)。
  const published = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const description = tt(
    "pages.newDesc",
    "Recently published product reviews and comparisons, updated regularly.",
    { count: published.length, categories: new Set(published.map((a) => a.category)).size },
  );
  const url = `${SITE_URL}/${locale}/new`;
  return {
    title: serpTitle(title), description,
    alternates: localeAlternates("/new", locale),
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
  };
}
