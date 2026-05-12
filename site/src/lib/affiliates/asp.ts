import type { AspLink, AspNetwork, Market } from "./types";

/**
 * ASP ごとのアフィリリンク URL を組み立てる。
 *
 * 環境変数で読まれるアカウントID:
 *   AFFILIATE_AMAZON_TAG_JP / _US / _UK / _DE / _FR / _ES / _IT / _CA
 *   AFFILIATE_A8_SID
 *   AFFILIATE_MOSHIMO_SID
 *   AFFILIATE_VALUECOMMERCE_SID
 *   AFFILIATE_RAKUTEN_AFFILIATE_ID
 *   AFFILIATE_SHAREASALE_USER_ID
 *   AFFILIATE_CJ_PID
 *   AFFILIATE_IMPACT_CAMPAIGN_ID
 *   AFFILIATE_AWIN_PUBLISHER_ID
 *
 * 値がない場合は productId をそのままパススルーするが、
 * useApprovedLinks フィルタで approved:false が弾かれている前提。
 */

type EnvLookup = (key: string) => string | undefined;

const defaultEnv: EnvLookup = (k) => process.env[k];

export interface BuildOptions {
  link: AspLink;
  /** Product name for search fallback when Amazon tag is not set */
  productName?: string;
  /** Current user market — used to remap EU amazon-de links to country-specific Amazon */
  market?: Market;
  /** Override env lookup (for testing) */
  env?: EnvLookup;
}

const AMAZON_TAG_ENV: Partial<Record<AspNetwork, string>> = {
  "amazon-jp": "AFFILIATE_AMAZON_TAG_JP",
  "amazon-us": "AFFILIATE_AMAZON_TAG_US",
  "amazon-uk": "AFFILIATE_AMAZON_TAG_UK",
  "amazon-de": "AFFILIATE_AMAZON_TAG_DE",
  "amazon-fr": "AFFILIATE_AMAZON_TAG_FR",
  "amazon-es": "AFFILIATE_AMAZON_TAG_ES",
  "amazon-it": "AFFILIATE_AMAZON_TAG_IT",
  "amazon-ca": "AFFILIATE_AMAZON_TAG_CA",
};

const AMAZON_HOSTS: Partial<Record<AspNetwork, string>> = {
  "amazon-jp": "amazon.co.jp",
  "amazon-us": "amazon.com",
  "amazon-uk": "amazon.co.uk",
  "amazon-de": "amazon.de",
  "amazon-fr": "amazon.fr",
  "amazon-es": "amazon.es",
  "amazon-it": "amazon.it",
  "amazon-ca": "amazon.ca",
};

// EU amazon-de リンクを訪問者のロケールに応じて各国 Amazon にリマップ
const EU_REMAP: Partial<Record<Market, AspNetwork>> = {
  "FR": "amazon-fr",
  "ES": "amazon-es",
  "IT": "amazon-it",
};

export function buildAffiliateUrl({ link, productName, market, env = defaultEnv }: BuildOptions): string {
  // EU amazon-de リンクをロケール別 Amazon にリマップ
  const remapped = link.network === "amazon-de" && market ? EU_REMAP[market] : undefined;
  const effectiveNetwork = remapped ?? link.network;
  const effectiveLink = remapped ? { ...link, network: remapped, rawUrl: undefined } : link;

  const tagEnvKey = AMAZON_TAG_ENV[effectiveNetwork];
  const amazonHost = AMAZON_HOSTS[effectiveNetwork];

  if (tagEnvKey && amazonHost) {
    const tag = env(tagEnvKey);
    if (tag) {
      // タグあり → ASINリンクにタグを注入
      const base = effectiveLink.rawUrl ?? `https://www.${amazonHost}/dp/${effectiveLink.productId}`;
      return injectAmazonTag(base, tag);
    }
    // タグなし → ASIN URLは404リスクがあるため商品名検索にフォールバック
    const q = encodeURIComponent(productName ?? effectiveLink.productId);
    return `https://www.${amazonHost}/s?k=${q}`;
  }

  if (effectiveLink.rawUrl) return effectiveLink.rawUrl;

  const builders: Record<AspNetwork, (id: string, e: EnvLookup) => string> = {
    "amazon-jp": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_JP"), "amazon.co.jp"),
    "amazon-us": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_US"), "amazon.com"),
    "amazon-uk": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_UK"), "amazon.co.uk"),
    "amazon-de": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_DE"), "amazon.de"),
    "amazon-fr": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_FR"), "amazon.fr"),
    "amazon-es": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_ES"), "amazon.es"),
    "amazon-it": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_IT"), "amazon.it"),
    "amazon-ca": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_CA"), "amazon.ca"),
    "a8": (id, e) => `https://px.a8.net/svt/ejp?a8mat=${e("AFFILIATE_A8_SID") ?? "PENDING"}&a8ejpredirect=${encodeURIComponent(id)}`,
    "moshimo": (id, e) => `https://af.moshimo.com/af/c/click?a_id=${e("AFFILIATE_MOSHIMO_SID") ?? "PENDING"}&p_id=${id}`,
    "valuecommerce": (id, e) => `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${e("AFFILIATE_VALUECOMMERCE_SID") ?? "PENDING"}&pid=${id}`,
    "rakuten-affiliate": (id, e) => `https://hb.afl.rakuten.co.jp/hgc/${e("AFFILIATE_RAKUTEN_AFFILIATE_ID") ?? "PENDING"}/?pc=${encodeURIComponent(id)}`,
    "shareasale": (id, e) => `https://shareasale.com/r.cfm?b=${id}&u=${e("AFFILIATE_SHAREASALE_USER_ID") ?? "PENDING"}&m=&afftrack=`,
    "cj": (id, e) => `https://www.anrdoezrs.net/click-${e("AFFILIATE_CJ_PID") ?? "PENDING"}-${id}`,
    "impact": (id, e) => `https://imp.pxf.io/c/${e("AFFILIATE_IMPACT_CAMPAIGN_ID") ?? "PENDING"}/${id}`,
    "awin": (id, e) => `https://www.awin1.com/cread.php?awinmid=${id}&awinaffid=${e("AFFILIATE_AWIN_PUBLISHER_ID") ?? "PENDING"}`,
    "direct": (id) => id, // Direct programs return the full URL as productId
  };

  return builders[effectiveNetwork](effectiveLink.productId, env);
}

function amazon(asin: string, tag: string | undefined, host: string): string {
  const t = tag ?? "PENDING";
  return `https://www.${host}/dp/${asin}?tag=${t}`;
}

function injectAmazonTag(rawUrl: string, tag: string): string {
  try {
    const u = new URL(rawUrl);
    u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return rawUrl;
  }
}
