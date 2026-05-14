import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES, inferMarketFromLocale } from "@/lib/i18n/locales";
import { listArticles, getArticle } from "@/lib/articles/registry";
import { CATALOG, pickLink } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { AffiliateClickTracker } from "@/components/AffiliateClickTracker";
import type { ArticleContent } from "@/lib/articles/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

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

function safeRaw(t: Awaited<ReturnType<typeof getTranslations>>, key: string): unknown {
  try {
    const v = t.raw(key);
    const lastSegment = key.split(".").pop() ?? key;
    if (typeof v === "string" && (v === key || v === lastSegment)) return undefined;
    return v;
  } catch { return undefined; }
}

function safeT(t: Awaited<ReturnType<typeof getTranslations>>, key: string, fallback = ""): string {
  try {
    const v = t(key);
    // getMessageFallback が key の末尾セグメント ("lede" など) を返すため両方チェック
    const lastSegment = key.split(".").pop() ?? key;
    return (v === key || v === lastSegment) ? fallback : v;
  } catch { return fallback; }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = getArticle(slug);
  if (!meta) notFound();

  const t = await getTranslations();

  const rawSections = safeRaw(t, `articles.${slug}.sections`);
  let sections: ArticleContent["sections"] = [];
  let products: ArticleContent["products"];

  if (Array.isArray(rawSections)) {
    sections = rawSections.map((s: Record<string, unknown>) => ({
      heading: (s.heading ?? s.title ?? "") as string,
      paragraphs: Array.isArray(s.paragraphs)
        ? (s.paragraphs as string[])
        : s.body ? [s.body as string] : [],
      subsections: s.subsections as ArticleContent["sections"][number]["subsections"],
    }));
  } else {
    const rawProducts = safeRaw(t, `articles.${slug}.products`) as Record<string, Record<string, string>> | undefined;
    const rawGuide = safeRaw(t, `articles.${slug}.buyingGuide`) as Record<string, unknown> | undefined;

    if (rawProducts) {
      products = Object.entries(rawProducts).map(([id, p]) => ({
        offerId: id,
        badge: String(p.badge ?? ""),
        review: String(p.review ?? ""),
        pros: Array.isArray((p as unknown as Record<string, unknown>).pros)
          ? ((p as unknown as Record<string, unknown>).pros as string[])
          : undefined,
        cons: Array.isArray((p as unknown as Record<string, unknown>).cons)
          ? ((p as unknown as Record<string, unknown>).cons as string[])
          : undefined,
      }));
    }

    if (rawGuide) {
      const factors = rawGuide.factors as Array<{ name: string; detail: string }> | undefined;
      if (Array.isArray(factors) && factors.length > 0) {
        sections.push({
          heading: (rawGuide.title ?? "") as string,
          paragraphs: (rawGuide.intro as string) ? [rawGuide.intro as string] : [],
          subsections: factors.map((f) => ({ heading: f.name, paragraphs: [f.detail] })),
        });
      }
    }
  }

  const rawFaqsNew = safeRaw(t, `articles.${slug}.faqs`);
  const rawFaqsOld = safeRaw(t, `articles.${slug}.faq`);
  const rawFaqSource = Array.isArray(rawFaqsNew) ? rawFaqsNew : Array.isArray(rawFaqsOld) ? rawFaqsOld : [];
  const faqs: ArticleContent["faqs"] = rawFaqSource.map((f: Record<string, unknown>) => ({
    q: (f.q ?? f.question ?? "") as string,
    a: (f.a ?? f.answer ?? "") as string,
  }));

  const lede = safeT(t, `articles.${slug}.lede`) || safeT(t, `articles.${slug}.intro`);

  const conclusion = safeRaw(t, `articles.${slug}.conclusion`) as string | undefined;
  if (conclusion && typeof conclusion === "string") {
    sections.push({ heading: "", paragraphs: [conclusion] });
  }

  const title = safeT(t, `articles.${slug}.title`, slug);
  const description = safeT(t, `articles.${slug}.description`);

  const content: ArticleContent = {
    title,
    description,
    lede,
    sections,
    faqs,
    products,
    offerNotes: (safeRaw(t, `articles.${slug}.offerNotes`) ?? {}) as Record<string, string>,
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
    author: { "@type": "Organization", name: "Pickly", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Pickly", url: SITE_URL },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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

  const t = await getTranslations();
  const title = safeT(t, `articles.${slug}.title`, slug);
  const description = safeT(t, `articles.${slug}.description`);

  const canonicalUrl = `${SITE_URL}/${locale}/articles/${slug}/`;
  const ogImageUrl = meta.ogImage
    ? meta.ogImage === "auto"
      ? `${SITE_URL}/og/${slug}-${locale}.png`
      : `${SITE_URL}${meta.ogImage}-${locale}.png`
    : null;

  return {
    title,
    description,
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
