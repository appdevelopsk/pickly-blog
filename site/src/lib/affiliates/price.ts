import type { AffiliateOffer } from "@/lib/affiliates/types";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import { PRICES } from "@/lib/affiliates/prices-override";

/**
 * Market-aware price for display. Returns null when the only known price's
 * currency doesn't match the viewer's market (e.g. "$29.99" on a ja page).
 */
export function resolvePrice(o: AffiliateOffer, locale: string): string | null {
  const market = inferMarketFromLocale(locale);
  // 1. Market-specific override (auto-fetched daily)
  const override = PRICES[o.id]?.[market];
  if (override) return override;
  // 2. Catalog price field — hide when currency doesn't match market
  const price = o.priceMin && o.priceMax ? `${o.priceMin}〜${o.priceMax}` : (o.price ?? null);
  if (!price) return null;
  if (price.includes("$") && market !== "US" && market !== "CA") return null;
  if ((price.includes("¥") || price.includes("円")) && market !== "JP") return null;
  if (price.includes("£") && market !== "UK") return null;
  if (price.includes("€") && !["EU", "FR", "ES", "IT"].includes(market)) return null;
  return price;
}
