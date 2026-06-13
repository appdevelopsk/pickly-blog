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
          Search reviews
        </h1>
        <p className="mt-2 text-base text-slate-500">
          {articles.length} reviews across 10 categories — find what you're looking for.
        </p>
      </section>

      {/* Search UI (client component) */}
      <SearchUI items={items} totalCount={articles.length} />

    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "Search Product Reviews | Pickly";
  const description = "Search hundreds of product reviews and comparisons across fitness, tech, home, beauty, food, and more.";
  const canonicalUrl = `${SITE_URL}/${locale}/search`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/search`])),
    },
    openGraph: { type: "website", title, description, url: canonicalUrl, siteName: "Pickly" },
    twitter: { card: "summary", title, description },
  };
}
