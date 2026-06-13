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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

// Editor's top picks — manually curated for quality and search volume
const FEATURED_SLUGS = [
  "best-basketball-shoes-2026",
  "best-air-fryer-2026",
  "best-robot-vacuum-2026",
  "best-noise-cancelling-headphones-2026",
  "best-espresso-machine-2026",
  "best-mattress-2026",
  "best-hair-dryer-2026",
  "best-protein-powder-2026",
  "best-standing-desk-2026",
  "best-yoga-mat-2026",
  "best-coffee-maker-2026",
  "best-massage-gun-2026",
  "best-smart-watch-2026",
  "best-vpn-2026",
  "best-blender-2026",
  "best-office-chair-2026",
  "best-fitness-tracker-2026",
  "best-air-purifier-2026",
  "best-mechanical-keyboard-2026",
  "best-baby-monitor-2026",
];

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};

const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

function getThumbnail(article: ArticleMeta, locale: string): string | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
  }
  if (article.ogImage && article.ogImage !== "auto") return `${OG_BASE_URL}${article.ogImage}-${locale}.png`;
  return null;
}

function getFirstOffer(article: ArticleMeta): AffiliateOffer | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (offer) return offer;
  }
  return null;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PopularPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articleMap = new Map(allArticles.map((a) => [a.slug, a]));

  // Featured slugs that exist for this locale
  const featured = FEATURED_SLUGS
    .map((slug) => articleMap.get(slug))
    .filter((a): a is ArticleMeta => !!a);

  // Fill remaining spots from articles with most offers (most comprehensive comparisons)
  const remaining = allArticles
    .filter((a) => !FEATURED_SLUGS.includes(a.slug))
    .sort((a, b) => b.offerIds.length - a.offerIds.length)
    .slice(0, Math.max(0, 30 - featured.length));

  const articles = [...featured, ...remaining].slice(0, 30);

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Popular Reviews",
    url: `${SITE_URL}/${locale}/popular`,
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 10).map((a, i) => {
      const { title } = loadArticleCardMeta(a.slug, locale);
      return { "@type": "ListItem", position: i + 1, name: title, url: `${SITE_URL}/${locale}/articles/${a.slug}` };
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "Popular", item: `${SITE_URL}/${locale}/popular/` },
    ],
  };

  let navArticles = "Browse all";
  try { navArticles = t("nav.articles"); } catch { /* missing */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        {/* Breadcrumb */}
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400" aria-label="breadcrumb">
          <Link href="/" className="hover:text-slate-600 transition-colors">{t("site.name")}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Popular</span>
        </nav>

        {/* Hero */}
        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-bold text-amber-700">
            🏆 Editor's picks
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Most popular reviews
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
            Our highest-rated comparisons — chosen for depth of testing, breadth of options, and real-world usefulness.
          </p>
        </section>

        {/* Top 3 featured */}
        {articles.length > 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {articles.slice(0, 3).map((a, idx) => {
              const { title, description } = loadArticleCardMeta(a.slug, locale);
              const imgSrc = getThumbnail(a, locale);
              const isProductImg = imgSrc && !imgSrc.includes("/og/");
              const offer = getFirstOffer(a);
              const badge = offer?.badge;
              return (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
                >
                  {/* Rank badge */}
                  <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white shadow">
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
                    {badge && <p className="mb-1 text-[11px] font-semibold text-amber-600 truncate">🏆 {badge}</p>}
                    <h2 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 line-clamp-2 transition-colors">
                      {title}
                    </h2>
                    {description && (
                      <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">{description}</p>
                    )}
                    <p className="mt-3 text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">Read →</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Remaining list */}
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {articles.slice(3).map((a, idx) => {
            const { title, description } = loadArticleCardMeta(a.slug, locale);
            const imgSrc = getThumbnail(a, locale);
            const isProductImg = imgSrc && !imgSrc.includes("/og/");
            const offer = getFirstOffer(a);
            const price = offer?.price;
            let catLabel: string = a.category;
            try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
            return (
              <li key={a.slug}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-50"
                >
                  <span className="shrink-0 w-8 text-center text-sm font-black text-slate-300">
                    #{idx + 4}
                  </span>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
                    {description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">
                        {CATEGORY_ICONS[a.category]} {catLabel}
                      </span>
                      {price && <span className="text-[10px] font-bold text-slate-600">· {price}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* View all CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-8 py-3 text-sm font-bold text-brand-600 transition-all hover:bg-brand-600 hover:text-white"
          >
            {navArticles} ({allArticles.length}) →
          </Link>
        </div>

      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "Most Popular Reviews 2026 | Pickly";
  const description = "Our highest-rated product comparisons — tested, curated, and updated for 2026.";
  const canonicalUrl = `${SITE_URL}/${locale}/popular`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/popular`])),
    },
    openGraph: { type: "website", title, description, url: canonicalUrl, siteName: "Pickly" },
    twitter: { card: "summary", title, description },
  };
}
