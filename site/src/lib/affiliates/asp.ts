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
  /** 商品カテゴリ。network:"direct" を Amazon 検索に寄せてよいかの判定に使う。 */
  category?: string;
  /**
   * 同一商品の全リンク(offer.links)。リマップ先マーケットの実ASINを引き当てるのに使う。
   * ASIN はマーケットごとに違う(実測: JP↔US で 894/2,172 = 41% が別ASIN)ため、
   * network だけ書き換えて元マーケットの ASIN を /dp/ に付けると 404 になる。
   * 兄弟リンクに行き先マーケットの実ASINがあればそれを使い、無ければ商品名検索に落とす。
   */
  siblings?: readonly AspLink[];
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

// Amazonアソシエイト 公開トラッキングID(=StoreID)のデフォルト。
// アフィリタグは全アウトバウンドリンクに露出する公開値なのでソースに持って良い(RakutenのaffiliateIdと同方式)。
// AffiliateLinkはclient componentのため process.env(非NEXT_PUBLIC)はクライアントでundefined→
// ここにデフォルトを置くことで server(SSG)/client 双方で確実にタグが付く。env で上書き可。
const AMAZON_TAG_DEFAULTS: Partial<Record<AspNetwork, string>> = {
  // ★2026-08-06 差し替え: pickly091-20 は 7/24 に審査却下された別口の仮ID
  //   (却下理由=当時サイトにあったタグ無しリンク625本。8/4に修正済)。
  //   US アカウント本体(app.develop.sk@gmail.com)は生きており、有効な Store ID は
  //   pickly07-20(ダッシュボード実確認)。死にタグのままだと US クリックが全て
  //   無計上になる — 実際、有効側のダッシュボードは直近30日クリック0だった。
  "amazon-us": "pickly07-20",
  "amazon-uk": "pickly0fd-21",
  "amazon-de": "pickly01-21",
  "amazon-fr": "picklyfr21-21",
  "amazon-it": "pickly06-21",  // ユーザー確認済(2026-07-07): 06=イタリア
  "amazon-es": "pickly07-21",  // 消去法(対象ユーロ市場はDE/FR/IT/ESのみ・06=ITなので07=ES)
  "amazon-jp": "pickly-22",
  // 2026-08-06: CA アカウントは実在した(ダッシュボード実確認・Store ID pickly056-20)。
  // 「CAタグ未取得」という前提で geo 切替を見送っていたが誤りだった。
  // ※CA側は税務情報が未提出で支払いが保留される(計上はされる)。要ユーザー提出。
  "amazon-ca": "pickly056-20",
};

/**
 * ★閉鎖された(または閉鎖された疑いのある)アソシエイトアカウントのネットワーク。
 *
 * ここに入れたネットワークは amazon-us(pickly07-20)へ退避する。US アカウントは
 * Earn Globally 対象(US/CA/UK/DE/FR/IT/ES/NL/PL/SE)なので、訪問者は自国 Amazon へ
 * 自動リダイレクトされ、**現地レートで US アカウントに計上される**。
 * つまり退避しても報酬は失われない。退避しなければ死にタグ＝1円にもならない。
 *
 * なぜ必要か: 同じ失敗を一度やっている。7/24 に却下された pickly091-20 を本番が
 * 配信し続け、US のクリックが全て無計上になっていた(2026-08-06 に発覚・差し替え)。
 *
 * ★JP は入れてはいけない。amazon.co.jp は Earn Globally の対象外で、退避すると
 *   日本の読者が amazon.com に送られる(別アカウント pickly-22 で実績もある)。
 *
 * ■ いつ追加するか
 *   Amazon から「180日以内に適格販売3件」の警告を受けたアカウントが実際に閉鎖された時。
 *   2026-08-11 時点の仮アカウント(3件未達なら閉鎖): UK/FR/ES/CA。
 *   閉鎖済みが確認できたら該当ネットワークをこの Set に足すだけでよい。
 *   (DE=本承認済み・JP/US=稼働中)
 *
 * ■ 2026-08-21 IT 却下 → 退避済み
 *   pickly06-21 が amazon.it に却下された(理由="特別リンクにトラッキングIDが
 *   使われておらず、トラフィックの発生元を特定できない" = 7/24 の US 却下と同文)。
 *   本番実測では /it/articles/ 配下は全リンクが amazon.it tag=pickly06-21 で
 *   タグ付き済み(8/4 に 625本のタグ無しリンクを是正済み)。つまり審査は是正前の
 *   スナップショットを見たものと考えられ、異議申立ての根拠がある。
 *   異議が通るまでは IT を退避し、イタリアの読者を US(Earn Globally)経由で
 *   amazon.it に送る。異議が通ったらこの Set から amazon-it を外すだけでよい。
 */
