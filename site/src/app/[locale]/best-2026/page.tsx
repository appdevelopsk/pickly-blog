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

const CATEGORIES = [
  "fitness", "food", "tech", "beauty", "home",
  "fashion", "finance", "travel", "parenting", "pets",
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};

// Hand-curated top pick per category — best single article to represent the category
const TOP_PICK_SLUGS: Record<string, string> = {
  fitness:   "best-basketball-shoes-2026",
  food:      "best-espresso-machine-2026",
  tech:      "best-noise-cancelling-headphones-2026",
  beauty:    "best-hair-dryer-2026",
  home:      "best-robot-vacuum-2026",
  fashion:   "best-ankle-boots-2026",
  finance:   "best-credit-card-2026",
  travel:    "best-luggage-2026",
  parenting: "best-baby-monitor-2026",
  pets:      "best-dog-food-2026",
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

export default async function Best2026Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
  };

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articleMap = new Map(allArticles.map((a) => [a.slug, a]));

  // Per category: top pick + top 3 additional
  const sections = CATEGORIES.map((cat) => {
    let catLabel: string = cat;
    try { catLabel = t(`category.${cat}`); } catch { /* missing */ }

    const catArticles = allArticles.filter((a) => a.category === cat);
    if (catArticles.length === 0) return null;

    const topPickSlug = TOP_PICK_SLUGS[cat];
    const topPick = (topPickSlug ? (articleMap.get(topPickSlug) ?? catArticles[0]) : catArticles[0])!;
    const rest = catArticles
      .filter((a) => a.slug !== topPick.slug)
      .sort((a, b) => b.offerIds.length - a.offerIds.length)
      .slice(0, 3);

    return { cat, catLabel, topPick, rest };
  }).filter(Boolean) as { cat: string; catLabel: string; topPick: ArticleMeta; rest: ArticleMeta[] }[];

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Products 2026",
    url: `${SITE_URL}/${locale}/best-2026`,
    numberOfItems: sections.length,
    itemListElement: sections.map((s, i) => {
      const { title } = loadArticleCardMeta(s.topPick.slug, locale);
      return { "@type": "ListItem", position: i + 1, name: title, url: `${SITE_URL}/${locale}/articles/${s.topPick.slug}` };
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "Best of 2026", item: `${SITE_URL}/${locale}/best-2026/` },
    ],
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Best of 2026</span>
        </nav>

        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-1.5 text-xs font-bold text-brand-700">
            ✨ {tt("pages.annualGuide", "Annual guide")}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            {tt("pages.bestofSub", "Best products of 2026")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500 leading-relaxed">
            {tt("pages.bestofLead", "Our top-tested picks across all 10 categories — updated as products launch and rankings shift throughout 2026.")}
          </p>
        </section>

        {/* Jump nav */}
        <nav className="mb-12 flex flex-wrap gap-2">
          {sections.map(({ cat, catLabel }) => (
            <a
              key={cat}
              href={`#${cat}`}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              {CATEGORY_ICONS[cat]} {catLabel}
            </a>
          ))}
        </nav>

        {/* Sections per category */}
        {sections.map(({ cat, catLabel, topPick, rest }) => {
          const topMeta = loadArticleCardMeta(topPick.slug, locale);
          const topImg = getThumbnail(topPick, locale);
          const topIsProduct = topImg && !topImg.includes("/og/");
          const topOffer = firstOffer(topPick);

          return (
            <section key={cat} id={cat} className="mb-14 scroll-mt-20">
              {/* Category header */}
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="text-3xl" aria-hidden>{CATEGORY_ICONS[cat]}</span>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{catLabel}</h2>
                  <Link href={`/category/${cat}`} className="text-xs text-brand-600 hover:underline">
                    {tt("pages.allCatReviews", `All ${catLabel} reviews →`, { cat: catLabel })}
                  </Link>
                </div>
              </div>

              {/* Top pick hero */}
              <Link
                href={`/articles/${topPick.slug}`}
                className="group mb-4 flex flex-col overflow-hidden rounded-2xl border-2 border-brand-200 bg-white shadow-sm transition-all hover:border-brand-400 hover:shadow-xl sm:flex-row"
              >
                <div className="relative shrink-0 overflow-hidden bg-slate-100 sm:w-2/5" style={{ aspectRatio: topIsProduct ? "1/1" : "3/2" }}>
                  <ArticleCardImage src={topImg} alt={topMeta.title}
                    className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${topIsProduct ? "object-contain p-6" : "object-cover"}`}>
                    <CategoryPlaceholder category={topPick.category} title={topMeta.title} />
                  </ArticleCardImage>
                  <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-black text-white shadow">
                    {tt("pages.no1Pick", "#1 Pick")}
                  </span>
                  {topOffer?.price && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/95 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
                      {tt("pages.fromPrice", `from ${topOffer.price}`, { price: topOffer.price })}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                  {topOffer?.badge && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(topOffer.badge) && (
                    <p className="mb-1.5 text-xs font-semibold text-amber-600">🏆 {topOffer.badge}</p>
                  )}
                  <h3 className="mb-3 text-lg font-black leading-snug text-slate-900 group-hover:text-brand-700 transition-colors sm:text-xl">
                    {topMeta.title}
                  </h3>
                  {topMeta.description && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{topMeta.description}</p>
                  )}
                  <p className="mt-4 text-sm font-semibold text-brand-600 group-hover:underline">
                    Read review →
                  </p>
                </div>
              </Link>

              {/* Rest of category */}
              {rest.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-3">
                  {rest.map((a) => {
                    const { title } = loadArticleCardMeta(a.slug, locale);
                    const imgSrc = getThumbnail(a, locale);
                    const isProductImg = imgSrc && !imgSrc.includes("/og/");
                    const offer = firstOffer(a);
                    return (
                      <li key={a.slug}>
                        <Link
                          href={`/articles/${a.slug}`}
                          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-brand-200 hover:shadow-md"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            <ArticleCardImage src={imgSrc} alt={title}
                              className={`h-full w-full ${isProductImg ? "object-contain p-1" : "object-cover"}`}>
                              <CategoryPlaceholder category={a.category} />
                            </ArticleCardImage>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
                              {title}
                            </p>
                            {offer?.price && <p className="mt-0.5 text-[11px] text-slate-400">{offer.price}</p>}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}

      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "Best Products of 2026 | Pickly";
  const description = "Our top-tested picks across fitness, tech, home, beauty, food, fashion, finance, travel, parenting, and pets — the definitive 2026 buying guide.";
  const url = `${SITE_URL}/${locale}/best-2026`;
  return {
    title, description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/best-2026`])) },
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
    twitter: { card: "summary_large_image", title, description },
  };
}
