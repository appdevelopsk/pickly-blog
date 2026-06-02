import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LOCALES, inferMarketFromLocale } from "@/lib/i18n/locales";
import { listArticles, getArticle } from "@/lib/articles/registry";
import { CATALOG, pickLink } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { AffiliateClickTracker } from "@/components/AffiliateClickTracker";
import { loadArticleContent, isArticleBodyTranslated } from "@/lib/i18n/loader";
import type { ArticleContent } from "@/lib/articles/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

/** ブランドの組織エンティティ。author/publisher で共有。sameAs は実在・検証済みの公式アカウントのみ。 */
const ORGANIZATION = {
  "@type": "Organization",
  name: "Pickly",
  url: SITE_URL,
  sameAs: ["https://www.pinterest.com/appdevelopsk/"],
} as const;

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
  } else {
    const rawProducts = safeObj(msg, "products");
    const rawGuide = safeObj(msg, "buyingGuide");

    if (rawProducts) {
      products = Object.entries(rawProducts).map(([id, p]) => {
        const prod = p as RawMessages;
        return {
          offerId: id,
          badge: safeStr(prod, "badge"),
          review: safeStr(prod, "review"),
          pros: safeArr<string>(prod, "pros"),
          cons: safeArr<string>(prod, "cons"),
        };
      });
    }

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
  };

  const market = inferMarketFromLocale(locale);
  const offers = CATALOG
    .filter((o) => meta.offerIds.includes(o.id) && pickLink(o, market) !== null)
    .sort((a, b) => meta.offerIds.indexOf(a.id) - meta.offerIds.indexOf(b.id));

  const canonicalUrl = `${SITE_URL}/${locale}/articles/${slug}/`;
  const ogImageUrl = meta.ogImage
    ? meta.ogImage === "auto"
      ? `${SITE_URL}/og/${slug}-${locale}.png`
      : `${SITE_URL}${meta.ogImage}-${locale}.png`
    : null;

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
    author: ORGANIZATION,
    publisher: ORGANIZATION,
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

  // JSON-LD: ItemList of compared products (ratings are rendered visibly by ArticleBody — see StarRating).
  const reviewByOffer = new Map((products ?? []).map((p) => [p.offerId, p.review]));
  const itemListSchema = offers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: offers.length,
    itemListElement: offers.map((o, i) => {
      const name = (o.name as Record<string, string>)?.[locale] ?? o.name?.en ?? o.id;
      const desc = ((o.description as Record<string, string>)?.[locale] ?? o.description?.en) ?? "";
      const img = o.imageUrl && !o.imageUrl.includes("/images/P/") ? o.imageUrl : undefined;
      const review = reviewByOffer.get(o.id);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name,
          url: `${canonicalUrl}#offer-${o.id}`,
          ...(desc ? { description: desc } : {}),
          ...(img ? { image: img } : {}),
          ...((o.rating || review) ? {
            review: {
              "@type": "Review",
              ...(review ? { reviewBody: review } : {}),
              ...(o.rating ? { reviewRating: { "@type": "Rating", ratingValue: o.rating, bestRating: 5, worstRating: 1 } } : {}),
              author: ORGANIZATION,
            },
          } : {}),
        },
      };
    }),
  } : null;

  return (
    <>
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
        <RelatedArticles slug={slug} category={meta.category} locale={locale} />
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
      ? `${SITE_URL}/og/${slug}-${locale}.png`
      : `${SITE_URL}${meta.ogImage}-${locale}.png`
    : null;

  // Only locales that are built AND actually translated belong in the index and
  // the hreflang cluster. A built-but-untranslated locale shows an English body
  // under a localized title — keep it out of the index so the 17-locale catalog
  // isn't read as scaled/auto-generated content. Must match sitemap.ts.
  const indexLocales = meta.locales.filter(
    (l) =>
      LOCALES.includes(l) &&
      hasApprovedAds(meta, l) &&
      isArticleBodyTranslated(slug, l),
  );
  const translated = isArticleBodyTranslated(slug, locale);
  const languages: Record<string, string> = Object.fromEntries(
    indexLocales.map((l) => [l, `${SITE_URL}/${l}/articles/${slug}/`]),
  );
  if (indexLocales.includes("en")) {
    languages["x-default"] = `${SITE_URL}/en/articles/${slug}/`;
  }

  return {
    title,
    description,
    ...(translated ? {} : { robots: { index: false, follow: true } }),
    alternates: {
      canonical: canonicalUrl,
      languages,
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
