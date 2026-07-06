import fs from "fs";
import path from "path";
import { getRelatedArticles } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import type { ArticleMeta } from "@/lib/articles/types";

// 記事カードのサムネイル解決（1.カタログ商品画像 → 2.ogImage → 3.public/og の実ファイル）。
export function getThumbnail(article: ArticleMeta, locale: string): string | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
  }
  if (article.ogImage && article.ogImage !== "auto") {
    return `${article.ogImage}-${locale}.png`;
  }
  const ogFile = path.join(process.cwd(), "public", "og", `${article.slug}-${locale}.png`);
  if (fs.existsSync(ogFile)) {
    return `/og/${article.slug}-${locale}.png`;
  }
  return null;
}

export interface RelatedCard {
  slug: string;
  title: string;
  thumb: string | null;
  count: number; // 比較商品数（"N製品を比較" の事実値）
  category: ArticleMeta["category"];
}

// 本文中インライン導線 / 末尾グリッド 共通の関連カードデータ（サーバー側で fs 解決）。
export function getRelatedCards(
  slug: string,
  category: string,
  locale: string,
  limit = 6,
): RelatedCard[] {
  return getRelatedArticles(slug, category, locale, limit).map((a) => ({
    slug: a.slug,
    title: loadArticleCardMeta(a.slug, locale).title,
    thumb: getThumbnail(a, locale),
    count: a.offerIds.length,
    category: a.category,
  }));
}