const RETIRED_AMAZON_NETWORKS = new Set<AspNetwork>(["amazon-it"]);

// 訪問者の市場 → その市場の Amazon。
// ★2026-08-21: "EU"/"US" を追加。従来これらのキーが無かったため EU(ドイツ語圏)と
//   US の読者は LOCAL_REMAP を素通りし、全員 amazon-us にフォールバックしていた。
//   本承認済みの amazon.de(pickly01-21) にドイツの読者が一度も到達していなかった主因。
const LOCAL_REMAP: Partial<Record<Market, AspNetwork>> = {
  "EU": "amazon-de",
  "US": "amazon-us",
  "FR": "amazon-fr",
  "ES": "amazon-es",
  "IT": "amazon-it",
  "UK": "amazon-uk",
  "CA": "amazon-ca",
  "JP": "amazon-jp",
};

/**
 * network:"direct" のうち、Amazon 検索に寄せてはいけないカテゴリ。
 *
 * finance は口座・カード・証券で、Amazon に商品が存在しない(検索しても無関係な
 * 書籍が出るだけ)。travel は航空券・ホテル予約が混ざる。ここは提携が取れるまで
 * 公式サイトへの直リンクのままにする(無報酬だが、読者にとっては正しい行き先)。
 */
export const NO_AMAZON_CATEGORIES = new Set(["finance", "travel"]);

/**
 * ★Amazon で売っていない offer の明示リスト (2026-08-21 追加)。
 * VPN / レンタルサーバ / ドメインレジストラ / SaaS / セキュリティソフトは
 * そもそも Amazon に商品が無く、公式サイトの直リンクが読者にとって正しい行き先。
 * これらを ASIN 被覆の門番が「未対応」として数えると、恒久的に消えない警告になり、
 * 本当に直すべき物販 offer が埋もれる。
 *
 * ★カテゴリ単位で切らない理由: tech カテゴリには SaaS と一緒に
 *   ヘルメット・OBD2スキャナ・ハードウェアウォレット・モバイルルータのような
 *   **実際に Amazon で売っている物** が同居している。カテゴリごと除外すると
 *   それらの取りこぼしまで黙殺してしまうので、ID を1件ずつ列挙する。
 */
export const NON_AMAZON_OFFERS = new Set([
  // VPN
  "nordvpn", "expressvpn", "surfshark", "protonvpn",
  // レンタルサーバ / クラウド
  "sakura-rentalserver", "mixhost", "digitalocean-droplets", "vultr-cloud-compute",
  "linode-shared-cpu", "hetzner-cloud-cpx", "aws-lightsail", "aws-ec2-cloud",
  "google-cloud-compute-engine", "azure-virtual-machines", "digitalocean-app-platform",
  "render-cloud", "kinsta-managed-wp", "wp-engine-managed-wp", "siteground-grow-big",
  "bluehost-choice-plus", "cloudways-vultr-wp",
  // ドメインレジストラ
  "onamae-com", "porkbun-registrar", "namecheap-registrar", "cloudflare-registrar",
  "godaddy-registrar", "google-domains-squarespace",
  // サイトビルダー / EC プラットフォーム
  "wix-builder", "webflow-builder", "shopify-builder", "carrd-single-page",
  "shopify-advanced", "bigcommerce-pro", "woocommerce-wordpress", "wix-ecommerce-business",
  // パスワード管理 / セキュリティ
  "1password-families", "bitwarden-premium", "dashlane-premium",
  "apple-passwords-icloud", "lastpass-premium", "windows-defender-free",
  "kaspersky-total-security",
  // 会計 / 給与
  "xero-growing", "freshbooks-plus", "wave-free", "gusto-payroll-plus", "adp-run",
  "paychex-flex", "onpay-payroll", "square-payroll",
  // CRM / プロジェクト管理
  "hubspot-crm-pro", "salesforce-sales-cloud-pro", "pipedrive-advanced",
  "monday-sales-crm", "monday-work-management-pro", "clickup-business",
  "notion-business", "trello-premium",
  // メール配信
  "mailchimp-standard", "convertkit-creator-pro", "klaviyo-email-sms",
  "brevo-business", "activecampaign-plus",
  // 人事 / コラボレーション
  "bamboohr-essentials", "rippling-platform", "gusto-hr-plus", "workday-hcm",
  "deel-hr", "zoom-business-pro", "microsoft-teams-business", "loom-business",
]);

