import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "best-pour-over-coffee-kit-2026",
  type: "comparison",
  category: "food",
  offerIds: [
    "hario-v60-ceramic-02",
    "chemex-classic-6cup",
    "kalita-wave-185-stainless",
    "bodum-pour-over-permanent",
    "fellow-stagg-x-set",
  ],
  publishedAt: "2026-05-10",
  updatedAt: "2026-05-10",
  // 初回公開は en + ja のみ。他言語は後日展開
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
