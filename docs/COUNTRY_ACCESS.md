# 国別アクセスの実態と読み方 (2026-09-09)

GA4 の国別レポートを見て「全ての国の人が利用できるサイトになっているか」を判断するための基準。
同じ誤診断を繰り返さないために、設計上そうなっている点と本当の欠陥を分けて書く。

## 1. 閲覧: 全ての国から可能

- 国ブロック・WAF の地域制限は無い。`functions/_middleware.ts` の geo 参照は GB/CA に `x-market` cookie を付けるだけ。
- 17 ロケール全部を配信。ar / hi / id / th / vi / tr は **noindex + sitemap 除外**(`src/lib/i18n/locales.ts` の `INDEXED_LOCALES`)なので、これらの国からの検索流入が少ないのは意図した結果。
- `/` は `functions/index.ts` が Accept-Language で振り分ける(人間は 302 `/<locale>/`、クローラと英語は 301 `/en/`)。ロケール一覧は `scripts/check-root-routing.mjs` が `locales.ts` と同期検査する(prebuild)。
- 中国: フォントはビルド時に自己ホスト化済み。GA4 / Clarity / YouTube 埋め込みは読み込めないが CSP が無いので本文描画は巻き込まれない。

## 2. 購買導線 (Amazon の着地先) — 設計どおりの部分と欠陥を分ける

| 読者の国 | 着地先 | 状態 |
|---|---|---|
| 日本 (`/ja/`) | amazon.co.jp (JP アカウント) | 正常。JP は Earn Globally 対象外なので **退避してはいけない** |
| ドイツ語圏 (`/de/`) | amazon.de (DE 本承認アカウント) | 正常 |
| US / CA / UK / FR / IT / ES / NL / PL / SE | amazon.com のリンク → Amazon 側が自国ストアへ自動転送し現地レートで US アカウントに計上 (**Earn Globally**) | **設計どおり**。GA4 の `linkDomain` は href を記録するので `amazon.com` に見えるが、読者は自国 Amazon に着く。`asp.ts` の `RETIRED_AMAZON_NETWORKS` のコメント参照 |
| ブラジル・メキシコ・インド・韓国・豪州・東南アジア・中東 等 | amazon.com の商品名検索 (`/s?k=`) | Earn Globally 対象外。現地 Amazon に飛ばしても報酬ゼロなので、国際配送で買える amazon.com が唯一の課金導線。**欠陥ではないが購買率は低い**。改善は現地アソシエイト取得が前提 |

- 「FR/ES/IT のクリックが amazon.com 行きになっている」は**欠陥ではない**(2026-09-09 に一度誤診断した)。
- `scripts/audit-affiliate-localization.ts` の `EXPECT` 表がこの対応を門番している。個別アカウントを復活させたら `asp.ts` の Set と `EXPECT` を対で直す。

## 3. GA4 国別レポートの読み方

- 標準レポートの約 4 割は **ボット**(2026-08-12..09-08 実測: 2,533 中 1,103 = 43.5%)。型は「Direct 流入 × 中国語ブラウザ × 滞在 0 秒」で、US / China / Iran / Russia / Vietnam / Germany に散る。素の表では「US が 44%」「中国・イランで滞在 0 秒」に見えるが、サイトの不具合ではない。
- 必ず `npm run report:countries` で見る。Direct × 滞在 3 秒未満の塊を分離し、人間の数(`human`)で国を並べる。
- 送信元での対策: `src/app/[locale]/layout.tsx` の gtag は `navigator.webdriver===true`(Puppeteer / Selenium)のとき config を送らない(2026-09-09)。効果はデプロイ 1 週間後に `report:countries` のボット率で確認する。追加で Cloudflare の Bot Fight Mode を有効にする案はダッシュボード側の設定変更なので承認制。

## 4. 変更履歴

- 2026-09-09: `functions/index.ts`(Accept-Language 振り分け) / gtag webdriver ゲート / `report:countries` / `check-root-routing` を追加。
