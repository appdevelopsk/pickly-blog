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
import { TAGS, TAG_MAP } from "@/lib/pages/tag-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";
import { resolvePrice } from "@/lib/affiliates/price";
import { ArticleFacets, type FacetItem } from "@/components/ArticleFacets";
import { articleGrade } from "@/lib/articles/grades";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";
/* カテゴリ絵文字とカード描画は ArticleFacets 側へ移動 (2026-09-13)。 */
const TYPE_LABELS: Record<string,string> = { comparison:"Comparison",review:"Review",guide:"Guide" };

function getThumbnail(a: ArticleMeta, locale: string): string | null {
  for (const id of a.offerIds) { const o = CATALOG.find((x) => x.id === id); if (!o) continue; const img = getOfferImageUrl(o); if (img) return img; }
  if (a.ogImage && a.ogImage !== "auto") return `${OG_BASE_URL}${a.ogImage}-${locale}.png`;
  return null;
}
function firstOffer(a: ArticleMeta): AffiliateOffer | null {
  for (const id of a.offerIds) { const o = CATALOG.find((x) => x.id === id); if (o) return o; } return null;
}
function scoreByKeywords(a: ArticleMeta, keywords: string[]): number {
  const slug = a.slug.toLowerCase();
  return keywords.filter((kw) => slug.includes(kw)).length * 10 + a.offerIds.length;
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => TAGS.map((tag) => ({ locale, tag: tag.slug })));
}

interface Props { params: Promise<{ locale: string; tag: string }> }

export default async function TagPage({ params }: Props) {
  const { locale, tag: tagSlug } = await params;
  setRequestLocale(locale);
  const config = TAG_MAP[tagSlug];
  if (!config) notFound();
  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const all = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articles = all
    .filter((a) => config.categories.includes(a.category))
    .sort((a, b) => scoreByKeywords(b, config.slugKeywords) - scoreByKeywords(a, config.slugKeywords))
    .slice(0, 36);

  const schema = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: `${config.label} Products 2026`,
    url: `${SITE_URL}/${locale}/tag/${tagSlug}`,
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
      { "@type": "ListItem", position: 2, name: "Tags", item: `${SITE_URL}/${locale}/tags/` },
      { "@type": "ListItem", position: 3, name: `${config.label} Products`, item: `${SITE_URL}/${locale}/tag/${tagSlug}/` },
    ],
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  // カード表示に要る値をサーバー側で全部解決しておく。badge は元のこのページが
  // 素通しだったので slug 形式の除外はしない(見た目を変えないため)。
  const facetItems: FacetItem[] = articles.map((a) => {
    const { title, description } = loadArticleCardMeta(a.slug, locale);
    const imgSrc = getThumbnail(a, locale);
    const offer = firstOffer(a);
    let catLabel: string = a.category;
    try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
    return {
      slug: a.slug,
      category: a.category,
      catLabel,
      grade: articleGrade(a.offerIds),
      title,
      description,
      imgSrc,
      isProductImg: Boolean(imgSrc && !imgSrc.includes("/og/")),
      price: (offer && resolvePrice(offer, locale)) || null,
      badge: offer?.badge ?? null,
      typeLabel: TYPE_LABELS[a.type] ?? a.type,
      type: a.type,
      offerCount: a.offerIds.length,
    };
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
          <span>/</span>
          <Link href="/tags" className="hover:text-slate-600 transition-colors">Tags</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{config.icon} {config.label}</span>
        </nav>

        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-1.5 text-xs font-bold text-teal-700">
            {config.icon} {tt(`tagPages.${tagSlug}.label`, config.label)}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {tt("pages.bestTagProducts", `Best ${config.label.toLowerCase()} products 2026`, { tag: tt(`tagPages.${tagSlug}.label`, config.label) })}
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">{tt(`tagPages.${tagSlug}.description`, config.description)}</p>
        </section>

        {/* Other tags */}
        <nav className="mb-10 flex flex-wrap gap-2">
          {TAGS.filter((tg) => tg.slug !== tagSlug).map((tg) => (
            <Link key={tg.slug} href={`/tag/${tg.slug}`} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-colors">
              {tg.icon} {tt(`tagPages.${tg.slug}.label`, tg.label)}
            </Link>
          ))}
        </nav>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="font-semibold text-slate-700">{tt("pages.noTagArticles", "No articles found for this tag yet.")}</p>
          </div>
        ) : (
          /* ★カードの描画は ArticleFacets の中。ここから関数を渡してはいけない
             (Server→Client に関数は渡せず prerender が落ちる。2026-09-13 に一度やった)。
             表示に要る値はすべてここで解決し、シリアライズ可能な配列だけ渡す。 */
          <ArticleFacets items={facetItems} />
        )}
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, tag } = await params;
  const config = TAG_MAP[tag];
  if (!config) return {};
  // ★本文はこの翻訳を 17 言語で出しているのに、metadata だけ英語直書きだった。
  //   SERP に出るのは metadata の方なので、本文と同じキーを引く (2026-08-04)。
  const t = await getTranslations({ locale });
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };
  const label = tt(`tagPages.${tag}.label`, config.label);
  const title = tt("pages.bestTagProducts", `Best ${config.label} Products 2026`, { tag: label });
  const description = tt(`tagPages.${tag}.description`, config.description);
  const url = `${SITE_URL}/${locale}/tag/${tag}`;
  return {
    title: serpTitle(title), description,
    alternates: localeAlternates(`/tag/${tag}`, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, type: "website", title, description, url, siteName: "Pickly" },
  };
}
