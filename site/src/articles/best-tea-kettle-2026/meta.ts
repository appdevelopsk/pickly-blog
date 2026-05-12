import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "best-tea-kettle-2026",
  type: "comparison",
  category: "home",
  offerIds: [
    "balmuda-the-pot",
    "hario-v60-buono-kettle",
    "delonghi-icona-vintage-kettle",
    "zojirushi-keep-warm-pot",
    "fellow-stagg-ekg",
  ],
  publishedAt: "2026-05-09",
  updatedAt: "2026-05-09",
  // 初回公開は en + ja のみ。他言語は後日展開
  locales: [...ALL_LOCALES],
  ogImage: "auto",
};
