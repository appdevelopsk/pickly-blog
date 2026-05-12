import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "best-hair-dryer-2026",
  type: "comparison",
  category: "beauty",
  offerIds: [
    "dyson-supersonic-nural",
    "refa-beautech-dryer-pro",
    "lepronizer-7d-plus",
    "panasonic-nanocare-ehna0j",
    "sharp-plasmacluster-ibwx901",
  ],
  publishedAt: "2026-05-09",
  updatedAt: "2026-05-09",
  // 初回公開は en + ja のみ。他言語は後日展開
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
