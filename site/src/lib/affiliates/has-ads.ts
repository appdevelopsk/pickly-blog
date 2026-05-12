import { CATALOG, pickLink } from "./catalog";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import type { ArticleMeta } from "@/lib/articles/types";

/** Returns true if at least one offer in the article has an approved link for the locale's market. */
export function hasApprovedAds(article: ArticleMeta, locale: string): boolean {
  const market = inferMarketFromLocale(locale);
  const offers = CATALOG.filter((o) => article.offerIds.includes(o.id));
  if (offers.length === 0) return false;
  return offers.some((o) => pickLink(o, market, { onlyApproved: true }) !== null);
}
