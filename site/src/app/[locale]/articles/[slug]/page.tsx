import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { listArticles, getArticle } from "@/lib/articles/registry";
import { CATALOG } from "@/lib/affiliates/catalog";
import { ArticleBody } from "@/components/articles/ArticleBody";
import type { ArticleContent } from "@/lib/articles/types";

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const a of listArticles()) {
      if (a.locales.includes(locale)) params.push({ locale, slug: a.slug });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// Safely call t.raw() — returns undefined instead of throwing on missing keys.
function safeRaw(t: Awaited<ReturnType<typeof getTranslations>>, key: string): unknown {
  try {
    return t.raw(key);
  } catch {
    return undefined;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = getArticle(slug);
  if (!meta) notFound();

  const t = await getTranslations();

  // Build sections from whichever format the article uses:
  // 1. sections[] with { heading, paragraphs[] }  — new format
  // 2. sections[] with { offerId, title, body }    — legacy format
  // 3. products{} + buyingGuide{}                 — comparison format
  const rawSections = safeRaw(t, `articles.${slug}.sections`);
  let sections: ArticleContent["sections"] = [];

  if (Array.isArray(rawSections)) {
    sections = rawSections.map((s: Record<string, unknown>) => ({
      heading: (s.heading ?? s.title ?? "") as string,
      paragraphs: Array.isArray(s.paragraphs)
        ? (s.paragraphs as string[])
        : s.body
          ? [s.body as string]
          : [],
      subsections: s.subsections as ArticleContent["sections"][number]["subsections"],
    }));
  } else {
    // Comparison format: build sections from products + buyingGuide
    const rawProducts = safeRaw(t, `articles.${slug}.products`) as Record<string, Record<string, string>> | undefined;
    const rawGuide = safeRaw(t, `articles.${slug}.buyingGuide`) as Record<string, unknown> | undefined;

    if (rawProducts) {
      for (const [, product] of Object.entries(rawProducts)) {
        const badge = product.badge ?? "";
        const review = product.review ?? "";
        const name = product.name ?? "";
        sections.push({
          heading: badge ? `${badge}: ${name}` : name,
          paragraphs: review ? [review] : [],
        });
      }
    }

    if (rawGuide) {
      const factors = rawGuide.factors as Array<{ name: string; detail: string }> | undefined;
      if (Array.isArray(factors) && factors.length > 0) {
        const guideTitle = (rawGuide.title ?? "") as string;
        const guideIntro = (rawGuide.intro ?? "") as string;
        sections.push({
          heading: guideTitle,
          paragraphs: guideIntro ? [guideIntro] : [],
          subsections: factors.map((f) => ({
            heading: f.name,
            paragraphs: [f.detail],
          })),
        });
      }
    }
  }

  // Build faqs from whichever format the article uses:
  // 1. faqs[] with { q, a }              — new format
  // 2. faqs[] with { question, answer }  — legacy format
  // 3. faq[] with { question, answer }   — comparison format
  const rawFaqsNew = safeRaw(t, `articles.${slug}.faqs`);
  const rawFaqsOld = safeRaw(t, `articles.${slug}.faq`);
  const rawFaqSource = Array.isArray(rawFaqsNew) ? rawFaqsNew : Array.isArray(rawFaqsOld) ? rawFaqsOld : [];
  const faqs: ArticleContent["faqs"] = rawFaqSource.map((f: Record<string, unknown>) => ({
    q: (f.q ?? f.question ?? "") as string,
    a: (f.a ?? f.answer ?? "") as string,
  }));

  // lede: try both "lede" and "intro" keys
  let lede = "";
  try { lede = t(`articles.${slug}.lede`); } catch { /* missing key */ }
  if (!lede) try { lede = t(`articles.${slug}.intro`); } catch { /* missing key */ }

  // conclusion: append to sections if present
  const conclusion = safeRaw(t, `articles.${slug}.conclusion`) as string | undefined;
  if (conclusion && typeof conclusion === "string") {
    sections.push({ heading: "", paragraphs: [conclusion] });
  }

  const content: ArticleContent = {
    title: t(`articles.${slug}.title`),
    description: t(`articles.${slug}.description`),
    lede,
    sections,
    faqs,
    offerNotes: (safeRaw(t, `articles.${slug}.offerNotes`) ?? {}) as Record<string, string>,
  };

  const offers = CATALOG.filter((o) => meta.offerIds.includes(o.id))
    .sort((a, b) => meta.offerIds.indexOf(a.id) - meta.offerIds.indexOf(b.id));

  return <ArticleBody meta={meta} content={content} offers={offers} />;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return {
    title: t(`articles.${slug}.title`),
    description: t(`articles.${slug}.description`),
  };
}
