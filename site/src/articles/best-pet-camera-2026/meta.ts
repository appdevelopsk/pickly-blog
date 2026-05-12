import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "best-pet-camera-2026",
  type: "comparison",
  category: "home",
  offerIds: [
    "furbo-360-dog-camera",
    "petcube-cam",
    "wyze-cam-v3",
    "pawbo-pet-camera",
    "eufy-indoor-cam-2k-pan-tilt",
  ],
  publishedAt: "2026-05-09",
  updatedAt: "2026-05-09",
  // 初回公開は en + ja のみ。他言語は後日展開
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
