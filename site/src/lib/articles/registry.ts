import type { ArticleMeta } from "./types";
import { meta as bestVpn2026 } from "@/articles/best-vpn-2026/meta";
import { meta as bestCoffeeGrinder2026 } from "@/articles/best-coffee-grinder-2026/meta";
import { meta as bestElectricToothbrush2026 } from "@/articles/best-electric-toothbrush-2026/meta";
import { meta as bestAirPurifier2026 } from "@/articles/best-air-purifier-2026/meta";
import { meta as conohaWingReview2026 } from "@/articles/conoha-wing-review-2026/meta";
import { meta as bestRentalServerJp2026 } from "@/articles/best-rental-server-jp-2026/meta";
import { meta as bestLedFaceMask2026 } from "@/articles/best-led-face-mask-2026/meta";

/**
 * 記事レジストリ — 各 article は `src/articles/<slug>/meta.ts` で
 * `export const meta: ArticleMeta` として宣言する。
 *
 * 新しい記事を追加するには:
 *   1. src/articles/<slug>/meta.ts を作成
 *   2. src/articles/<slug>/messages/<locale>.json を全active locale分配置
 *   3. このファイルに import を追加 + REGISTRY 配列に push
 */

const REGISTRY: ArticleMeta[] = [bestVpn2026, bestCoffeeGrinder2026, bestElectricToothbrush2026, bestAirPurifier2026, conohaWingReview2026, bestRentalServerJp2026, bestLedFaceMask2026];

export function listArticles(): ArticleMeta[] {
  return REGISTRY;
}

export function getArticle(slug: string): ArticleMeta | undefined {
  return REGISTRY.find((a) => a.slug === slug);
}

export function listArticlesByCategory(category: string): ArticleMeta[] {
  return REGISTRY.filter((a) => a.category === category);
}

export function listArticlesForLocale(locale: string): ArticleMeta[] {
  return REGISTRY.filter((a) => a.locales.includes(locale as ArticleMeta["locales"][number]));
}
