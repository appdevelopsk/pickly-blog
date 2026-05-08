# もしもアフィリエイト統合ガイド

## 概要

Pickly では もしもアフィリエイト経由で Amazon・楽天・Yahoo・国内SaaS 案件のアフィリリンクを発行する。実装は2層:

| Layer | ファイル | 用途 | API要 |
|---|---|---|---|
| URL Wrapper | `src/lib/affiliates/moshimo-link.ts` | a_id+p_id+pc_id+pl_id でURL構築 | ❌ 不要 |
| API Client | `src/lib/affiliates/moshimo-client.ts` | 商品検索・成果データ取得 | ✅ 要 |

通常の運用は Layer 1 で十分。Layer 2 は管理画面で API キーが発行できる場合に追加機能として使う。

---

## Layer 1: URL Wrapper の使い方

もしも管理画面で承認済みの案件は、リンクコード取得画面で URL が見える。これをパースしたパラメータを `.env.local` に入れる。

### Step 1: 自分の a_id を確認

もしも管理画面右上アカウント名 → 「アカウント情報」 → 「メディアID」 が `a_id`。

```bash
# .env.local
AFFILIATE_MOSHIMO_SID=YOUR_A_ID
```

### Step 2: 各案件の p_id, pc_id, pl_id を取得

提携承認後、もしも管理画面で:

1. 「提携中プロモーション」 → 案件名(例: Amazon商品紹介プログラム)
2. 「リンクコード取得」 → デフォルトで生成されるURLは:
   ```
   https://af.moshimo.com/af/c/click?a_id=AAAAA&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2F
   ```
3. URL から `p_id=170`, `pc_id=185`, `pl_id=4062` を抽出
4. `.env.local` に保存:
   ```bash
   MOSHIMO_AMAZON_JP_P_ID=170
   MOSHIMO_AMAZON_JP_PC_ID=185
   MOSHIMO_AMAZON_JP_PL_ID=4062
   ```

または Claude Code CLI で自動パース:

```bash
npm run moshimo:link -- --parse "https://af.moshimo.com/af/c/click?a_id=AAAAA&p_id=170&..."
# → { a_id: "AAAAA", p_id: "170", pc_id: "185", pl_id: "4062", url: "https://www.amazon.co.jp/" }
```

### Step 3: 商品リンクを生成

```bash
# Amazon ASIN B0BRG7V8M2 を もしも経由で
npm run moshimo:link -- amazon-jp B0BRG7V8M2

# 出力例:
# https://af.moshimo.com/af/c/click?a_id=AAAAA&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2FB0BRG7V8M2

# 楽天 itemCode
npm run moshimo:link -- rakuten "shop-name:item-code"

# Yahoo!ショッピング 商品URL
npm run moshimo:link -- yahoo-shopping "https://store.shopping.yahoo.co.jp/example/item123.html"
```

### Step 4: catalog.ts に組み込む

```bash
# 単一案件を追加
npm run catalog:update -- --offer nordvpn --merchant amazon-jp --asin B0BRG7V8M2

# 出力された link object を catalog.ts に手動で貼る:
# (将来は自動 AST パッチ化予定)
```

CSV からの一括投入:

```bash
# catalog-asins.csv:
# offerId,merchant,productId
# nordvpn,amazon-jp,B0BRG7V8M2
# surfshark,amazon-jp,B08FCYK4QY

npm run catalog:update -- --offer-list catalog-asins.csv
```

---

## Layer 2: API Client(オプション)

もしも管理画面で API キーが発行できる場合、Layer 2 で商品検索が自動化できる。

```bash
# .env.local
MOSHIMO_API_KEY=your_api_key_here
```

```ts
import { MoshimoClient } from "@/lib/affiliates/moshimo-client";

const client = new MoshimoClient();

// 提携中プロモーション一覧
const promotions = await client.listPromotions();

// Amazon 案件内で「VPN」検索
const amazonPromo = promotions.find((p) => p.name.includes("Amazon"));
const products = await client.searchProducts({
  promotionId: amazonPromo!.id,
  keyword: "NordVPN",
  limit: 5,
});

// 商品リンク生成
const url = await client.generateLink({
  promotionId: amazonPromo!.id,
  productId: products[0].id,
});
```

