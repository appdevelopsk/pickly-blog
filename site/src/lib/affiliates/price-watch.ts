import type { AffiliateOffer } from "@/lib/affiliates/types";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import HISTORY from "@/lib/affiliates/price-history.json";

/**
 * 価格推移（Price Watch）。
 *
 * price-history.json は snapshot-prices.ts が毎日1点追記する実取得の時系列で、
 * スキーマは { "<offer-id>": [ {"d":"YYYY-MM-DD","r":<楽天円>,"y":<Yahoo円>}, ... ] }。
 * 1,633商品 × 直近14点あるが、2026-09-12 まで src 側に読む実装が1つも無く死蔵だった。
 *
 * **r / y は円建ての実売値**なので、扱いは JP 市場に限る。price.ts の
 * currencyMatchesMarket が JPY を JP だけに通すのと同じ理由で、ここを緩めると
 * ドル建てページに円の数字が出る。
 *
 * 取得日 d が各点に付いているため、price.ts の「取得日のある値だけ api 扱い」
 * という方針（PR #29）と矛盾しない。参考価格ではなく実測値として日付付きで出せる。
 */

type Point = { d: string; r?: number; y?: number };
type History = Record<string, Point[]>;

/** 変動と見なす最小幅。1〜2円のノイズで「値下がり」と煽らない。 */
const MIN_DELTA_JPY = 100;
/** 同じ理由で、率でも下限を設ける。高額商品の 100 円は変動ではない。 */
const MIN_DELTA_PCT = 1;

export type PriceWatch = {
  /** 直近の実売値（円） */
  current: number;
  /** 比較対象とした過去の値（円） */
  previous: number;
  /** current - previous。負なら値下がり */
  delta: number;
  /** 変動率(%)。負なら値下がり */
  pct: number;
  /** current の取得日 YYYY-MM-DD */
  asOf: string;
  /** 期間内の最安値（円） */
  low: number;
  /** current が期間内の最安値と等しいか */
  isLowest: boolean;
  /** 比較に使った点の数 */
  points: number;
};

/**
 * その点の代表値。楽天と Yahoo の両方があれば安い方を採る。
 * 片方だけ欠測した日に系列が跳ねて偽の変動になるのを避けるため、
 * 以降の比較でも一貫して同じ規則で1つの数値へ畳む。
 */
function amountOf(p: Point): number | null {
  const vals = [p.r, p.y].filter((v): v is number => typeof v === "number" && v > 0);
  return vals.length ? Math.min(...vals) : null;
}

/**
 * offer の価格推移を返す。出せない条件（JP 市場以外・履歴なし・
 * 点が1つだけ・変動が閾値未満）では null を返し、UI は何も足さない。
 */
export function getPriceWatch(offer: AffiliateOffer, locale: string): PriceWatch | null {
  // 円建ての値しか持っていないので JP 以外では使わない。
  if (inferMarketFromLocale(locale) !== "JP") return null;

  const series = (HISTORY as History)[offer.id];
  if (!series || series.length < 2) return null;

  const points = series
    .map((p) => ({ d: p.d, v: amountOf(p) }))
    .filter((p): p is { d: string; v: number } => p.v != null);
  if (points.length < 2) return null;

  const last = points[points.length - 1];
  const first = points[0];
  if (!last || !first) return null;
  const delta = last.v - first.v;
  const pct = (delta / first.v) * 100;

  // ノイズを変動として出さない。金額と率の両方を満たすものだけ。
  if (Math.abs(delta) < MIN_DELTA_JPY || Math.abs(pct) < MIN_DELTA_PCT) return null;

  const low = Math.min(...points.map((p) => p.v));
  return {
    current: last.v,
    previous: first.v,
    delta,
    pct,
    asOf: last.d,
    low,
    isLowest: last.v === low,
    points: points.length,
  };
}
