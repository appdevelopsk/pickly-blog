/**
 * 検索結果 → カタログ商品の関連性ガード（2026-08-20）。
 *
 * 楽天/Yahoo の検索は「それらしい別商品」を平然と上位に返す。実測で確認した
 * 誤マッチは4類型あり、それぞれに対応する判定を重ねている:
 *
 *   1. 消耗品・付属品   "電動歯ブラシ" → 替えブラシ / "空気清浄機" → 交換フィルター
 *   2. 同シリーズ別機種  "シリーズ9 Pro+ 9565cc" → 9617S / "ソニッケアー 9300" → 9000
 *   3. 近縁カテゴリ      "V60 ドリッパー" → V60珈琲王2 コーヒーメーカー
 *   4. 識別語の部分一致  "パワー2シリーズ" → 3100シリーズ（"シリーズ"だけ一致）
 *
 * 誤ったリンクを出すより無リンクのほうが正しい、という方針で閾値を設定している。
 * 楽天・Yahoo 双方のフェッチャがこの1本を参照する（以前は各スクリプトに
 * コピーがあり、片方だけ直して測定が無効になる事故が起きた）。
 */

/** 名前と価格だけを見るので、楽天/Yahoo どちらの商品型でも受けられる。 */
export type NamedPriced = { name: string; price: number; shop?: string };

export function norm(s: string): string {
  return s.toLowerCase().replace(/[\s　・,，.。:：()（）[\]【】|/_–—-]+/g, "");
}
// 商品名の主要トークン（en先頭語 + ja先頭5字）。関連商品の絞り込みに使う。
export function brandTokens(nameEn?: string, nameJa?: string): string[] {
  const t: string[] = [];
  const en = (nameEn ?? "").trim().split(/\s+/)[0] ?? "";
  if (en.length >= 3) t.push(norm(en));
  if (nameJa) {
    const j = norm(nameJa);
    if (j.length >= 3) t.push(j.slice(0, 5));
  }
  return t;
}
/**
 * 本体でなく付属品・消耗品を指す語（2026-08-20 実測で誤マッチした類型）。
 *   "Amazonベーシック 電動歯ブラシ" → Amazon Basics の楽器ケーブル
 *   "ブラウン オーラルB Genius X"   → 替えブラシ ¥2080
 *   "コウェイ アイレーマ200M"        → 交換フィルター ¥5805
 * ブランド名だけ一致すれば通るガードでは、これらが本体として売られてしまう。
 */
export const ACCESSORY_RE =
  /替えブラシ|替ブラシ|交換用|交換フィルター|詰め替え|詰替|つめかえ|リフィル|refill|替刃|替え刃|純正フィルター|カートリッジ|ケース|カバー|ホルダー|スタンド|stand|充電器のみ|ケーブル|cable|アダプター|adapter|フィルム|film|フイルム|リモコン|remote|マウント|mount|収納|専用袋|専用バッグ|メモリーカード|sdカード|microsd|tfカード|replacement|spare|accessor|専用プレート|グリルプレート|プレートのみ|に取り付け可能|セット販売|2点セット|3点セット|まとめ買い|[ぁ-んァ-ヴ一-龠a-zA-Z]＆[ぁ-んァ-ヴ一-龠a-zA-Z]/i;

/**
 * 中古・アウトレット等、本体だが状態・価格が本商品と乖離する出品。
 * 実測（2026-08-20）: "【中古】【輸入品・未使用】Lodge L8SK3 …" ¥51787（実売の約10倍）が
 * 型番一致で通ってしまった。価格レンジも壊すため除外する。
 */
export const USED_RE = /中古|古本|美品|ジャンク|アウトレット|訳あり|used|refurbish/i;

/**
 * 商品名に書籍を示す語が含まれる場合は無条件で不採用。
 * 実測(2026-08-21): 書店系ショップ(BOOKSTORE_SHOP_RE)には該当しない「Glomarket」
 * (米国輸入雑貨ショップ、正当な商品も多数扱う)の中に、洋書の解説本・電子書籍が
 * 複数件混入していた(monarch-money, schwab-platform, aws-ec2-cloud, render-cloud,
 * salesforce-sales-cloud-pro, asana-advanced 等)。ショップ単位では除外できないため、
 * 商品名に "Paperback"/"ペーパーバック"/"Kindle Edition"/ISBN等が含まれる場合を
 * 商品名ベースで除外する。
 */
export const BOOKSTORE_ITEM_RE =
  /paperback|ペーパーバック|kindle edition|hardcover|ハードカバー|isbn|紙書籍|電子書籍/i;

/**
 * 書店系ショップ（実測 2026-08-21）: VPN・SaaS・フィンテック・クラウドサービスなど
 * 楽天に実商品が存在しないカテゴリで検索すると、「ヒット無し」ではなく無関係な
 * 書籍・電子書籍に部分一致してしまう（例: "Rocket Money" → 種子パッケージ、
 * "Revolut" → 中古本、"AWS EC2" → 楽天Kobo電子書籍ストアの無関係な電子書籍）。
 * これらのショップがヒットした場合は、ブランド一致だけでなく識別語の過半数一致も
 * 必須にする（電子書籍リーダー本体など、本当に書店で売っている商品は通す）。
 */
