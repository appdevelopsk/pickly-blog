/**
 * Yahoo!ショッピング商品検索API v3 クライアント（2026-06-22）。
 *
 * ★サーバー/スクリプト専用（appidをクライアントバンドルに混ぜない）。
 *  サイト本体は `scripts/fetch-yahoo.ts` が事前取得した
 *  `lib/affiliates/yahoo-cache.json` を読む（ビルド時API呼び出し無し）。
 *
 * 認証: appid（Yahoo! JAPAN Developer の Client ID）をクエリで渡すだけ。
 * アフィリ: `affiliate_type=vc` と、`affiliate_id` に VC の referral URL 前綴り
 *   `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid={SID}&pid={PID}&vc_url=`
 *   (URLエンコード)を渡すと返却 url が VC アフィリリンクになる(公式 affiliate.html)。
 *   ★affiliate_id に SID 単独や `sid=..&pid=..` を渡しても生 store URL が返る(2026-09-05 実測)。
 *   VC 側で Yahoo!ショッピングと提携承認済み+MyLink で pid 発行済みであること。
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
  vcSid: string; // ValueCommerce SID（アフィリ用・必須）
  vcPid: string; // ValueCommerce PID（MyLink の pid=・必須）
}

/** Yahoo API の affiliate_id に渡す VC referral 前綴り(vc_url= で終わる)。 */
export function vcAffiliateId(cfg: Pick<YahooConfig, "vcSid" | "vcPid">): string {
  return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${cfg.vcSid}&pid=${cfg.vcPid}&vc_url=`;
}

// ★AFFILIATE_VALUECOMMERCE_SID は必須。未設定でも動いてしまうと affiliate_type=vc が
//   静かに落ちて生の store URL が返り、それをキャッシュ→本番で無報酬リンクを配信する。
//   実際に本番475ページ2,920リンクが全て無タグだった(2026-08-28 実測)。落とす方が安全。
function cfgFromEnv(): YahooConfig {
  const appid = process.env.YAHOO_APP_ID ?? "";
  if (!appid) throw new Error("YAHOO_APP_ID が未設定です");
  const vcSid = process.env.AFFILIATE_VALUECOMMERCE_SID ?? "";
  if (!vcSid) {
    throw new Error(
      "AFFILIATE_VALUECOMMERCE_SID が未設定です（未設定だとアフィリタグ無しの生store URLを取得してしまう）",
    );
  }
  const vcPid = process.env.AFFILIATE_VALUECOMMERCE_PID ?? "";
  if (!vcPid) {
    throw new Error(
      "AFFILIATE_VALUECOMMERCE_PID が未設定です（SID単独では Yahoo API がアフィリURLを返さない）",
    );
  }
  return { appid, vcSid, vcPid };
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
    // 条件付きスプレッドをやめ、SID必須化とセットで常に付与する(静かな無タグ化の防止)。
    affiliate_type: "vc",
    affiliate_id: vcAffiliateId(cfg),
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
