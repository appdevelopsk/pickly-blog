import type { ArticleMeta } from "./types";
import { meta as bestVpn2026 } from "@/articles/best-vpn-2026/meta";
import { meta as bestCoffeeGrinder2026 } from "@/articles/best-coffee-grinder-2026/meta";
import { meta as bestElectricToothbrush2026 } from "@/articles/best-electric-toothbrush-2026/meta";
import { meta as bestAirPurifier2026 } from "@/articles/best-air-purifier-2026/meta";
import { meta as conohaWingReview2026 } from "@/articles/conoha-wing-review-2026/meta";
import { meta as bestRentalServerJp2026 } from "@/articles/best-rental-server-jp-2026/meta";
import { meta as bestLedFaceMask2026 } from "@/articles/best-led-face-mask-2026/meta";
import { meta as bestRobotVacuum2026 } from "@/articles/best-robot-vacuum-2026/meta";
import { meta as bestHairDryer2026 } from "@/articles/best-hair-dryer-2026/meta";
import { meta as bestRiceCooker2026 } from "@/articles/best-rice-cooker-2026/meta";
import { meta as bestNoiseCancellingHeadphones2026 } from "@/articles/best-noise-cancelling-headphones-2026/meta";
import { meta as bestSkincareFridge2026 } from "@/articles/best-skincare-fridge-2026/meta";
import { meta as bestAirFryer2026 } from "@/articles/best-air-fryer-2026/meta";
import { meta as bestMassageGun2026 } from "@/articles/best-massage-gun-2026/meta";
import { meta as bestSmartWatch2026 } from "@/articles/best-smart-watch-2026/meta";
import { meta as bestMattress2026 } from "@/articles/best-mattress-2026/meta";
import { meta as bestCoffeeMaker2026 } from "@/articles/best-coffee-maker-2026/meta";
import { meta as bestCordlessVacuum2026 } from "@/articles/best-cordless-vacuum-2026/meta";
import { meta as bestYogaMat2026 } from "@/articles/best-yoga-mat-2026/meta";
import { meta as bestToaster2026 } from "@/articles/best-toaster-2026/meta";

/**
 * 記事レジストリ — 各 article は `src/articles/<slug>/meta.ts` で
 * `export const meta: ArticleMeta` として宣言する。
 *
 * 新しい記事を追加するには:
 *   1. src/articles/<slug>/meta.ts を作成
 *   2. src/articles/<slug>/messages/<locale>.json を全active locale分配置
 *   3. このファイルに import を追加 + REGISTRY 配列に push
 */

const REGISTRY: ArticleMeta[] = [bestVpn2026, bestCoffeeGrinder2026, bestElectricToothbrush2026, bestAirPurifier2026, conohaWingReview2026, bestRentalServerJp2026, bestLedFaceMask2026, bestRobotVacuum2026, bestHairDryer2026, bestRiceCooker2026, bestNoiseCancellingHeadphones2026, bestSkincareFridge2026, bestAirFryer2026, bestMassageGun2026, bestSmartWatch2026, bestMattress2026, bestCoffeeMaker2026, bestCordlessVacuum2026, bestYogaMat2026, bestToaster2026];

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
