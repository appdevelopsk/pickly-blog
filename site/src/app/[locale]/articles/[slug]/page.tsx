import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LOCALES, DEFAULT_LOCALE, inferMarketFromLocale } from "@/lib/i18n/locales";
import { listArticles, getArticle } from "@/lib/articles/registry";
import { isDeindexed } from "@/lib/articles/deindexed-slugs";
import { CATALOG, pickLink } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { ArticleCrossLinks } from "@/components/articles/ArticleCrossLinks";
import { SisterSiteCta } from "@/components/SisterSiteCta";
import { AffiliateClickTracker } from "@/components/AffiliateClickTracker";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import { loadArticleContent, isArticleBodyTranslated } from "@/lib/i18n/loader";
import { OG_BASE_URL } from "@/lib/og";
import type { ArticleContent } from "@/lib/articles/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

type RawMessages = Record<string, unknown>;

function safeStr(obj: RawMessages, key: string, fallback = ""): string {
  const v = obj[key];
  return typeof v === "string" ? v : fallback;
}

function safeArr<T>(obj: RawMessages, ...keys: string[]): T[] {
  for (const k of keys) {
    if (Array.isArray(obj[k])) return obj[k] as T[];
  }
  return [];
}

function safeObj(obj: RawMessages, key: string): RawMessages | undefined {
  const v = obj[key];
  return v && typeof v === "object" && !Array.isArray(v) ? v as RawMessages : undefined;
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const a of listArticles()) {
      if (!a.locales.includes(locale)) continue;
      if (!hasApprovedAds(a, locale)) continue;
      params.push({ locale, slug: a.slug });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = getArticle(slug);
  if (!meta) notFound();

  // If the article has no translation for this locale, redirect to English.
  // In static export this generates a meta-refresh redirect HTML (no 404).
  if (locale !== DEFAULT_LOCALE && !isArticleBodyTranslated(slug, locale)) {
    redirect(`/${DEFAULT_LOCALE}/articles/${slug}/`);
  }

  // Load only this article's messages (not all 575) — keeps RSC payload small
  const msg = await loadArticleContent(slug, locale);

  const rawSections = safeArr<RawMessages>(msg, "sections");
  let sections: ArticleContent["sections"] = [];
  let products: ArticleContent["products"];

  if (rawSections.length > 0) {
    sections = rawSections.map((s) => ({
      heading: safeStr(s, "heading") || safeStr(s, "title"),
      paragraphs: safeArr<string>(s, "paragraphs") || (s.body ? [s.body as string] : []),
      subsections: s.subsections as ArticleContent["sections"][number]["subsections"],
    }));
  }

  // Products: array format [{offerId, badge, review, pros, cons, grade, scores, specs}]
  // or object format {"offerId": {...}}. Parsed regardless of whether the article also
  // has a `sections` array — many comparison articles carry both, and the rich per-product
  // specs table + per-criteria scores (high-value for AI citation & SEO) were previously
  // dropped. Score data was normalized to a 0-5 scale (ArticleBody renders score/5).
  const parseProduct = (offerId: string, p: RawMessages): NonNullable<ArticleContent["products"]>[number] => ({
    offerId,
    badge: safeStr(p, "badge"),
    review: safeStr(p, "review"),
    pros: safeArr<string>(p, "pros"),
    cons: safeArr<string>(p, "cons"),
    grade: safeStr(p, "grade") || undefined,
    scores: safeObj(p, "scores") as Record<string, number> | undefined,
    specs: safeObj(p, "specs") as Record<string, string> | undefined,
  });
  const rawProductsArr = Array.isArray(msg.products) ? msg.products as RawMessages[] : null;
  if (rawProductsArr) {
    products = rawProductsArr.map((p) => parseProduct(safeStr(p, "offerId"), p));
  } else {
    const rawProductsObj = safeObj(msg, "products");
    if (rawProductsObj) {
      products = Object.entries(rawProductsObj).map(([id, p]) => parseProduct(id, p as RawMessages));
    }
  }

  // buyingGuide → synthesized section, only when the article has no explicit sections
  if (rawSections.length === 0) {
    const rawGuide = safeObj(msg, "buyingGuide");
    if (rawGuide) {
      const factors = rawGuide.factors as Array<{ name: string; detail: string }> | undefined;
      if (Array.isArray(factors) && factors.length > 0) {
        sections.push({
          heading: safeStr(rawGuide, "title"),
          paragraphs: rawGuide.intro ? [rawGuide.intro as string] : [],
          subsections: factors.map((f) => ({ heading: f.name, paragraphs: [f.detail] })),
        });
      }
    }
  }

  const faqs: ArticleContent["faqs"] = safeArr<RawMessages>(msg, "faqs", "faq").map((f) => ({
    q: safeStr(f, "q") || safeStr(f, "question"),
    a: safeStr(f, "a") || safeStr(f, "answer"),
  }));

  const lede = safeStr(msg, "lede") || safeStr(msg, "intro");

  const conclusion = msg.conclusion;
  if (conclusion && typeof conclusion === "string") {
    sections.push({ heading: "", paragraphs: [conclusion] });
  }

  const title = safeStr(msg, "title") || slug;
  const description = safeStr(msg, "description");

  const content: ArticleContent = {
    title,
    description,
    lede,
    sections,
    faqs,
    products,
    offerNotes: (msg.offerNotes ?? {}) as Record<string, string>,
    methodology: typeof msg.methodology === "string" ? msg.methodology : undefined,
    recommendedFor: Array.isArray(msg.recommendedFor)
      ? (msg.recommendedFor as ArticleContent["recommendedFor"])
      : undefined,
  };

  const market = inferMarketFromLocale(locale);
  const offers = CATALOG
    .filter((o) => meta.offerIds.includes(o.id) && pickLink(o, market) !== null)
    .sort((a, b) => meta.offerIds.indexOf(a.id) - meta.offerIds.indexOf(b.id));

  const canonicalUrl = `${SITE_URL}/${locale}/articles/${slug}/`;
  const ogImageUrl = meta.ogImage
    ? meta.ogImage === "auto"
      ? `${OG_BASE_URL}/og/${slug}-${locale}.png`
      : `${OG_BASE_URL}${meta.ogImage}-${locale}.png`
    : null;

  const AUTHOR_PERSON = {
    "@type": "Person",
    name: "Pickly Editorial",
    url: SITE_URL,
    sameAs: ["https://www.pinterest.com/appdevelopsk/", SITE_URL],
  };

  // JSON-LD: ItemList for comparison articles (ranked product list rich result)
  const itemListSchema = meta.type === "comparison" && offers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: offers.length,
    itemListElement: offers.map((o, i) => {
      const product = content.products?.find((p) => p.offerId === o.id);
      const offerName = (o.name as Record<string, string>)[locale] ?? o.name.en ?? o.id;
      const offerDesc = ((o.description as Record<string, string>)[locale] ?? o.description.en) ?? "";
      const imgUrl = o.imageUrl && !o.imageUrl.includes("/images/P/") ? o.imageUrl : undefined;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: offerName,
          url: `${canonicalUrl}#offer-${o.id}`,
          ...(offerDesc ? { description: offerDesc } : {}),
          ...(imgUrl ? { image: imgUrl } : {}),
          ...(o.rating || product?.review ? {
            review: {
              "@type": "Review",
              ...(product?.review ? { reviewBody: product.review } : {}),
              ...(o.rating ? { reviewRating: { "@type": "Rating", ratingValue: o.rating, bestRating: 5, worstRating: 1 } } : {}),
              author: AUTHOR_PERSON,
            },
          } : {}),
        },
      };
    }),
  } : null;

  // JSON-LD: Article + FAQPage + BreadcrumbList
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt,
    url: canonicalUrl,
    ...(ogImageUrl ? { image: ogImageUrl } : {}),
    author: AUTHOR_PERSON,
    publisher: { "@type": "Organization", name: "Pickly", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
    inLanguage: locale,
  };

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE_URL}/${locale}/articles/` },
      { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      <ArticleBody meta={meta} content={content} offers={offers} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {meta.category === "finance" && <SisterSiteCta />}
        <ArticleCrossLinks slug={slug} category={meta.category} />
      </div>
      <AffiliateClickTracker slug={slug} />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = getArticle(slug);
  if (!meta) return {};

  const msg = await loadArticleContent(slug, locale);
  const title = safeStr(msg, "title") || slug;
  const description = safeStr(msg, "description");

  const canonicalUrl = `${SITE_URL}/${locale}/articles/${slug}/`;
  const ogImageUrl = meta.ogImage
    ? meta.ogImage === "auto"
      ? `${OG_BASE_URL}/og/${slug}-${locale}.png`
      : `${OG_BASE_URL}${meta.ogImage}-${locale}.png`
    : null;

  return {
    title,
    description,
    // 厳選(2026-06-29): 需要ゼロ〜微小の死蔵記事は noindex,follow でサイト全体の
    // 品質評価(AdSense低価値/HCU)から外す。ページ自体はライブ維持(Pinterest用)。可逆。
    ...(isDeindexed(slug) ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        meta.locales.map((l) => [l, `${SITE_URL}/${l}/articles/${slug}/`]),
      ),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      siteName: "Pickly",
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt,
      locale,
      ...(ogImageUrl ? {
        images: [{ url: ogImageUrl, width: 1000, height: 1500, alt: title }],
      } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}
