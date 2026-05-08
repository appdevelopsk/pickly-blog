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

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = getArticle(slug);
  if (!meta) notFound();

  const t = await getTranslations();
  const content: ArticleContent = {
    title: t(`articles.${slug}.title`),
    description: t(`articles.${slug}.description`),
    lede: t(`articles.${slug}.lede`),
    sections: t.raw(`articles.${slug}.sections`) as ArticleContent["sections"],
    faqs: t.raw(`articles.${slug}.faqs`) as ArticleContent["faqs"],
    offerNotes: t.raw(`articles.${slug}.offerNotes`) as Record<string, string>,
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
