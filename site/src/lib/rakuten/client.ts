/**
 * 楽天ウェブサービス (RWS) — Rakuten Ichiba Item Search クライアント（2026-06-20）。
 *
 * ★サーバー/スクリプト専用（クライアントバンドルに混ぜない＝Access Key を漏らさない）。
 *  サイト本体はこれを直接呼ばず、`scripts/fetch-rakuten.ts` が事前取得した
 *  `lib/affiliates/rakuten-cache.json` を読む（ビルド時API呼び出し無し）。
 *
 * 認証の肝（2026新仕様・実証済み）:
 *  - エンドポイント: https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401
 *  - applicationId（UUID）+ accessKey（pk_…）をクエリで渡す
 *  - **`Origin` ヘッダー必須**（アプリの "Allowed websites" と照合。Referer だけだと
 *    403 REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING になる）
 *  - レート約1req/秒
 *
 * affiliate計上は API 返却の affiliateUrl に依存しない（別IDが入る既知問題あり）。
 * 取得した itemUrl を自前の hgc アフィリリンクで包む（呼び出し側の責務）。
 */

const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";

export interface RakutenItem {
  name: string;
  price: number; // 円
  itemUrl: string; // item.rakuten.co.jp/... （アフィリは呼び出し側で付与）
  image: string | null;
  shop: string;
}

export interface RakutenClientConfig {
  applicationId: string;
  accessKey: string;
  /** Allowed websites に登録したドメイン由来の Origin。例 https://pickly.blog */
  origin: string;
  affiliateId?: string;
}

function cfgFromEnv(): RakutenClientConfig {
  const applicationId = process.env.RAKUTEN_APP_ID ?? "";
  const accessKey = process.env.RAKUTEN_ACCESS_KEY ?? "";
  const origin = process.env.RAKUTEN_ORIGIN ?? "https://pickly.blog";
  const affiliateId = process.env.AFFILIATE_RAKUTEN_AFFILIATE_ID;
  if (!applicationId || !accessKey) {
    throw new Error("RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が未設定です");
  }
  return { applicationId, accessKey, origin, affiliateId };
}

/** キーワードで楽天市場を検索し、関連性順で最大 hits 件のアイテム配列を返す。 */
export async function searchItems(
  keyword: string,
  opts: { hits?: number; sort?: string; config?: RakutenClientConfig } = {},
): Promise<RakutenItem[]> {
  const cfg = opts.config ?? cfgFromEnv();
  // ★affiliateId は渡さない: 渡すと itemUrl 自体がAPIのアフィリURL(誤ID)になるため。
  //  生の item.rakuten.co.jp URL を取得し、呼び出し側が自前 hgc(自分のID)で包む。
  const params = new URLSearchParams({
    applicationId: cfg.applicationId,
    accessKey: cfg.accessKey,
    keyword,
    hits: String(Math.min(Math.max(opts.hits ?? 1, 1), 30)),
    sort: opts.sort ?? "standard", // 関連性順（最安順だと無関係な激安品にマッチしやすい）
    format: "json",
    imageFlag: "1", // 画像ありを優先
  });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: { Origin: cfg.origin, Referer: `${cfg.origin}/` },
  });
  if (res.status === 429) {
    throw Object.assign(new Error("rate_limited"), { rateLimited: true });
  }
  if (!res.ok) {
    throw new Error(`RWS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = (await res.json()) as { Items?: Array<{ Item?: RawItem } | RawItem> };
  const out: RakutenItem[] = [];
  for (const entry of data.Items ?? []) {
    const it: RawItem | undefined =
      entry && "Item" in (entry as object) ? (entry as { Item?: RawItem }).Item : (entry as RawItem);
    if (!it || !it.itemUrl) continue;
    out.push({
      name: it.itemName ?? "",
      price: typeof it.itemPrice === "number" ? it.itemPrice : Number(it.itemPrice) || 0,
      itemUrl: cleanItemUrl(it.itemUrl),
      image: imageUrlOf(it.mediumImageUrls?.[0]) ?? null,
      shop: it.shopName ?? "",
    });
  }
  return out;
}

/** キーワードで楽天市場を検索し、関連性最上位1件を返す（無ければ null）。 */
export async function searchTopItem(
  keyword: string,
  opts: { sort?: string; config?: RakutenClientConfig } = {},
): Promise<RakutenItem | null> {
  const items = await searchItems(keyword, { hits: 1, sort: opts.sort, config: opts.config });
  return items[0] ?? null;
}

/** RWSが付ける rafcid 等のトラッキングを外し、素の商品URLにする。 */
function cleanItemUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("rafcid");
    u.searchParams.delete("scid");
    return u.search ? u.toString() : `${u.origin}${u.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function imageUrlOf(v: { imageUrl?: string } | string | undefined): string | null {
  if (!v) return null;
  const raw = typeof v === "string" ? v : v.imageUrl ?? null;
  if (!raw) return null;
  // 楽天サムネは ?_ex=128x128 等が付く。大きめ(300x300)に差し替え。
  return raw.replace(/\?_ex=\d+x\d+/, "?_ex=300x300");
}

type RawItem = {
  itemName?: string;
  itemPrice?: number | string;
  itemUrl?: string;
  shopName?: string;
  mediumImageUrls?: Array<{ imageUrl?: string } | string> & { [i: number]: { imageUrl?: string } | string };
};
