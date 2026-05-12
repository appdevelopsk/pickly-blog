import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "best-noise-cancelling-headphones-2026",
  type: "comparison",
  category: "tech",
  offerIds: [
    "sony-wh-1000xm5",
    "bose-quietcomfort-ultra",
    "apple-airpods-max",
    "sennheiser-momentum-4",
    "anker-soundcore-space-q45",
  ],
  publishedAt: "2026-05-09",
  updatedAt: "2026-05-09",
  // 初回公開は en + ja のみ。他言語は後日展開
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
