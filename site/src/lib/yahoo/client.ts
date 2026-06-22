/**
 * Yahoo!ショッピング商品検索API v3 クライアント（2026-06-22）。
 *
 * ★サーバー/スクリプト専用（appidをクライアントバンドルに混ぜない）。
 *  サイト本体は `scripts/fetch-yahoo.ts` が事前取得した
 *  `lib/affiliates/yahoo-cache.json` を読む（ビルド時API呼び出し無し）。
 *
 * 認証: appid（Yahoo! JAPAN Developer の Client ID）をクエリで渡すだけ。
 * アフィリ: `affiliate_type=vc&affiliate_id={VC_SID}` で返却 url が ValueCommerce
 *   アフィリリンクになる（★ただし VC管理画面で Yahoo!ショッピングと提携承認が必要。
 *   未承認の間は生の store URL が返る＝収益計上なし。承認後の再取得で自動的にアフィリ化）。
 * 日本のIPからのみ許可（Yahoo! JAPAN API）。発行直後の Client ID は数分の反映待ちあり。
 */

const ENDPOINT = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";

export interface YahooItem {
  name: string;
  price: number; // 円
  url: string; // affiliate_type=vc 指定時、VC承認後はアフィリURL／未承認は生store URL
  image: string | null;
  review: number; // 0-5
  reviewCount: number;
  condition: string; // "new" | "used"
}

export interface YahooConfig {
  appid: string;
  vcSid?: string; // ValueCommerce SID（アフィリ用）
}

function cfgFromEnv(): YahooConfig {
  const appid = process.env.YAHOO_APP_ID ?? "";
  if (!appid) throw new Error("YAHOO_APP_ID が未設定です");
  return { appid, vcSid: process.env.AFFILIATE_VALUECOMMERCE_SID };
}

/** キーワードで検索し関連性順で最大 hits 件返す（新品優先）。 */
export async function searchItems(
  keyword: string,
  opts: { hits?: number; config?: YahooConfig } = {},
): Promise<YahooItem[]> {
  const cfg = opts.config ?? cfgFromEnv();
  const params = new URLSearchParams({
    appid: cfg.appid,
    query: keyword,
    results: String(Math.min(Math.max(opts.hits ?? 1, 1), 50)),
    sort: "-score", // 関連性順
    condition: "new", // 新品のみ（中古/部品の誤マッチを抑制）
    in_stock: "true",
    ...(cfg.vcSid ? { affiliate_type: "vc", affiliate_id: cfg.vcSid } : {}),
  });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: { "User-Agent": "pickly.blog/1.0" },
  });
  if (res.status === 429) throw Object.assign(new Error("rate_limited"), { rateLimited: true });
  if (!res.ok) throw new Error(`Yahoo ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = (await res.json()) as { hits?: RawHit[] };
  const out: YahooItem[] = [];
  for (const h of data.hits ?? []) {
    if (!h.url || typeof h.price !== "number") continue;
    out.push({
      name: h.name ?? "",
      price: h.price,
      url: h.url,
      image: h.image?.medium ?? h.image?.small ?? null,
      review: Number(h.review?.rate) || 0,
      reviewCount: Number(h.review?.count) || 0,
      condition: h.condition ?? "",
    });
  }
  return out;
}

type RawHit = {
  name?: string;
  price?: number;
  url?: string;
  condition?: string;
  image?: { small?: string; medium?: string };
  review?: { rate?: number | string; count?: number | string };
};
