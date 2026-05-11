import type { ArticleCategory } from "@/lib/articles/types";

/**
 * サポートするASP（アフィリエイトサービスプロバイダ）。
 * 新規ASPを追加する場合、`asp.ts` に URL builder を追加する。
 */
export type AspNetwork =
  | "amazon-jp"
  | "amazon-us"
  | "amazon-uk"
  | "amazon-de"
  | "a8"
  | "moshimo"
  | "valuecommerce"
  | "rakuten-affiliate"
  | "shareasale"
  | "cj"        // CJ Affiliate (Commission Junction)
  | "impact"    // Impact.com
  | "awin"
  | "direct";   // Direct partnership / company affiliate program

export type Market = "global" | "JP" | "US" | "EU" | "UK" | "CN";

/**
 * 1つの ASP との提携 = 1 link binding。
 * 同一商品でも国別 ASP が違うので複数持つことが普通。
 */
export interface AspLink {
  network: AspNetwork;
  /** ASP固有の商品/案件ID。Amazonならasin、A8ならmid+pidなど */
  productId: string;
  /** Optional override URL — e.g. moshimoが返す独自リンク。あれば優先される */
  rawUrl?: string;
  /** どのlocale/marketで使うか。マッチしない場合フォールバック検索 */
  markets: Market[];
  /** 提携ステータス。falseならUI上で無効化される */
  approved: boolean;
}

export interface AffiliateOffer {
  /** Unique ID across the catalog. Stable for analytics. */
  id: string;
  category: ArticleCategory;
  /** Brand/product name shown in UI. Locale-keyed. */
  name: Record<string, string>;
  /** 1-2 sentence description. Locale-keyed. */
  description: Record<string, string>;
  /** CTA label override. Falls back to t("offer.cta") */
  cta?: Record<string, string>;
  /** Optional brand emoji/badge (no third-party logos) */
  badge?: string;
  /** Multiple ASP bindings — picker resolves best match by locale/market */
  links: AspLink[];
  /** Product image URL (Amazon CDN or brand site). Optional — shows category placeholder when absent. */
  imageUrl?: string;
}

export interface AffiliatePolicy {
  maxPerSlot: number;
  disclosureLabel: Record<string, string>;
}
