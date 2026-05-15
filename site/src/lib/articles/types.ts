import type { Locale } from "@/lib/i18n/locales";

/**
 * 記事の3類型。Pinterest流入と相性の良い形式に絞る。
 *  - review: 単品レビュー（"X 徹底レビュー"）
 *  - comparison: 比較ランキング（"Best 5 X for Y", "X vs Y vs Z"）
 *  - guide: バイヤーズガイド（"How to choose X", "X 完全ガイド"）
 */
export type ArticleType = "review" | "comparison" | "guide";

export type ArticleCategory =
  | "tech"          // ガジェット、ソフトウェア、SaaS
  | "home"          // インテリア、家電、収納
  | "beauty"        // コスメ、スキンケア
  | "fashion"       // 衣料、アクセサリー
  | "fitness"       // フィットネス、サプリ
  | "food"          // 調理器具、食材、レシピ
  | "finance"       // 金融サービス、クレカ、証券
  | "travel"        // 旅行、ホテル、航空券
  | "parenting"     // 育児用品、教材
  | "pets";         // ペット用品

export interface ArticleMeta {
  /** URL slug — kebab-case, used in /[locale]/articles/<slug> */
  slug: string;
  type: ArticleType;
  category: ArticleCategory;
  /** Primary product/topic IDs from affiliate catalog */
  offerIds: string[];
  /** Article published date (ISO 8601) */
  publishedAt: string;
  /** Last update date */
  updatedAt: string;
  /** Locales the article is available in. Pages are pre-rendered only for these. */
  locales: Locale[];
  /** Pinterest pin status — true once pinned, prevents re-posting */
  pinned?: Partial<Record<Locale, boolean>>;
  /** OG image source: "auto" generates from template, or path under /public/og/ */
  ogImage?: "auto" | string;
}

export interface ArticleSection {
  heading: string;
  /** 段落配列 — 1段落 = 1論点 */
  paragraphs: string[];
  /** Optional subsections for buyer's guide style content */
  subsections?: { heading: string; paragraphs: string[] }[];
}

export interface ArticleFAQ {
  q: string;
  a: string;
}

export interface ArticleProduct {
  offerId: string;
  badge: string;
  review: string;
  pros?: string[];
  cons?: string[];
  /** Optional spec comparison table rows (e.g. { "Weight": "2.4 kg", "Battery": "~3 hrs" }) */
  specs?: Record<string, string>;
  /** Optional per-criteria scores out of 5 (e.g. { "Ease of use": 4.5, "Effectiveness": 4.8 }) */
  scores?: Record<string, number>;
}

/**
 * Per-locale article content. JSON keyed by locale.
 * Stored in src/articles/<slug>/messages/<locale>.json
 */
export interface ArticleContent {
  title: string;
  /** SEO meta description, 120-160 chars */
  description: string;
  /** Short hook shown above the article body */
  lede: string;
  sections: ArticleSection[];
  faqs: ArticleFAQ[];
  products?: ArticleProduct[];
  /** Optional per-offer note shown next to the affiliate link */
  offerNotes?: Record<string, string>;
  /** Pinterest pin description — emotional, 120-200 chars, no "click here" */
  pinDescription?: string;
  /** Optional methodology/testing criteria statement shown before the ranking */
  methodology?: string;
}
