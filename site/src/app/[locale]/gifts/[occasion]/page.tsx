import { notFound } from "next/navigation";
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
import { OCCASIONS, OCCASION_MAP } from "@/lib/pages/gift-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";

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
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
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

  const articles = [...featured, ...rest].slice(0, 36);

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

        {/* Featured top 3 */}
        {featured.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-black text-slate-900">⭐ Top picks</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featured.map((a) => {
                const { title, description } = loadArticleCardMeta(a.slug, locale);
                const imgSrc = getThumbnail(a, locale);
                const isProductImg = imgSrc && !imgSrc.includes("/og/");
                const offer = firstOffer(a);
                return (
                  <Link key={a.slug} href={`/articles/${a.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border-2 border-rose-200 bg-white shadow-sm transition-all hover:border-rose-400 hover:shadow-lg">
                    <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                      <ArticleCardImage src={imgSrc} alt={title}
                        className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}>
                        <CategoryPlaceholder category={a.category} title={title} />
                      </ArticleCardImage>
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow">
                        Top pick
                      </span>
                      {offer?.price && (
                        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                          {offer.price}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {offer?.badge && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(offer.badge) && <p className="mb-1 text-[11px] font-semibold text-amber-600 truncate">🏆 {offer.badge}</p>}
                      <h2 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">{title}</h2>
                      {description && <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{description}</p>}
                      <p className="mt-3 text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">{tt("home.readReview", "Read review →")}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All picks grid */}
        {rest.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-black text-slate-900">All picks ({rest.length})</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => {
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
                        {offer?.price && (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                            {offer.price}
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
  const title = `${config.title} | Pickly`;
  const description = config.description;
  const url = `${SITE_URL}/${locale}/gifts/${occasion}`;
  return {
    title, description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/gifts/${occasion}`])) },
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
    twitter: { card: "summary_large_image", title, description },
  };
}
