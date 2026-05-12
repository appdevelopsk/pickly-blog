import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "best-rice-cooker-2026",
  type: "comparison",
  category: "home",
  offerIds: [
    "zojirushi-stan-nw-sa10",
    "tiger-jpi-y100",
    "panasonic-sr-v18ba",
    "vermicular-rp23a",
    "mitsubishi-honsumigama-nj-awb10",
  ],
  publishedAt: "2026-05-09",
  updatedAt: "2026-05-09",
  // 初回公開は en + ja のみ。他言語は後日展開
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
