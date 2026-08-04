import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL } from "@/lib/og";
import { SearchUI, type SearchItem } from "@/components/SearchUI";
import type { ArticleMeta } from "@/lib/articles/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

function buildSearchItem(a: ArticleMeta, locale: string, catLabel: string): SearchItem {
  const { title, description } = loadArticleCardMeta(a.slug, locale);

  let imgSrc: string | null = null;
  let isProductImg = false;
  for (const offerId of a.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) { imgSrc = img; isProductImg = true; break; }
  }
  if (!imgSrc && a.ogImage && a.ogImage !== "auto") {
    imgSrc = `${OG_BASE_URL}${a.ogImage}-${locale}.png`;
  }

  const firstOffer = a.offerIds
    .map((id) => CATALOG.find((o) => o.id === id))
    .find(Boolean);

  return {
    slug: a.slug,
    title,
    description,
    category: a.category,
    catLabel,
    imgSrc,
    isProductImg,
    price: firstOffer?.price ?? null,
    badge: firstOffer?.badge ?? null,
    offerCount: a.offerIds.length,
    typeLabel: TYPE_LABELS[a.type] ?? a.type,
    type: a.type,
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const articles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));

  const items: SearchItem[] = articles.map((a) => {
    let catLabel: string = a.category;
    try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
    return buildSearchItem(a, locale, catLabel);
  });

  // Sort by newest first for default display
  items.sort((a, b) => {
    const aSlug = a.slug;
    const bSlug = b.slug;
    return bSlug.localeCompare(aSlug);
  });

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">

      {/* Breadcrumb */}
      <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400" aria-label="breadcrumb">
        <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">Search</span>
      </nav>

      {/* Header */}
      <section className="py-10 md:py-12">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          {tt("pages.searchHeading", "Search reviews")}
        </h1>
        <p className="mt-2 text-base text-slate-500">
          {tt("pages.searchDesc", `${articles.length} reviews across 10 categories — find what you\u2019re looking for.`, { count: articles.length, categories: 10 })}
        </p>
      </section>

      {/* Search UI (client component) */}
      <SearchUI items={items} totalCount={articles.length} />

    </div>
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
  const title = tt("pages.searchHeading", "Search reviews");
  // searchDesc は {count} と {categories} を要求する。渡さないと FORMATTING_ERROR に
  // なって英語のフォールバックへ落ちる (ビルドログにだけ出るので気づきにくい)。
  const indexed = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const description = tt(
    "pages.searchDesc",
    `${indexed.length} reviews across 10 categories — find what you're looking for.`,
    { count: indexed.length, categories: 10 },
  );
  const canonicalUrl = `${SITE_URL}/${locale}/search`;
  return {
    title: serpTitle(title),
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: localeAlternates("/search", locale).languages,
    },
    openGraph: { type: "website", title, description, url: canonicalUrl, siteName: "Pickly" },
    twitter: { card: "summary", title, description },
  };
}
