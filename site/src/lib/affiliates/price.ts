import type { AffiliateOffer } from "@/lib/affiliates/types";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import { PRICES } from "@/lib/affiliates/prices-override";

/**
 * Market-aware price for display. Returns null when the only known price's
 * currency doesn't match the viewer's market (e.g. "$29.99" on a ja page).
 */
const EUR_MARKETS = ["EU", "FR", "ES", "IT"];

/**
 * Catalog prices are inconsistently formatted: ~784 of them carry no currency
 * symbol at all. Previously every one of those passed the mismatch checks below
 * and was rendered verbatim in *all* markets, so a German reader could be shown
 * a bare US number (and a JP yen figure could surface on a US page).
 *
 * Bare numerics split cleanly by magnitude — nothing sold here costs $1,000+,
 * and nothing costs ¥999 or less — so we infer the currency and then apply the
 * same market gate as an explicitly-tagged price. Rate strings ("0.25%〜0.40%",
 * "5.24% APR") are genuinely currency-free and stay visible everywhere.
 */
export function classify(price: string): { currency: "USD" | "JPY" | "GBP" | "EUR" | "none"; display: string } {
  if (price.includes("$")) return { currency: "USD", display: price };
  if (price.includes("¥") || price.includes("円")) return { currency: "JPY", display: price };
  if (price.includes("£")) return { currency: "GBP", display: price };
  if (price.includes("€")) return { currency: "EUR", display: price };
  // Percentages / APR / fee strings carry no currency of their own.
  if (price.includes("%")) return { currency: "none", display: price };
  // Pure numeric (optionally a "min〜max" range) — infer by magnitude.
  if (/^[\d,.]+(〜[\d,.]+)?$/.test(price)) {
    const low = parseFloat((price.split("〜")[0] ?? price).replace(/,/g, ""));
    if (Number.isFinite(low)) {
      return low >= 1000
        ? { currency: "JPY", display: `¥${price}` }
        : { currency: "USD", display: `$${price}` };
    }
  }
  // Anything else is unrecognised; don't guess a market for it.
  return { currency: "none", display: price };
}

/**
 * Recurring-price suffix carried by the catalog ("¥430/月", "$20/month").
 * The auto-fetched overrides are bare amounts, so an override silently turns a
 * monthly subscription price into what reads as a one-off purchase price
 * (8 offers: VPN + JP rental servers + a subscription box). Re-attach the
 * catalog's own suffix to the override rather than hand-editing the generated
 * file, which is regenerated daily.
 */
const PERIOD_SUFFIX = /(\/(?:月|年|mo|month|yr|year))\s*$/;

function periodSuffix(o: AffiliateOffer): string {
  const base = o.priceMin ?? o.price ?? "";
  return PERIOD_SUFFIX.exec(base)?.[1] ?? "";
}

export function resolvePrice(o: AffiliateOffer, locale: string): string | null {
  const market = inferMarketFromLocale(locale);
  // 1. Market-specific override (auto-fetched daily)
  const override = PRICES[o.id]?.[market];
  if (override) {
    const suffix = periodSuffix(o);
    return suffix && !PERIOD_SUFFIX.test(override) ? `${override}${suffix}` : override;
  }
  // 2. Catalog price field — hide when currency doesn't match market
  const price = o.priceMin && o.priceMax ? `${o.priceMin}〜${o.priceMax}` : (o.price ?? null);
  if (!price) return null;
  const { currency, display } = classify(price);
  if (!currencyMatchesMarket(currency, market)) return null;
  return display;
}

/**
 * 通貨と市場の整合。resolvePrice の表示ゲートと narrow.ts の
 * RSCペイロード除去で同じ判定を使う（片方だけ直すと混入が復活する）。
 */
export function currencyMatchesMarket(
  currency: ReturnType<typeof classify>["currency"],
  market: string,
): boolean {
  if (currency === "USD") return market === "US" || market === "CA";
  if (currency === "JPY") return market === "JP";
  if (currency === "GBP") return market === "UK";
  if (currency === "EUR") return EUR_MARKETS.includes(market);
  return true;
}
