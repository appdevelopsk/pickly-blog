import type { AspLink, AspNetwork } from "./types";

/**
 * ASP ごとのアフィリリンク URL を組み立てる。
 *
 * 環境変数で読まれるアカウントID:
 *   AFFILIATE_AMAZON_TAG_JP / _US / _UK / _DE
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
  /** Override env lookup (for testing) */
  env?: EnvLookup;
}

const AMAZON_TAG_ENV: Partial<Record<AspNetwork, string>> = {
  "amazon-jp": "AFFILIATE_AMAZON_TAG_JP",
  "amazon-us": "AFFILIATE_AMAZON_TAG_US",
  "amazon-uk": "AFFILIATE_AMAZON_TAG_UK",
  "amazon-de": "AFFILIATE_AMAZON_TAG_DE",
};

export function buildAffiliateUrl({ link, env = defaultEnv }: BuildOptions): string {
  if (link.rawUrl) {
    // Amazonネットワークの場合: rawUrlにアフィリエイトタグを注入する
    const tagEnvKey = AMAZON_TAG_ENV[link.network];
    if (tagEnvKey) {
      const tag = env(tagEnvKey);
      if (tag) return injectAmazonTag(link.rawUrl, tag);
    }
    return link.rawUrl;
  }

  const builders: Record<AspNetwork, (id: string, e: EnvLookup) => string> = {
    "amazon-jp": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_JP"), "amazon.co.jp"),
    "amazon-us": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_US"), "amazon.com"),
    "amazon-uk": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_UK"), "amazon.co.uk"),
    "amazon-de": (id, e) => amazon(id, e("AFFILIATE_AMAZON_TAG_DE"), "amazon.de"),
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

  return builders[link.network](link.productId, env);
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
