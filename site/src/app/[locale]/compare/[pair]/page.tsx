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
import { COMPARISONS, COMPARISON_MAP } from "@/lib/pages/compare-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

function getThumbnail(a: ArticleMeta, locale: string): string | null {
  for (const id of a.offerIds) { const o = CATALOG.find((x) => x.id === id); if (!o) continue; const img = getOfferImageUrl(o); if (img) return img; }
  if (a.ogImage && a.ogImage !== "auto") return `${OG_BASE_URL}${a.ogImage}-${locale}.png`;
  return null;
}
function firstOffer(a: ArticleMeta): AffiliateOffer | null {
  for (const id of a.offerIds) { const o = CATALOG.find((x) => x.id === id); if (o) return o; } return null;
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => COMPARISONS.map((c) => ({ locale, pair: c.slug })));
}

interface Props { params: Promise<{ locale: string; pair: string }> }

export default async function ComparePage({ params }: Props) {
  const { locale, pair } = await params;
  setRequestLocale(locale);
  const config = COMPARISON_MAP[pair];
  if (!config) notFound();

  const t = await getTranslations();
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
  };

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articleMap = new Map(allArticles.map((a) => [a.slug, a]));
  const artA = articleMap.get(config.slugA);
  const artB = articleMap.get(config.slugB);

  if (!artA && !artB) notFound();

  const metaA = artA ? loadArticleCardMeta(artA.slug, locale) : null;
  const metaB = artB ? loadArticleCardMeta(artB.slug, locale) : null;
  const offerA = artA ? firstOffer(artA) : null;
  const offerB = artB ? firstOffer(artB) : null;
  const imgA = artA ? getThumbnail(artA, locale) : null;
  const imgB = artB ? getThumbnail(artB, locale) : null;

  const schema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: config.title,
    description: config.description,
    url: `${SITE_URL}/${locale}/compare/${pair}`,
    ...(artA && metaA ? { about: { "@type": "Product", name: metaA.title } } : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/${locale}/compare/` },
      { "@type": "ListItem", position: 3, name: config.title, item: `${SITE_URL}/${locale}/compare/${pair}/` },
    ],
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="mx-auto max-w-5xl px-4 pb-20">

        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
          <span>/</span>
          <Link href="/compare" className="hover:text-slate-600 transition-colors">Compare</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium line-clamp-1">{config.title}</span>
        </nav>

        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-4 py-1.5 text-xs font-bold text-indigo-700">
            ⚖️ Head-to-head
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {tt(`comparePages.${pair}.title`, config.title)}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500 leading-relaxed">{tt(`comparePages.${pair}.description`, config.description)}</p>
        </section>

        {/* Side-by-side hero */}
        <div className="mb-12 grid gap-4 md:grid-cols-2">
          {[
            { art: artA, meta: metaA, offer: offerA, img: imgA, label: "Option A" },
            { art: artB, meta: metaB, offer: offerB, img: imgB, label: "Option B" },
          ].map(({ art, meta, offer, img, label }) => {
            if (!art || !meta) return (
              <div key={label} className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="text-sm text-slate-400">Not available in this language yet.</p>
              </div>
            );
            const isProductImg = img && !img.includes("/og/");
            return (
              <Link key={art.slug} href={`/articles/${art.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white shadow-sm transition-all hover:border-indigo-400 hover:shadow-xl">
                <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                  <ArticleCardImage src={img} alt={meta.title} className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${isProductImg ? "object-contain p-6" : "object-cover"}`}>
                    <CategoryPlaceholder category={art.category} title={meta.title} />
                  </ArticleCardImage>
                  {offer?.price && <span className="absolute bottom-3 right-3 rounded-full bg-white/95 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">from {offer.price}</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {offer?.badge && <p className="mb-1.5 text-xs font-semibold text-amber-600">🏆 {offer.badge}</p>}
                  <h2 className="mb-2 text-base font-black leading-snug text-slate-900 group-hover:text-brand-700 transition-colors">{meta.title}</h2>
                  {meta.description && <p className="flex-1 text-sm text-slate-500 leading-relaxed line-clamp-3">{meta.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{tt("pages.picksReviewed", `${art.offerIds.length} picks reviewed`, { count: art.offerIds.length })}</span>
                    <span className="text-xs font-semibold text-brand-600 group-hover:underline">Full review →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* VS separator */}
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="rounded-full border-2 border-indigo-300 bg-white px-4 py-1 text-sm font-black text-indigo-600">VS</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Quick verdict */}
        <div className="mb-12 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 md:p-8">
          <h2 className="mb-4 text-lg font-black text-slate-900">How to decide</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {artA && metaA && (
              <div className="rounded-xl border border-indigo-200 bg-white p-4">
                <p className="mb-2 text-xs font-bold text-indigo-600 uppercase tracking-wide">Choose {(metaA.title.split(":")[0] ?? metaA.title).split("–")[0]?.trim()} if…</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  You want the most comprehensive comparison with {artA.offerIds.length} options tested, covering the widest range of budgets and use cases.
                </p>
                <Link href={`/articles/${artA.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                  Read full review →
                </Link>
              </div>
            )}
            {artB && metaB && (
              <div className="rounded-xl border border-indigo-200 bg-white p-4">
                <p className="mb-2 text-xs font-bold text-indigo-600 uppercase tracking-wide">Choose {(metaB.title.split(":")[0] ?? metaB.title).split("–")[0]?.trim()} if…</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  You want a focused comparison with {artB.offerIds.length} options and need a specific type of product that best fits your lifestyle.
                </p>
                <Link href={`/articles/${artB.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                  Read full review →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Other comparisons */}
        <section>
          <h2 className="mb-4 text-lg font-black text-slate-900">More comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPARISONS.filter((c) => c.slug !== pair).slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-md">
                <span className="shrink-0 text-lg" aria-hidden>⚖️</span>
                <p className="text-sm font-bold text-slate-800 group-hover:text-brand-700 transition-colors line-clamp-2">{c.title}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, pair } = await params;
  const config = COMPARISON_MAP[pair];
  if (!config) return {};
  const title = `${config.title}: Which Is Better? | Pickly`;
  const url = `${SITE_URL}/${locale}/compare/${pair}`;
  return {
    title, description: config.description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/compare/${pair}`])) },
    openGraph: { type: "article", title, description: config.description, url, siteName: "Pickly" },
    twitter: { card: "summary_large_image", title, description: config.description },
  };
}