export const BOOKSTORE_SHOP_RE = /楽天ブックス|楽天Kobo電子書籍ストア|ネットオフ|VALUE BOOKS|バリューブックス/i;

/**
 * ブランド一致だけでなく「ブランド以外の商品語」も共有しているか。
 * 楽天の商品名は装飾が多いため、カタログ名の非ブランド語のうち1つでも
 * 含まれていれば本体候補とみなす。
 */
/**
 * カタログ名の識別語のうち、楽天商品名に含まれる割合。
 *
 * 「1語でも一致すればOK」では近縁商品が通ってしまう（2026-08-20 実測）:
 *   "ハリオ V60 セラミックスリム"（ドリッパー） → "V60珈琲王2 コーヒーメーカー"
 *     … "v60" だけ一致し "セラミックスリム" が欠けている
 *   "ソニッケアー パワー2シリーズ" → "ソニッケアー 3100シリーズ"
 *     … "シリーズ" だけ一致
 * 過半数の識別語が載っていることを要求すると、これらは落ちる。
 */
export function productTokenScore(itemName: string, productTokens: string[]): number {
  if (productTokens.length === 0) return 1; // 判定材料が無ければブランド一致に委ねる
  const n = norm(itemName);
  const hit = productTokens.filter((t) => n.includes(t)).length;
  return hit / productTokens.length;
}

/** 識別語の過半数が一致していることを要求する閾値。 */
export const PRODUCT_TOKEN_THRESHOLD = 0.5;

/**
 * 製品カテゴリ語。型番を持たない商品（"ハリオ V60 セラミックスリム" =ドリッパー、
 * "COSRX ロウ pH ジェルクレンザー"）はブランド＋識別語だけでは近縁商品に着地する
 * （実測: ドリッパー→コーヒーメーカー ¥13440、クレンザー→ハニーグロウキット）。
 * カタログ名にこれらの語があれば、楽天商品名にも同じ語を要求する。
 */
export const CATEGORY_WORDS = [
  "ドリッパー", "コーヒーメーカー", "ミル", "ケトル", "サーバー",
  "クレンザー", "クレンジング", "シャンプー", "コンディショナー", "トナー", "化粧水",
  "美容液", "セラム", "クリーム", "日焼け止め", "サンスクリーン", "マスク", "石鹸",
  "歯ブラシ", "シェーバー", "トリマー", "ドライヤー", "アイロン",
  "加湿器", "空気清浄機", "除湿機", "扇風機", "掃除機", "ロボット掃除機",
  "炊飯器", "電子レンジ", "トースター", "ミキサー", "フライパン", "鍋",
  "スピーカー", "ヘッドホン", "イヤホン", "モニター", "キーボード", "マウス",
  // 2026-08-20 実測で誤マッチした領域の語を追加
  "バッグ", "リュック", "ダッフル", "トート", "スーツケース",
  "チェア", "椅子", "デスク",
  "ボトル", "タンブラー", "水筒", "マグ",
  "カメラ", "レンズ", "チェキ", "プロジェクター", "ドライブレコーダー",
  "スキレット", "ダッチオーブン", "ココット", "包丁", "まな板", "グリル",
  "フードプロセッサー", "ホットプレート", "圧力鍋", "スロークッカー",
  // 2026-08-21 実測: "Away The Pet Carrier" が識別語のブランド名"away"だけで
  // 無関係な女性用ワンピース("...Fly Away Midi Dress...")に一致した。
  // カテゴリ語が無いカタログ名では防げないため追加。
  // 同一商品がcatalog.ts本体とcatalog-additions.tsに重複登録されており、
  // 後者のja名は「ペットキャリア」（"キャリー"ではない表記ゆれ）なので両方登録する。
  "キャリー", "ペットキャリー", "キャリア", "ペットキャリア", "クレート", "ケージ",
];

/** カタログ名に含まれるカテゴリ語（無ければ空配列＝この判定は適用しない）。 */
export function categoryWords(nameJa?: string): string[] {
  const n = norm(nameJa ?? "");
  return CATEGORY_WORDS.filter((w) => n.includes(norm(w)));
}

/**
 * カタログ名に含まれる型番（"9565cc" "SP5588" "X10" "300S" "V745A"）を抜き出す。
 *
 * 型番を落とした検索候補は、必ず同シリーズの別機種に着地する（2026-08-20 実測）:
 *   "シリーズ9 Pro+ 9565cc" → 9617S / "ソニッケアー 9300" → 9000 /
 *   "RoboVac X10 Pro Omni" → G30
 * 価格帯は近いので消耗品ほど極端ではないが、記事が比較している機種と
 * 別の機種を売ることになる。そこでカタログ名に型番がある商品は、
 * 楽天側の商品名にも同じ型番が載っていることを必須にする。
 * 満たせない場合はヒット無し（＝リンクを出さない）とする。
 */
