"use client";

import { useTranslations } from "next-intl";
import { availabilityFor, DISPLAY_MARKETS } from "@/lib/affiliates/availability";
import type { AffiliateOffer, Market } from "@/lib/affiliates/types";

/**
 * 「あなたの国で買えるか」の一行表示。
 *
 * 既存の `offer.regionFallback` は card variant にしか出ておらず、しかも
 * 「まだ提携がありません」としか言わない。読者が次に知りたいのは
 *  (a) このリンクは商品ページに着くのか、検索結果に着くのか
 *  (b) 着かないなら、どの国なら買えるのか
 * の2つなので、それを出す。
 *
 * 買える場合は何も出さない。買えるときに「買えます」と念押ししても
 * 情報が増えず、PR表記と紛らわしいだけなので。
 */
export function AvailabilityNote({
  offer,
  market,
  className = "",
}: {
  offer: AffiliateOffer;
  market: Market;
  className?: string;
}) {
  const t = useTranslations();
  const here = availabilityFor(offer, market);
  if (here.buyable) return null;

  // 買える国を1つだけ挙げる。羅列すると行が長くなり、読者の行動も変わらない。
  // 順序は DISPLAY_MARKETS(US,JP,UK,...)= 品揃えの厚い順。
  const elsewhere = DISPLAY_MARKETS.find(
    (m) => m !== market && availabilityFor(offer, m).buyable,
  );

  const message =
    here.kind === "search"
      ? t("offer.searchFallbackNote")
      : elsewhere
        ? t("offer.availableIn", { country: t(`offer.country.${elsewhere}`) })
        : t("offer.notAvailableHere");

  return (
    <p className={`text-xs text-slate-500 ${className}`.trim()}>{message}</p>
  );
}
