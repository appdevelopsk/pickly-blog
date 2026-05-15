import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getThumbnail(article: ArticleMeta, locale: string): string | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
  }
  if (article.ogImage && article.ogImage !== "auto") return `${article.ogImage}-${locale}.png`;
  return null;
}

function getFirstOffer(article: ArticleMeta): AffiliateOffer | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (offer) return offer;
  }
  return null;
}

function isNew(article: ArticleMeta): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return new Date(article.publishedAt) >= cutoff;
}

const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison",
  review: "Review",
  guide: "Guide",
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️",
  food: "🍳",
  tech: "💻",
  beauty: "✨",
  home: "🏠",
  fashion: "👗",
  finance: "💰",
  travel: "✈️",
  parenting: "👶",
  pets: "🐾",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const allArticles = listArticlesForLocale(locale);
  const articles = allArticles.filter((a) => hasApprovedAds(a, locale));
  const recent = articles.slice(-16).reverse();
  const [featured, ...gridArticles] = recent;

  const categoryCounts: Record<string, number> = {};
  for (const a of allArticles) {
    categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat]) => cat);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pickly",
    url: SITE_URL,
    description: "Curated reviews and comparisons across 17 languages.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${locale}/articles/`,
      "query-input": "required name=search_term_string",
    },
  };

  let heading = "Real reviews, no filler.";
  let subheading = "Honest comparisons and buyer's guides across 17 languages.";
  let navArticles = "Browse all reviews";
  try { heading = t("home.heading"); } catch { /* missing */ }
  try { subheading = t("home.subheading"); } catch { /* missing */ }
  try { navArticles = t("nav.articles"); } catch { /* missing */ }

  function getArticleText(a: ArticleMeta) {
    let title = a.slug.replace(/-/g, " ");
    let description = "";
    try { title = t(`articles.${a.slug}.title`); } catch { /* missing */ }
    try { description = t(`articles.${a.slug}.description`); } catch { /* missing */ }
    let catLabel: string = a.category;
    try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
    return { title, description, catLabel };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="py-14 text-center md:py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-500 tracking-wide">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            {articles.length} reviews &nbsp;·&nbsp; 17 languages
          </div>
          <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-slate-500">
            {subheading}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand-900/20 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-brand-900/30"
            >
              {navArticles} →
            </Link>
          </div>
        </section>

        {/* ── Category pills ────────────────────────────── */}
        {topCategories.length > 0 && (
          <nav className="mb-12 flex flex-wrap justify-center gap-2">
            {topCategories.map((cat) => {
              let label = cat;
              try { label = t(`category.${cat}`); } catch { /* missing */ }
              return (
                <Link
                  key={cat}
                  href={`/articles#${cat}`}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {CATEGORY_ICONS[cat] && <span>{CATEGORY_ICONS[cat]}</span>}
                  <span>{label}</span>
                  <span className="text-xs text-slate-400">({categoryCounts[cat]})</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* ── Content ───────────────────────────────────── */}
        {recent.length === 0 ? (
          <p className="rounded-xl bg-amber-50 p-6 text-amber-800">{t("home.empty")}</p>
        ) : (
          <>
            {/* ── Featured card ── */}
            {featured && (() => {
              const { title, description, catLabel } = getArticleText(featured);
              const imgSrc = getThumbnail(featured, locale);
              const isProductImg = imgSrc && !imgSrc.includes("/og/");
              const offer = getFirstOffer(featured);
              const badge = offer?.badge;
              const price = offer?.price;
              const typeLabel = TYPE_LABELS[featured.type] ?? featured.type;
              const picksCount = featured.offerIds.length;
              return (
                <Link
                  href={`/articles/${featured.slug}`}
                  className="group mb-5 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-xl sm:flex-row"
                >
                  {/* Image */}
                  <div
                    className="relative shrink-0 overflow-hidden bg-slate-100 sm:w-2/5"
                    style={{ aspectRatio: isProductImg ? "1/1" : "3/2" }}
                  >
                    <ArticleCardImage
                      src={imgSrc}
                      alt={title}
                      className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${isProductImg ? "object-contain p-6" : "object-cover"}`}
                    >
                      <CategoryPlaceholder category={featured.category} title={title} />
                    </ArticleCardImage>
                    {/* Category badge */}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {CATEGORY_ICONS[featured.category] ?? ""} {catLabel}
                    </span>
                    {/* Price chip */}
                    {price && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-white/95 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
                        from {price}
                      </span>
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                    {/* Type + picks meta */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 uppercase tracking-wide">
                        Featured
                      </span>
                      <span className="text-xs text-slate-400">{typeLabel} · {picksCount} picks</span>
                    </div>
                    {/* Editor badge */}
                    {badge && (
                      <p className="mb-1.5 text-xs font-semibold text-amber-600">
                        🏆 {badge}
                      </p>
                    )}
                    <h2 className="mb-3 text-xl font-black leading-snug text-slate-900 transition-colors group-hover:text-brand-700 sm:text-2xl">
                      {title}
                    </h2>
                    {description && (
                      <p className="text-sm leading-relaxed text-slate-500 line-clamp-3">
                        {description}
                      </p>
                    )}
                    <p className="mt-5 text-sm font-semibold text-brand-600 group-hover:underline">
                      Read review →
                    </p>
                  </div>
                </Link>
              );
            })()}

            {/* ── Article grid ── */}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gridArticles.slice(0, 12).map((a) => {
                const { title, description, catLabel } = getArticleText(a);
                const imgSrc = getThumbnail(a, locale);
                const isProductImg = imgSrc && !imgSrc.includes("/og/");
                const offer = getFirstOffer(a);
                const badge = offer?.badge;
                const price = offer?.price;
                const picksCount = a.offerIds.length;
                const typeLabel = TYPE_LABELS[a.type] ?? a.type;
                const newArticle = isNew(a);
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
                    >
                      {/* Thumbnail */}
                      <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                        <ArticleCardImage
                          src={imgSrc}
                          alt={title}
                          className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}
                        >
                          <CategoryPlaceholder category={a.category} title={title} />
                        </ArticleCardImage>
                        {/* Category */}
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                          {catLabel}
                        </span>
                        {/* NEW badge */}
                        {newArticle && (
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            NEW
                          </span>
                        )}
                        {/* Price chip */}
                        {price && (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                            {price}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex flex-1 flex-col p-4">
                        {/* Editor badge */}
                        {badge && (
                          <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">
                            🏆 {badge}
                          </p>
                        )}
                        <h2 className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700 line-clamp-2">
                          {title}
                        </h2>
                        {description && (
                          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400 line-clamp-2">
                            {description}
                          </p>
                        )}
                        {/* Footer meta */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {typeLabel} · {picksCount} picks
                          </span>
                          <span className="text-[11px] font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                            Read →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* ── View all CTA ──────────────────────────────── */}
        {articles.length > 13 && (
          <div className="mt-14 text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-8 py-3 text-sm font-bold text-brand-600 transition-all hover:bg-brand-600 hover:text-white"
            >
              {navArticles} ({articles.length}) →
            </Link>
          </div>
        )}

        {/* ── Trust strip ───────────────────────────────── */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 border-t border-slate-100 pt-10 text-center">
          {[
            { num: articles.length.toString(), label: "Curated reviews" },
            { num: "17", label: "Languages" },
            { num: "5+", label: "ASPs monitored" },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-slate-900">{num}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const articles = listArticlesForLocale(locale);

  let title = "Pickly";
  let description = "Curated reviews and comparisons across 17 languages.";
  try { title = t("site.name"); } catch { /* missing */ }
  try { description = `${t("home.heading")} ${t("home.subheading")}`; } catch { /* missing */ }

  const canonicalUrl = `${SITE_URL}/${locale}/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/`])),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "Pickly",
      locale,
    },
    twitter: { card: "summary", title, description },
    other: { "article:count": String(articles.length) },
  };
}
