import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES, INDEXED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
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
import { serpTitle } from "@/lib/seo/title";

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
  // 比較対象2記事のどちらもそのロケールで出せない組み合わせは、本文側で notFound() に
  // なる＝静的エクスポートでは「HTTP 200 なのに中身は404ページ」というソフト404になる。
  // 生成条件を本文の判定(listArticlesForLocale × hasApprovedAds)と一致させ、
  // 出せない組み合わせは最初から生成しない(=素直に404になる) (2026-07-29)。
  return LOCALES.flatMap((locale) => {
    const available = new Set(
      listArticlesForLocale(locale)
        .filter((a) => hasApprovedAds(a, locale))
        .map((a) => a.slug),
    );
    return COMPARISONS.filter(
      (c) => available.has(c.slugA) || available.has(c.slugB),
    ).map((c) => ({ locale, pair: c.slug }));
  });
}

interface Props { params: Promise<{ locale: string; pair: string }> }

export default async function ComparePage({ params }: Props) {
  const { locale, pair } = await params;
  setRequestLocale(locale);

  // 「More comparisons」も生成条件と揃える。COMPARISONS 全件から選んでいたため、
  // そのロケールで生成されない比較ページへの内部404リンクを量産していた
  // (14種125箇所のうち111箇所がここ由来) (2026-08-01)。
  const availableSlugsForLocale = new Set(
    listArticlesForLocale(locale)
      .filter((a) => hasApprovedAds(a, locale))
      .map((a) => a.slug),
  );
  const moreComparisons = COMPARISONS.filter(
    (c) =>
      c.slug !== pair &&
      (availableSlugsForLocale.has(c.slugA) || availableSlugsForLocale.has(c.slugB)),
  ).slice(0, 6);
  const config = COMPARISON_MAP[pair];
  if (!config) notFound();

  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
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
                <p className="text-sm text-slate-400">{tt("pages.notInLanguage", "Not available in this language yet.")}</p>
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
          <h2 className="mb-4 text-lg font-black text-slate-900">{tt("pages.howToDecide", "How to decide")}</h2>
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
          <h2 className="mb-4 text-lg font-black text-slate-900">{tt("pages.moreComparisons", "More comparisons")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {moreComparisons.map((c) => (
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
  const metaLocales = INDEXED_LOCALES.filter((l: Locale) => {
    const av = new Set(
      listArticlesForLocale(l)
        .filter((a) => hasApprovedAds(a, l))
        .map((a) => a.slug),
    );
    return av.has(config.slugA) || av.has(config.slugB);
  });
  // ★本文は comparePages.<pair> の翻訳を使っているのに、ここだけ英語直書きだった。
  //   結果 /ja/compare/... の <title> が英語のまま SERP に出ていた(全135ページ)。
  //   本文と同じ翻訳を引き、足りなければ英語へ落ちる。
  const t = await getTranslations({ locale });
  // ★t() は throw しない。request.ts の getMessageFallback が空文字を返す設計なので
  //   catch は永久に発火せず、キーが欠けるとタイトルが空になる。空なら未翻訳と判定する。
  const tt = (key: string, fallback: string): string => {
    const v = t(key);
    return v ? v : fallback;
  };
  const base = tt(`comparePages.${pair}.title`, config.title);
  const suffix = tt("compareTitleSuffix", ": Which Is Better?");
  // 表示幅60を超えるなら接尾辞を落とす。全角は2幅なので CJK は文字数では測れない。
  const width = (x: string) => [...x].reduce((n, c) => n + (/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(c) ? 2 : 1), 0);
  const withSuffix = `${base}${suffix}`;
  const title = width(withSuffix) <= 60 ? withSuffix : base;
  const description = tt(`comparePages.${pair}.description`, config.description);
  const url = `${SITE_URL}/${locale}/compare/${pair}`;
  return {
    // absolute にしないと root layout の `%s | Pickly` が付いて 9 幅ぶん切れる
    // (記事ページは 2026-08-01 に同じ対処済み)。
    title: serpTitle(title), description,
    // hreflang は生成される組み合わせだけ宣言する。以前は LOCALES 全17件を出しており、
    // 生成されないロケールを指す 404 が 118件あった。末尾スラッシュも揃える (2026-08-02)。
    alternates: {
      canonical: `${url}/`,
      languages: {
        ...Object.fromEntries(metaLocales.map((l: Locale) => [l, `${SITE_URL}/${l}/compare/${pair}/`])),
        ...(metaLocales.includes(DEFAULT_LOCALE)
          ? { "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/compare/${pair}/` }
          : {}),
      },
    },
    openGraph: { type: "article", title, description, url, siteName: "Pickly" },
    twitter: { card: "summary_large_image", title, description },
  };
}
