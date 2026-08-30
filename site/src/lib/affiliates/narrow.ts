import type { AffiliateOffer, AspLink, Market } from "./types";
import { usesEuUsAsinPool } from "./asp";
import { classify, currencyMatchesMarket } from "./price";

/**
 * クライアント境界を越える offer から、当該ロケールで実際に読まれないロケール文字列を落とす。
 *
 * offer.name / description / cta は Record<string,string> なので、そのまま
 * client component に渡すと Next.js が RSC ペイロードとして全ロケール分を
 * 静的HTMLに埋め込む。表示は `?? .en` で英語に落ちるが、クローラーとAI抽出には
 * 日本語などが見えてしまう。
 *
 * 消費側が読むキーは限定されている:
 *   name        : [locale] / en / ja(市場JPの楽天・Yahooマッチのみ)
 *   description : [locale] / en
 *   cta         : [locale] / en
 */
function pick(
  map: Record<string, string> | undefined,
  keys: string[],
): Record<string, string> | undefined {
  if (!map) return undefined;
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = map[k];
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

/**
 * 当該ページの market で読まれ得るリンクだけ残す。
 *
 * links はマーケット横断で全件が client component に渡るため、amazon-jp の
 * productId(日本語のAmazon検索語)と rawUrl(そのpercent-encoding)が英語ページの
 * RSCペイロードに載っていた。
 *
 * 落として良いのは「どの経路でも読まれないリンク」だけ:
 *   - pickLink/pickAllLinks が選ぶ market / EUフォールバック / global / (globalならUS)
 *   - buildAffiliateUrl の poolSibling が ASIN を借りる EU/US プール
 *     (amazon-de / amazon-uk / amazon-us。JP は絶対に借りない)
 *   - buildAffiliateUrl が商品名フォールバックに使う network:"direct"
 */
/**
 * 日本市場専用のASP。これらは market を跨いで読まれることが有り得ない。
 * カタログ側で markets:["global"] と誤ラベルされた amazon-jp が21本あり
 * (18本が "global"、3本が "JP,global"。うち8本は productId が日本語)、
 * markets を信じると英語ページのRSCペイロードに日本語が載る。
 * ラベルではなく network で遮断する。
 *
 * 実測: en 893ページのRSC日本語混入は 30 → 26 (hreflang除外後)。
 * 残る26件のうち23件は英文中の対訳グロス(「Hamburg steak (ハンバーグ)」等)で正当。
 */
const HAS_JP_TEXT = /[\u3040-\u30ff\u4e00-\u9fff]/;

const JP_ONLY_NETWORKS: ReadonlySet<string> = new Set([
  "amazon-jp",
  "a8",
  "moshimo",
  "valuecommerce",
  "rakuten-affiliate",
]);

function keepLink(link: AspLink, market: Market): boolean {
  // network が日本専用なら markets のラベルに関わらず JP 以外では落とす。
  if (JP_ONLY_NETWORKS.has(link.network)) return market === "JP";
  // direct は buildAffiliateUrl の商品名フォールバックに使うので原則残すが、
  // productId が日本語(ニトリ等の日本語検索クエリURL)のものは非JPで読まれない。
  if (link.network === "direct") return market === "JP" || !HAS_JP_TEXT.test(link.productId);
  // EU/US ASIN プールは market を跨いで参照される。
  if (usesEuUsAsinPool(link.network)) return true;
  if (link.markets.includes(market)) return true;
  if (link.markets.includes("global")) return true;
  if ((["FR", "ES", "IT"] as Market[]).includes(market) && link.markets.includes("EU")) return true;
  if (market === "global" && link.markets.includes("US")) return true;
  return false;
}

export function narrowOfferForLocale(
  offer: AffiliateOffer,
  locale: string,
  market: Market,
): AffiliateOffer {
  // 楽天/Yahoo の商品マッチは name.ja を鍵にするので JP 市場でだけ残す。
  const nameKeys = market === "JP" ? [locale, "en", "ja"] : [locale, "en"];
  return {
    ...offer,
    name: pick(offer.name, nameKeys) as Record<string, string>,
    description: pick(offer.description, [locale, "en"]) as Record<string, string>,
    ...(offer.cta ? { cta: pick(offer.cta, [locale, "en"]) } : {}),
    links: offer.links.filter((l) => keepLink(l, market)),
    ...dropForeignCurrencyPrices(offer, market),
  };
}

/**
 * price / priceMin / priceMax は Record ではなく素の文字列だが、通貨が市場と
 * 合わないものは resolvePrice が表示時に null にする。表示されないのに
 * RSCペイロードには残るため、英語ページの静的HTMLに "¥678/月" のような
 * 日本語込みの価格が載っていた（best-rental-server-jp-2026 / best-vpn-2026）。
 * 表示ゲートと同じ判定でここでも落とす。
 */
function dropForeignCurrencyPrices(
  offer: AffiliateOffer,
  market: Market,
): Partial<AffiliateOffer> {
  const out: Partial<AffiliateOffer> = {};
  for (const key of ["price", "priceMin", "priceMax"] as const) {
    const v = offer[key];
    if (v == null) continue;
    if (!currencyMatchesMarket(classify(v).currency, market)) out[key] = undefined;
  }
  return out;
}

export function narrowOffersForLocale(
  offers: AffiliateOffer[],
  locale: string,
  market: Market,
): AffiliateOffer[] {
  return offers.map((o) => narrowOfferForLocale(o, locale, market));
}