⚠️ **API スペックは不確定**: もしもの公式API は会員ランクや時期によって変わる。実際に使う前にもしも管理画面でAPIキー発行画面 → API ドキュメントリンクを参照して endpoint/auth を確認すること。skeleton の `MoshimoClient` クラスは一般的な REST パターンに沿って書かれているので、実際のスペックと違う場合は `request<T>()` メソッド内のヘッダー名やパス命名規則を調整。

---

## 環境変数 reference

`.env.local` に設定する項目:

```bash
# 必須(全案件共通)
AFFILIATE_MOSHIMO_SID=          # メディアID (a_id)

# 案件別 (提携承認後に管理画面から取得して埋める)
MOSHIMO_AMAZON_JP_P_ID=
MOSHIMO_AMAZON_JP_PC_ID=
MOSHIMO_AMAZON_JP_PL_ID=

MOSHIMO_RAKUTEN_P_ID=
MOSHIMO_RAKUTEN_PC_ID=
MOSHIMO_RAKUTEN_PL_ID=

MOSHIMO_YAHOO_SHOPPING_P_ID=
MOSHIMO_YAHOO_SHOPPING_PC_ID=
MOSHIMO_YAHOO_SHOPPING_PL_ID=

MOSHIMO_CONOHA_WING_P_ID=
MOSHIMO_CONOHA_WING_PC_ID=
MOSHIMO_CONOHA_WING_PL_ID=

MOSHIMO_RAKUTEN_CARD_P_ID=
MOSHIMO_RAKUTEN_CARD_PC_ID=
MOSHIMO_RAKUTEN_CARD_PL_ID=

MOSHIMO_MYPROTEIN_P_ID=
MOSHIMO_MYPROTEIN_PC_ID=
MOSHIMO_MYPROTEIN_PL_ID=

MOSHIMO_ASKEN_P_ID=
MOSHIMO_ASKEN_PC_ID=
MOSHIMO_ASKEN_PL_ID=

MOSHIMO_RAKUTEN_SECURITIES_P_ID=
MOSHIMO_RAKUTEN_SECURITIES_PC_ID=
MOSHIMO_RAKUTEN_SECURITIES_PL_ID=

MOSHIMO_SBI_SECURITIES_P_ID=
MOSHIMO_SBI_SECURITIES_PC_ID=
MOSHIMO_SBI_SECURITIES_PL_ID=

# Layer 2 (オプション)
MOSHIMO_API_KEY=
MOSHIMO_API_BASE=https://api.moshimo.com/v1
```

未設定の項目は `PENDING` 文字列が含まれた URL が生成され、`approved: false` のまま自動的にUIで「準備中」表示される。

---

## アンチパターン

- ❌ a_id/p_id 等を git にコミットする → `.env.local` のみ。`.env.example` にダミー値を入れる
- ❌ 別メディアの a_id でリンクを発行する → 報酬がそのメディア側に行ってしまう
- ❌ もしも経由ではない直 Amazon URL を catalog に入れる → 紹介手数料がゼロ(自分のtagが付かない)
- ❌ `pending` 状態の link を `approved: true` にする → クリックしても "PENDING" URL でエラー

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| 生成URL に "PENDING" が含まれる | 環境変数未設定 | `.env.local` の該当項目を埋める |
| クリックしても「アクセスできません」 | a_id と p_id の組合せが不整合 | リンクコード取得画面で a_id/p_id 再確認 |
| もしも管理画面で「不正クリック」警告 | 自分でテストクリックしている | 別ブラウザ/シークレットモードでクリック確認 |
| 成果が反映されない | 24時間遅延が標準 | 翌日に再確認 |
| 管理画面APIキー欄がない | 会員ランクが要件未満 | 1円以上成果発生で「一般ランク」昇格、API利用可能化 |
