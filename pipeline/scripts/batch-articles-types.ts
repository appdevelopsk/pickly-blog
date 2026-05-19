import type { ArticleCategory } from "../../site/src/lib/articles/types";

export type NewOffer = {
  id: string;
  nameEn: string;
  nameJa: string;
  descEn: string;
  descJa: string;
  priceMin: string;
  priceMax: string;
  category: ArticleCategory;
  badge: string;
  url: string;
};

export type Section = {
  heading: string;
  paragraphs: string[];
};

export type Faq = { q: string; a: string };

export type Product = {
  badge: string;
  review: string;
  pros: string[];
  cons: string[];
};

export type FullContent = {
  title: string;
  description: string;
  lede: string;
  methodology: string;
  sections: Section[];
  faqs: Faq[];
  products: Record<string, Product>;
  offerNotes: Record<string, string>;
  pinDescription: string;
};

export type Translation = {
  title: string;
  description: string;
  lede: string;
};

export type ArticleDef = {
  slug: string;
  category: ArticleCategory;
  offers: { id: string }[];
  en: FullContent;
  ja: FullContent;
  translations: {
    "zh-CN": Translation;
    "zh-TW": Translation;
    ko: Translation;
    es: Translation;
    "pt-BR": Translation;
    fr: Translation;
    de: Translation;
    it: Translation;
    ru: Translation;
    ar: Translation;
    hi: Translation;
    id: Translation;
    th: Translation;
    vi: Translation;
    tr: Translation;
  };
};