/**
 * 訪問者の市場に対応する Amazon ネットワーク。未知の市場は US(Earn Globally)。
 * ★退避対象(RETIRED_AMAZON_NETWORKS)なら US に寄せる。この関数は direct リンクを
 *   Amazon 検索に変換する経路でも使われるため、ここで退避しないと死にタグが残る
 *   (2026-08-21: IT 退避時に direct 由来の 1,545 本が pickly06-21 のままだった)。
 */
const localAmazonNetwork = (market?: Market): AspNetwork => {
  const net = (market && LOCAL_REMAP[market]) ?? "amazon-us";
  return RETIRED_AMAZON_NETWORKS.has(net) ? "amazon-us" : net;
};

/**
 * その direct リンクが自国 Amazon 検索に置き換わるか。
 * 画面のボタン表記を「公式」から「Amazon」に直すために要る
 * (行き先が Amazon なのに「公式」と書いてあるのは嘘になる)。
 */
export function directGoesToAmazon(category?: string, productName?: string): boolean {
  return Boolean(productName) && !NO_AMAZON_CATEGORIES.has(category ?? "");
}

/**
 * 商品名 → Amazon 検索クエリ (2026-08-17)。
 *
 * 買い口の多くは ASIN が無く `/s?k=<商品名>` に落ちる。このとき名前末尾の
 * 補足カッコ（"(AAA, 8-9mm)" "(12-piece kit incl. 5 bands)" "(2 Paddles + 4 Balls)"）
 * まで検索語に入ると、Amazon は AND 検索なので**0件になり得る**＝押されても
 * 買えない。表示名はそのままに、検索語からだけ落とす。
 *
 * ただし "(33967)" "(V4600)" のような**型番は残す**。型番は Amazon の検索で
 * むしろ命中率を上げるため。対象は199件。
 */
const MODEL_CODE = /^[A-Za-z]{0,4}[0-9][A-Za-z0-9-]*$/;

