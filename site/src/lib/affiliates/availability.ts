import type { AffiliateOffer, AspLink, Market } from "./types";

/**
 * 「この商品はあなたの国で買えるか」の判定 (2026-09-11)
 *
 * 背景: pickLink は必ず何かを返す設計になっている。提携が1本も無くても
 * localAmazonFallback が「自国 Amazon の検索URL」を組み立てて返すため、
 * **リンクが出ることは「その国で買えること」を意味しない**。
 * 読者から見ると、押した先が商品ページではなく検索結果になる。
 * ここではその差を明示的に分ける。
 *
 * 区分:
 *   "direct"   … その市場向けの提携リンクが実在する。押せば商品ページ/申込ページに着く。
 *                network:"direct"(企業の自社アフィリエイト)もここに入る。
 *                catalog.ts の orderedCandidates は direct を末尾に回すが、
 *                それは「ASPより後回し」という優先順位であって使えないという意味ではない。
 *                finance カテゴリ230件はこの形しか持たないので、除外すると
 *                「US で買えない」と誤表示する。
 *   "eu"       … FR/ES/IT が EU(amazon-de)リンクを共有している。
 *                asp.ts の EU_REMAP が各国 Amazon に振り替えるので実用上は買える。
 *   "global"   … market 指定のない global リンク。どの国からも踏める。
 *   "search"   … 提携が無く、自国 Amazon の検索に送るだけ(= localAmazonFallback)。
 *                「買える」とは表示しない。
 *   "none"     … 買い口が無い。finance のように Amazon 検索へ送る意味も無い場合。
 *
 * ★ここで offer.links の `markets` を読むが、asp.ts:345 が警告しているとおり
 *   markets は「リンクの行き先を絞る指定」ではなく在庫メモである。
 *   リマップ可否の判定には使ってはいけない。可否の *表示* に使うのは
 *   本来の用途(どの市場に在庫があるか)に沿っているので問題ない。
 */

export type AvailabilityKind = "direct" | "eu" | "global" | "search" | "none";

export interface Availability {
  market: Market;
  kind: AvailabilityKind;
  /** 実際に買えると言い切れるか。search / none は false。 */
  buyable: boolean;
  /** 判定の根拠になったリンク(あれば)。 */
  via?: AspLink;
}

/** market → その国の Amazon ネットワーク。catalog.ts の LOCAL_AMAZON と同じ表。 */
const LOCAL_AMAZON: Partial<Record<Market, string>> = {
  JP: "amazon-jp",
  US: "amazon-us",
  UK: "amazon-uk",
  CA: "amazon-ca",
  EU: "amazon-de",
  FR: "amazon-fr",
  ES: "amazon-es",
  IT: "amazon-it",
  // 中国 Amazon は小売撤退済みなので amazon-us に寄せる(catalog.ts と同じ理由)。
  CN: "amazon-us",
};

/** Amazon 検索へ送ってよいカテゴリ。catalog.ts の PHYSICAL_CATEGORIES と同じ。 */
const PHYSICAL_CATEGORIES = new Set([
  "tech", "home", "beauty", "fashion", "fitness", "food", "parenting", "pets", "travel",
]);

const EU_SHARED: Market[] = ["FR", "ES", "IT"];

/**
 * 単一 market での購入可否。
 * onlyApproved=true (既定) は承認済み提携だけを数える。準備中(pending)の
 * 案件を「買える」と表示すると、読者は踏めないカードに送られる。
 */
export function availabilityFor(
  offer: AffiliateOffer,
  market: Market,
  opts: { onlyApproved?: boolean } = {},
): Availability {
  const approved = opts.onlyApproved ?? true;
  const links = offer.links.filter((l) => (approved ? l.approved : true));

  const direct = links.find((l) => l.markets.includes(market));
  if (direct) return { market, kind: "direct", buyable: true, via: direct };

  if (EU_SHARED.includes(market)) {
    const eu = links.find((l) => l.markets.includes("EU"));
    if (eu) return { market, kind: "eu", buyable: true, via: eu };
  }

  const global = links.find((l) => l.markets.includes("global"));
  if (global) return { market, kind: "global", buyable: true, via: global };

  // ここから先は提携が無い。自国 Amazon 検索に送れるかどうかだけ。
  const hasAmazon = links.some((l) => l.network.startsWith("amazon-"));
  const canSearch = Boolean(LOCAL_AMAZON[market]) &&
    (hasAmazon || PHYSICAL_CATEGORIES.has(offer.category));
  return { market, kind: canSearch ? "search" : "none", buyable: false };
}

/** 表示に使う主要マーケット。global は「国」ではないので含めない。 */
export const DISPLAY_MARKETS: Market[] = [
  "US", "JP", "UK", "CA", "EU", "FR", "ES", "IT", "CN",
];

/** 全表示マーケットぶんの可否。国別表を描くための入口。 */
export function availabilityTable(
  offer: AffiliateOffer,
  markets: Market[] = DISPLAY_MARKETS,
  opts: { onlyApproved?: boolean } = {},
): Availability[] {
  return markets.map((m) => availabilityFor(offer, m, opts));
}

/** 実際に買える市場だけを返す。 */
export function buyableMarkets(
  offer: AffiliateOffer,
  markets: Market[] = DISPLAY_MARKETS,
  opts: { onlyApproved?: boolean } = {},
): Market[] {
  return availabilityTable(offer, markets, opts)
    .filter((a) => a.buyable)
    .map((a) => a.market);
}