export function modelCodes(nameJa?: string, nameEn?: string): string[] {
  const out: string[] = [];
  for (const raw of [nameJa, nameEn]) {
    if (!raw) continue;
    for (const tok of raw.split(/[\s　/／|,，、()（）【】\[\]]+/).filter(Boolean)) {
      // 英数字混在かつ数字を含み、3文字以上のものを型番とみなす
      const t = tok.replace(/[+＋]/g, "");
      if (t.length < 3) continue;
      if (!/\d/.test(t)) continue;
      if (!/^[A-Za-z0-9-]+$/.test(t)) continue;
      if (/^\d+(\.\d+)?(ml|l|g|kg|mg|cm|mm|inch)$/i.test(t)) continue;
      const v = norm(t);
      if (v && !out.includes(v)) out.push(v);
    }
  }
  // 型番候補が複数あるときは最も具体的なものだけを使う。"シリーズ5000 SP5588" は
  // "5000" と "sp5588" の両方を拾うが、"5000" は同シリーズ全機種に一致してしまう。
  // 英字と数字が混在するトークンがあればそれだけを採用する。
  const mixed = out.filter((t) => /[a-z]/.test(t) && /\d/.test(t));
  return mixed.length ? mixed : out;
}

/** カタログ名から、ブランド語を除いた識別語（2文字以上）を取り出す。 */
export function productTokens(nameJa?: string, nameEn?: string, brands: string[] = []): string[] {
  const out: string[] = [];
  for (const raw of [nameJa, nameEn]) {
    if (!raw) continue;
    const toks = raw.split(/[\s　/／|,，、()（）【】\[\]]+/).filter(Boolean);
    // 先頭語はブランドであることが多いので落とす
    for (const tok of toks.slice(1)) {
      const v = norm(tok);
      if (v.length < 2) continue;
      if (brands.some((b) => b.includes(v) || v.includes(b))) continue;
      if (!out.includes(v)) out.push(v);
    }
  }
  return out;
}

// 取得した候補から、関連商品(トークン一致)に絞って 最上位/最安/最高 を出す。

/**
 * カタログ商品に対応する検索結果を1件選び、併せて価格レンジを返す。
 * 関連品が1件も無ければ null（＝リンクを出さない）。以前は items[0] へ
 * フォールバックしていたため、無関係な商品が本体リンクとして採用されていた。
 */
export function pickWithRange<T extends NamedPriced>(
  items: T[],
  tokens: string[],
  prodTokens: string[] = [],
  codes: string[] = [],
  cats: string[] = [],
): { top: T; priceMin: number | null; priceMax: number | null } | null {
  if (items.length === 0) return null;
  const relevant = (tokens.length
    ? items.filter((it) => tokens.some((t) => norm(it.name).includes(t)))
    : items
  )
    .filter(
      (it) =>
        !ACCESSORY_RE.test(it.name) &&
        !USED_RE.test(it.name) &&
        !BOOKSTORE_ITEM_RE.test(it.name) &&
        productTokenScore(it.name, prodTokens) >= PRODUCT_TOKEN_THRESHOLD &&
        // 書店系ショップ(楽天ブックス/Kobo電子書籍/中古書店)は無条件で不採用。
        // 実測(2026-08-21): 全識別語一致(every)まで強化しても、"Workday HCM A Complete
        // Guide"のようにブランド語のみのカタログ名や、"Euhomy countertop ice maker
        // user guide"のように商品名そのものを冠した無関係の解説本・電子書籍が識別語
        // 一致で通過し続けた（17件確認）。書籍タイトルは元の商品名を模倣しやすく、
        // トークン一致では原理的に誤マッチを防げないため、ショップ単位で除外する。
        !BOOKSTORE_SHOP_RE.test(it.shop ?? ""),
    )
    // 型番があるカタログ商品は、型番一致を必須にする（別機種の混入を防ぐ）
    .filter((it) => codes.length === 0 || codes.some((c) => norm(it.name).includes(c)))
    // 型番が無い商品はカテゴリ語で近縁商品を弾く
    .filter(
      (it) =>
        codes.length > 0 || cats.length === 0 || cats.some((w) => norm(it.name).includes(norm(w))),
    );
  const top = relevant[0];
  if (!top) return null;
  const anchor = top.price > 0 ? top.price : relevant.find((i) => i.price > 0)?.price ?? 0;
  const band =
    anchor > 0
      ? relevant.filter((i) => i.price >= anchor * 0.6 && i.price <= anchor * 1.8)
      : relevant.filter((i) => i.price > 0);
  const prices = (band.length ? band : [top]).map((i) => i.price).filter((p) => p > 0);
  return {
    top,
    priceMin: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
  };
}

/** カタログ商品名から、ガードに必要な4種の判定材料をまとめて作る。 */
export function guardsFor(nameJa?: string, nameEn?: string) {
  const tokens = brandTokens(nameEn, nameJa);
  return {
    tokens,
    prodTokens: productTokens(nameJa, nameEn, tokens),
    codes: modelCodes(nameJa, nameEn),
    cats: categoryWords(nameJa),
  };
}