export function amazonSearchQuery(productName: string): string {
  return productName
    .replace(/\s*\(([^()]*)\)/g, (_m, inner: string) =>
      MODEL_CODE.test(inner.trim()) ? ` ${inner.trim()}` : "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ★欧州/US の ASIN は共通プール (2026-08-21 カタログ実測)。
 *   DE↔UK 960/960 = 100.0% 一致、DE↔US 940/949 = 99.1% 一致。
 *   一方 JP↔US は 1,278/2,172 = 59% しか一致せず、JP は完全な別体系。
 * よって amazon-fr / amazon-es / amazon-it のように **カタログに1本もリンクが無い**
 * marketplace でも、DE→UK→US の順に既存 ASIN を借りて deep link を作れる。
 * これをやらないと fr/es は 100% 検索URL(=商品ページに着地しない)のままになる。
 * ★JP は絶対にプールに入れない。入れると 41% が 404 になる(過去に踏んだ不具合)。
 */
const EU_US_POOL: readonly AspNetwork[] = ["amazon-de", "amazon-uk", "amazon-us"] as const;

/** プールから ASIN を借りて良い行き先か。JP/CN 等は対象外。 */
export function usesEuUsAsinPool(network: AspNetwork): boolean {
  return (
    network.startsWith("amazon-") &&
    network !== "amazon-jp" &&
    AMAZON_HOSTS[network] !== undefined
  );
}

const ASIN_RE = /^[A-Z0-9]{10}$/;

/** リンクから実 ASIN を取り出す。productId が ASIN 形式でなければ rawUrl から拾う。 */
export function asinOf(link: AspLink): string | null {
  if (link.productId && ASIN_RE.test(link.productId)) return link.productId;
  const m = link.rawUrl?.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return m?.[1] ?? null;
}

/** 行き先の実リンクが無いとき、欧州/US プールから ASIN を持つ兄弟リンクを選ぶ。 */
function poolSibling(
  effectiveNetwork: AspNetwork,
  siblings: readonly AspLink[] | undefined
): AspLink | undefined {
  if (!siblings || !usesEuUsAsinPool(effectiveNetwork)) return undefined;
  for (const net of EU_US_POOL) {
    if (net === effectiveNetwork) continue;
    const hit = siblings.find((l) => l.network === net && asinOf(l));
    if (hit) return hit;
  }
  return undefined;
}

export function buildAffiliateUrl({ link, productName, market, category, siblings, env = defaultEnv }: BuildOptions): string {
  // ★素の直リンクを自国 Amazon の検索へ寄せる (2026-08-13)。
  //   物販カテゴリの direct リンク約1,400本は、どこにも提携が無い公式サイトへの
  //   ただのリンクだった(クエリすら付いていない=計測もされない)。押されても1円に
  //   ならないので、商品名でタグ付きの Amazon 検索に送る。
  //   finance/travel は Amazon に商品が無いので対象外(NO_AMAZON_CATEGORIES)。
  //   商品名が無い場合も、検索語を作れないので直リンクのまま。
  if (link.network === "direct" && productName && !NO_AMAZON_CATEGORIES.has(category ?? "")) {
    const net = localAmazonNetwork(market);
    const host = AMAZON_HOSTS[net];
    const tag = env(AMAZON_TAG_ENV[net] ?? "") ?? AMAZON_TAG_DEFAULTS[net];
    const url = `https://www.${host}/s?k=${encodeURIComponent(amazonSearchQuery(productName))}`;
    return tag ? injectAmazonTag(url, tag) : url;
  }

  // ★2026-08-21 全面是正。従来のゲートは
  //     network が amazon-de/amazon-us  かつ  markets に "EU"/"global" を含む
  //   という二重の絞りで、実測 12,053本中リマップ対象は 2,101本(17%)しかなかった。
  //   自国 Amazon に飛ばない残りの内訳(1マーケットあたり):
  //     2,389 amazon-us markets=[US]      … isRemappable で落ちる
  //     2,367 amazon-jp markets=[JP]      … isSharedAmazon で落ちる
  //       965 amazon-uk markets=[UK]      … 同上
  //       965 amazon-ca markets=[CA]      … 同上
  //        20 amazon-jp markets に global … 同上
  //        16 markets が小文字 "us"/"ca"  … 大文字比較にマッチせず素通り
  //   → 「Amazon リンクなら市場に関わらず訪問者の Amazon に寄せる」に一本化する。
  //     markets は行き先の絞りではなく在庫メモに過ぎず、リマップの可否判定には使わない。
  const isAmazon = link.network.startsWith("amazon-");
  const target = market ? LOCAL_REMAP[market] : undefined;
  const remapped = isAmazon && target && target !== link.network ? target : undefined;
  const localNetwork = remapped ?? link.network;
  // 閉鎖済みアカウントは US(Earn Globally)へ退避する。詳細は RETIRED_AMAZON_NETWORKS。
  const retired = RETIRED_AMAZON_NETWORKS.has(localNetwork) ? ("amazon-us" as AspNetwork) : undefined;
  const effectiveNetwork = retired ?? localNetwork;
  const rewritten = effectiveNetwork !== link.network;

  const tagEnvKey = AMAZON_TAG_ENV[effectiveNetwork];
  const amazonHost = AMAZON_HOSTS[effectiveNetwork];

  if (tagEnvKey && amazonHost) {
    const tag = env(tagEnvKey) ?? AMAZON_TAG_DEFAULTS[effectiveNetwork];
    const q = encodeURIComponent(amazonSearchQuery(productName ?? link.productId));

    // ★行き先マーケットで有効な deep link を選ぶ。
    //   ASIN は marketplace ごとに違うので、元リンクの rawUrl/productId は
    //   network を書き換えた瞬間に使えなくなる(貼ると 404)。
    //   ただし同一商品の兄弟リンクに行き先マーケットのリンクがあれば実ASINが判るので、
    //   検索に落とす前にそれを使う。
    const source = rewritten
      ? siblings?.find((l) => l.network === effectiveNetwork) ??
        poolSibling(effectiveNetwork, siblings)
      : link;
    // rawUrl は「その network 自身のリンク」のときだけそのまま使える。
    // pool 由来(別 marketplace のURL)なら ASIN だけ取り出して行き先ホストに載せ替える。
    const sameNetwork = source?.network === effectiveNetwork;
    const sourceAsin = source ? asinOf(source) : null;
    const base =
      (sameNetwork && source?.rawUrl) ||
      (sourceAsin ? `https://www.${amazonHost}/dp/${sourceAsin}` : undefined) ||
      `https://www.${amazonHost}/s?k=${q}`;

    // タグなし(想定外)でも検索URLなら害が無いのでそのまま返す。
    return tag ? injectAmazonTag(base, tag) : `https://www.${amazonHost}/s?k=${q}`;
  }

  if (link.rawUrl) return link.rawUrl;

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

  return builders[effectiveNetwork](link.productId, env);
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
