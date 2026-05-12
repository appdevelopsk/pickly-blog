import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "best-smart-watch-2026",
  type: "comparison",
  category: "tech",
  offerIds: [
    "apple-watch-series-10",
    "garmin-fenix-8-47mm",
    "fitbit-charge-6",
    "huawei-watch-gt-5",
    "amazfit-gtr-4",
  ],
  publishedAt: "2026-05-09",
  updatedAt: "2026-05-09",
  // 初回公開は en + ja のみ。他言語は後日展開
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
