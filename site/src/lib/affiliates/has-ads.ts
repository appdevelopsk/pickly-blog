import { CATALOG, pickLink } from "./catalog";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import type { ArticleMeta } from "@/lib/articles/types";

/** Returns true if at least one offer in the article can be linked for the locale's market.
 *  The local-Amazon search fallback counts: it is a link the reader can actually follow and
 *  that pays, so a page built around it is worth publishing. Doing this adds about 4,000
 *  locale pages, which is why the deploy trims RSC payloads instead of capping content. */
export function hasApprovedAds(article: ArticleMeta, locale: string): boolean {
  const market = inferMarketFromLocale(locale);
  const offers = CATALOG.filter((o) => article.offerIds.includes(o.id));
  if (offers.length === 0) return false;
  return offers.some((o) => pickLink(o, market, { onlyApproved: true }) !== null);
}
