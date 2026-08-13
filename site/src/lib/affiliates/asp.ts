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
 *   (DE=本承認済み・IT=注文2件で残り1件・JP/US=稼働中)
 */
const RETIRED_AMAZON_NETWORKS = new Set<AspNetwork>([]);

// amazon-de/amazon-us の共有リンクを訪問者のロケールに応じて各国 Amazon にリマップ。
// US は対象外(amazon-us が既に自国)。
const LOCAL_REMAP: Partial<Record<Market, AspNetwork>> = {
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
const NO_AMAZON_CATEGORIES = new Set(["finance", "travel"]);

/**
 * 訪問者の市場に対応する Amazon ネットワーク。未知の市場は US(Earn Globally)。
 */
const localAmazonNetwork = (market?: Market): AspNetwork =>
  (market && LOCAL_REMAP[market]) ?? "amazon-us";

/**
 * その direct リンクが自国 Amazon 検索に置き換わるか。
 * 画面のボタン表記を「公式」から「Amazon」に直すために要る
 * (行き先が Amazon なのに「公式」と書いてあるのは嘘になる)。
 */
export function directGoesToAmazon(category?: string, productName?: string): boolean {
  return Boolean(productName) && !NO_AMAZON_CATEGORIES.has(category ?? "");
}

export function buildAffiliateUrl({ link, productName, market, category, env = defaultEnv }: BuildOptions): string {
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
    const url = `https://www.${host}/s?k=${encodeURIComponent(productName)}`;
    return tag ? injectAmazonTag(url, tag) : url;
  }

  // 共有リンクをロケール別 Amazon にリマップ。
  // ★2026-08-10: amazon-de かつ markets に "EU" を含む商品だけをリマップ対象にしていた。
  //   その結果、次の2クラスが自国以外の Amazon に誤送されていた:
  //   ①markets:["EU"] だが network が amazon-us の商品(363件・productIdが商品名で
  //     ASIN無し) → FR/ES/IT の読者に amazon.com の英語検索URLがそのまま出ていた
  //     (ドイツ語どころか米国サイトへの誤送＝クリックはあるのに成約ゼロの主因)。
  //   ②markets:["global"] の amazon-us 商品(約400件) → UK/CA/JP/FR/ES/IT
  //     どの読者にも amazon.com が出ていた(rawUrl付きの実ASINだったため気づきにくかった)。
  //   → network が amazon-de/amazon-us で、markets に "EU" か "global" を含む候補は
  //     network を問わず訪問者の自国 Amazon にリマップする。
  const isSharedAmazon = link.network === "amazon-de" || link.network === "amazon-us";
  const isRemappable = link.markets.includes("EU") || link.markets.includes("global");
  const remapped = isSharedAmazon && isRemappable && market ? LOCAL_REMAP[market] : undefined;
  const localNetwork = remapped ?? link.network;
  // 閉鎖済みアカウントは US(Earn Globally)へ退避する。詳細は RETIRED_AMAZON_NETWORKS。
  const retired = RETIRED_AMAZON_NETWORKS.has(localNetwork) ? ("amazon-us" as AspNetwork) : undefined;
  const effectiveNetwork = retired ?? localNetwork;
  const rewritten = retired ?? remapped;
  const effectiveLink = rewritten ? { ...link, network: effectiveNetwork, rawUrl: undefined } : link;

  const tagEnvKey = AMAZON_TAG_ENV[effectiveNetwork];
  const amazonHost = AMAZON_HOSTS[effectiveNetwork];

  if (tagEnvKey && amazonHost) {
    const tag = env(tagEnvKey) ?? AMAZON_TAG_DEFAULTS[effectiveNetwork];
    const q = encodeURIComponent(productName ?? effectiveLink.productId);
    if (tag) {
      // タグあり → 成果計上できるURLにタグを注入。
      // ①rawUrl(dp/検索どちらでも)があれば最優先 ②productIdが実ASIN(英数10桁)なら/dpリンク
      // ③それ以外(productIdが商品名)は /dp/名前=404 になるためタグ付き検索URLにフォールバック
      // ★退避時(retired)は ASIN を使わない。ASIN は marketplace ごとに違い、
      //   amazon.co.uk の ASIN を amazon.com/dp/ に付けると 404 になる
      //   (localAmazonFallback が商品名検索を使っているのと同じ理由)。
      let base;
      if (!retired && effectiveLink.rawUrl) base = effectiveLink.rawUrl;
      else if (!retired && /^[A-Z0-9]{10}$/.test(effectiveLink.productId)) base = `https://www.${amazonHost}/dp/${effectiveLink.productId}`;
      else base = `https://www.${amazonHost}/s?k=${q}`;
      return injectAmazonTag(base, tag);
    }
    // タグなし → ASIN URLは404リスクがあるため商品名検索にフォールバック
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
