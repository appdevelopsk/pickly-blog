/**
 * もしもアフィリエイト URL builder.
 *
 * もしも では「かんたんリンク」と「個別商品リンク」の2種類があり、
 * URL は以下のテンプレートに従う:
 *
 *   https://af.moshimo.com/af/c/click?a_id={A_ID}&p_id={P_ID}&pc_id={PC_ID}&pl_id={PL_ID}&url={ENCODED_TARGET_URL}
 *
 * 各IDの取得方法:
 *   a_id  : もしもダッシュボード「メディア管理」→「メディアID」 (アカウント単位、不変)
 *   p_id  : 案件(プロモーション)ID。Amazon商品紹介プログラムは固定値、楽天市場は別の固定値
 *   pc_id : プロモーションコネクタID。a_idと連動して決まる(各 a_id ごとに同じ p_id でも違う)
 *   pl_id : プレースメントID。リンク種別(テキスト/バナー/かんたんリンク)で違う
 *
 * これらは「かんたんリンクで一度生成された URL」をパースすれば抽出可。
 * もしくは ASP管理画面の各案件ページの「リンクコード取得」で確認できる。
 *
 * このモジュールでは固定の (p_id, pc_id, pl_id) セットを ASP_PROFILES として持ち、
 * ユーザーは a_id (環境変数) と各 profile のデフォルトを設定するだけで使える。
 */

export type MoshimoMerchant =
  | "amazon-jp"
  | "rakuten"
  | "yahoo-shopping"
  | "conoha-wing"
  | "lolipop"
  | "rakuten-card"
  | "myprotein"
  | "asken"
  | "rakuten-securities"
  | "sbi-securities";

/**
 * 各案件の (p_id, pc_id, pl_id) は提携承認後に管理画面から取得して埋める。
 * 値は **アカウントごとに違う** (a_id と連動するため)。
 *
 * 取得方法:
 *   1. もしも管理画面 → 提携中プロモーションを開く
 *   2. 「リンクコード取得」 → HTML/URL の中の a_id, p_id, pc_id, pl_id を読む
 *   3. ここに書き込む or .env.local に環境変数で持たせる
 *
 * デフォルトの "PENDING" は明示的に未設定を示す。
 */
/**
 * 各 merchant の env 変数 prefix。fetch-link-codes が出力する形式と一致。
 * 各 prefix で {A_ID, P_ID, PC_ID, PL_ID} の4つを設定する。
 */
const PROFILE_KEYS: Record<MoshimoMerchant, { prefix: string; targetHost: string }> = {
  "amazon-jp": { prefix: "MOSHIMO_AMAZON_JP", targetHost: "https://www.amazon.co.jp/dp/" },
  "rakuten": { prefix: "MOSHIMO_RAKUTEN", targetHost: "https://item.rakuten.co.jp/" },
  "yahoo-shopping": { prefix: "MOSHIMO_YAHOO_SHOPPING", targetHost: "https://store.shopping.yahoo.co.jp/" },
  "conoha-wing": { prefix: "MOSHIMO_CONOHA_WING", targetHost: "https://www.conoha.jp/wing/" },
  "lolipop": { prefix: "MOSHIMO_LOLIPOP", targetHost: "https://lolipop.jp/" },
  "rakuten-card": { prefix: "MOSHIMO_RAKUTEN_CARD", targetHost: "https://www.rakuten-card.co.jp/" },
  "myprotein": { prefix: "MOSHIMO_MYPROTEIN", targetHost: "https://www.myprotein.jp/" },
  "asken": { prefix: "MOSHIMO_ASKEN", targetHost: "https://www.asken.jp/" },
  "rakuten-securities": { prefix: "MOSHIMO_RAKUTEN_SECURITIES", targetHost: "https://www.rakuten-sec.co.jp/" },
  "sbi-securities": { prefix: "MOSHIMO_SBI_SECURITIES", targetHost: "https://www.sbisec.co.jp/" },
};

function getProfile(merchant: MoshimoMerchant) {
  const k = PROFILE_KEYS[merchant];
  return {
    a_id: process.env[`${k.prefix}_A_ID`] ?? process.env.AFFILIATE_MOSHIMO_SID ?? "PENDING",
    p_id: process.env[`${k.prefix}_P_ID`] ?? "PENDING",
    pc_id: process.env[`${k.prefix}_PC_ID`] ?? "PENDING",
    pl_id: process.env[`${k.prefix}_PL_ID`] ?? "PENDING",
    targetHost: k.targetHost,
  };
}

interface BuildOptions {
  merchant: MoshimoMerchant;
  /** 商品識別子 (Amazon ASIN, 楽天 itemCode, Yahoo itemId, ConoHa の場合は空) */
  productId?: string;
  /** 完全な遷移先URL指定。指定があれば targetHost + productId を上書き */
  targetUrl?: string;
  /** a_id 上書き(複数メディア運用時) */
  aId?: string;
}

export function buildMoshimoUrl(opts: BuildOptions): string {
  const profile = getProfile(opts.merchant);
  const a_id = opts.aId ?? profile.a_id;
  const target = opts.targetUrl ?? `${profile.targetHost}${opts.productId ?? ""}`;

  const params = new URLSearchParams({
    a_id,
    p_id: profile.p_id,
    pc_id: profile.pc_id,
    pl_id: profile.pl_id,
    url: target,
  });

  return `https://af.moshimo.com/af/c/click?${params.toString()}`;
}

/**
 * 既存もしもURLを解析して各IDを抽出する。
 * かんたんリンク等で生成されたURLからパラメータを取り出す用途。
 */
export function parseMoshimoUrl(url: string): {
  a_id?: string;
  p_id?: string;
  pc_id?: string;
  pl_id?: string;
  url?: string;
} | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("moshimo.com")) return null;
    return {
      a_id: u.searchParams.get("a_id") ?? undefined,
      p_id: u.searchParams.get("p_id") ?? undefined,
      pc_id: u.searchParams.get("pc_id") ?? undefined,
      pl_id: u.searchParams.get("pl_id") ?? undefined,
      url: u.searchParams.get("url") ?? undefined,
    };
  } catch {
    return null;
  }
}

/**
 * 「かんたんリンク」相当のmulti-merchant URL group生成。
 * 同じ商品名でAmazon/楽天/Yahooの3リンクを返す。
 */
export function buildKantanLinks(productInfo: {
  asin?: string;
  rakutenItemCode?: string;
  yahooItemUrl?: string;
}): { amazon?: string; rakuten?: string; yahoo?: string } {
  const out: { amazon?: string; rakuten?: string; yahoo?: string } = {};
  if (productInfo.asin) {
    out.amazon = buildMoshimoUrl({ merchant: "amazon-jp", productId: productInfo.asin });
  }
  if (productInfo.rakutenItemCode) {
    out.rakuten = buildMoshimoUrl({ merchant: "rakuten", productId: productInfo.rakutenItemCode });
  }
  if (productInfo.yahooItemUrl) {
    out.yahoo = buildMoshimoUrl({ merchant: "yahoo-shopping", targetUrl: productInfo.yahooItemUrl });
  }
  return out;
}
