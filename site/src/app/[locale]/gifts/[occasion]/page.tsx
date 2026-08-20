import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL, DEFAULT_OG_IMAGES } from "@/lib/og";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import { OCCASIONS, OCCASION_MAP } from "@/lib/pages/gift-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";
import { resolvePrice } from "@/lib/affiliates/price";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness:"🏋️",food:"🍳",tech:"💻",beauty:"✨",home:"🏠",
  fashion:"👗",finance:"💰",travel:"✈️",parenting:"👶",pets:"🐾",
};
const TYPE_LABELS: Record<string,string> = { comparison:"Comparison",review:"Review",guide:"Guide" };

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
  return LOCALES.flatMap((locale) =>
    OCCASIONS.map((o) => ({ locale, occasion: o.slug })),
  );
}

interface Props { params: Promise<{ locale: string; occasion: string }> }

export default async function GiftPage({ params }: Props) {
  const { locale, occasion: occasionSlug } = await params;
  setRequestLocale(locale);

  const config = OCCASION_MAP[occasionSlug];
  if (!config) notFound();

  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articleMap = new Map(allArticles.map((a) => [a.slug, a]));

  // Featured picks first (if they exist for this locale)
  const featured = (config.featuredSlugs ?? [])
    .map((s) => articleMap.get(s))
    .filter((a): a is ArticleMeta => !!a);
  const featuredSet = new Set(featured.map((a) => a.slug));

  // Rest: filter by occasion categories, sort by offer count
  const byCategory = config.categories.flatMap((cat) =>
    allArticles.filter((a) => a.category === cat && !featuredSet.has(a.slug)),
  );
  // Deduplicate and sort
  const seen = new Set(featured.map((a) => a.slug));
  const rest: ArticleMeta[] = [];
  for (const a of byCategory) {
    if (!seen.has(a.slug)) { seen.add(a.slug); rest.push(a); }
  }
  rest.sort((a, b) => b.offerIds.length - a.offerIds.length);

  // ★ Top 10: featured first, then the deepest comparisons. The remainder is a
  // short "more ideas" tail — previously every matching article was dumped flat,
  // so nothing on the page read as a recommendation.
  const ranked = [...featured, ...rest].slice(0, 10);
  const rankedSet = new Set(ranked.map((a) => a.slug));
  const more = rest.filter((a) => !rankedSet.has(a.slug)).slice(0, 12);

  const articles = ranked;

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.title,
    description: config.description,
    url: `${SITE_URL}/${locale}/gifts/${occasionSlug}`,
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
      { "@type": "ListItem", position: 2, name: "Gift Guides", item: `${SITE_URL}/${locale}/gifts/` },
      { "@type": "ListItem", position: 3, name: config.title, item: `${SITE_URL}/${locale}/gifts/${occasionSlug}/` },
    ],
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        {/* Breadcrumb */}
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
          <span>/</span>
          <Link href="/gifts" className="hover:text-slate-600 transition-colors">{tt("home.giftsTitle", "Gift guides")}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{config.icon} {tt(`giftPages.${occasionSlug}.title`, config.title).replace(" 2026","")}</span>
        </nav>

        {/* Hero */}
        <section className="py-10 md:py-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700">
            {config.icon} Gift guide
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            {tt(`giftPages.${occasionSlug}.title`, config.title)}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-500 leading-relaxed">
            {tt(`giftPages.${occasionSlug}.description`, config.description)}
          </p>
        </section>

        {/* Other occasions */}
        <nav className="mb-10 flex flex-wrap gap-2" aria-label="Other occasions">
          {OCCASIONS.filter((o) => o.slug !== occasionSlug).map((o) => (
            <Link
              key={o.slug}
              href={`/gifts/${o.slug}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              {o.icon} {o.title.replace(" 2026","").replace(" Ideas","").replace(" Gift","").replace("Best ","").replace(" Essentials","")}
            </Link>
          ))}
        </nav>

        {/* Top 10 ranked picks */}
        {ranked.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-1 text-lg font-black text-slate-900">
              {tt("giftPages.topN", `\u2b50 Top ${ranked.length} picks`, { count: ranked.length })}
            </h2>
            <p className="mb-4 text-xs text-slate-400">
              {tt("giftPages.topNSub", "Ranked by how thoroughly we compared the options.")}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ranked.map((a, idx) => {
                const { title, description } = loadArticleCardMeta(a.slug, locale);
                const imgSrc = getThumbnail(a, locale);
                const isProductImg = imgSrc && !imgSrc.includes("/og/");
                const offer = firstOffer(a);
                const isTop3 = idx < 3;
                return (
                  <li key={a.slug}>
                    <Link href={`/articles/${a.slug}`}
                      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg ${isTop3 ? "border-2 border-rose-200 hover:border-rose-400" : "border border-slate-200 hover:border-brand-200"}`}>
                      <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                        <ArticleCardImage src={imgSrc} alt={title}
                          className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}>
                          <CategoryPlaceholder category={a.category} title={title} />
                        </ArticleCardImage>
                        <span className={`absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shadow ${isTop3 ? "bg-rose-500 text-white" : "bg-white/95 border border-slate-200 text-slate-700"}`}>
                          {idx + 1}
                        </span>
                        {(offer && resolvePrice(offer, locale)) && (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                            {resolvePrice(offer, locale)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        {offer?.badge && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(offer.badge) && <p className="mb-1 text-[11px] font-semibold text-amber-600 truncate">\ud83c\udfc6 {offer.badge}</p>}
                        <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">{title}</h3>
                        {description && <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{description}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">{tt("home.picks", `${a.offerIds.length} picks`, { count: a.offerIds.length })}</span>
                          <span className="text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">{tt("home.readReview", "Read review \u2192")}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* More ideas (capped tail) */}
        {more.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-black text-slate-900">
              {tt("giftPages.moreIdeas", "More gift ideas")}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((a) => {
                const { title, description } = loadArticleCardMeta(a.slug, locale);
                const imgSrc = getThumbnail(a, locale);
                const isProductImg = imgSrc && !imgSrc.includes("/og/");
                const offer = firstOffer(a);
                let catLabel: string = a.category;
                try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
                return (
                  <li key={a.slug}>
                    <Link href={`/articles/${a.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg">
                      <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                        <ArticleCardImage src={imgSrc} alt={title}
                          className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}>
                          <CategoryPlaceholder category={a.category} title={title} />
                        </ArticleCardImage>
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                          {CATEGORY_ICONS[a.category]} {catLabel}
                        </span>
                        {(offer && resolvePrice(offer, locale)) && (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                            {resolvePrice(offer, locale)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        {offer?.badge && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(offer.badge) && <p className="mb-1 text-[11px] font-semibold text-amber-600 truncate">🏆 {offer.badge}</p>}
                        <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">{title}</h3>
                        {description && <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{description}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">{tt(`home.type${a.type.charAt(0).toUpperCase()}${a.type.slice(1)}`, TYPE_LABELS[a.type] ?? a.type)} · {tt("home.picks", `${a.offerIds.length} picks`, { count: a.offerIds.length })}</span>
                          <span className="text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">{tt("home.read", "Read →")}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 text-center">
              <Link href="/articles" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                {tt("pages.browseAllReviews", `Browse all ${allArticles.length} reviews \u2192`, { count: allArticles.length })}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, occasion } = await params;
  const config = OCCASION_MAP[occasion];
  if (!config) return {};
  // ★本文はこの翻訳を 17 言語で出しているのに、metadata だけ英語直書きだった。
  //   SERP に出るのは metadata の方なので、本文と同じキーを引く (2026-08-04)。
  const t = await getTranslations({ locale });
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };
  const title = tt(`giftPages.${occasion}.title`, config.title);
  const description = tt(`giftPages.${occasion}.description`, config.description);
  const url = `${SITE_URL}/${locale}/gifts/${occasion}`;
  return {
    title: serpTitle(title), description,
    alternates: localeAlternates(`/gifts/${occasion}`, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, type: "website", title, description, url, siteName: "Pickly" },
    twitter: { card: "summary_large_image", title, description },
  };
}
