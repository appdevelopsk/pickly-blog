# レンタルサーバー案件 ASP 申請チェックリスト

`conoha-wing-review-2026` と `best-rental-server-jp-2026` で扱う5社の提携申請手順と、承認後にやるべきカタログ反映作業。

申請に使う共通項目は `docs/ASP_APPLICATION_VALUES.md` から流用すること。

---

## 各サーバーの ASP マッピング

| Offer ID (catalog) | サーバー名 | 申請先 ASP | 申請ページ | 報酬目安(2026年5月時点) |
|---|---|---|---|---|
| `conoha-wing` | ConoHa WING | もしもアフィリエイト | https://af.moshimo.com/af/r/promotion/2113 | 新規申込 ¥1,500-3,000 |
| `xserver` | エックスサーバー | A8.net | A8 ログイン後「プログラム検索」で「エックスサーバー」 | 新規申込 ¥1,000-3,500 (キャンペーン時 ¥10,000+) |
| `mixhost` | mixhost | A8.net | A8 ログイン後「プログラム検索」で「mixhost」 | 新規申込 ¥3,000-5,000 |
| `sakura-rentalserver` | さくらのレンタルサーバ | A8.net | A8 ログイン後「プログラム検索」で「さくらインターネット」 | 新規申込 ¥1,000-2,500 |
| `lolipop-server` | ロリポップ！ | もしもアフィリエイト | https://af.moshimo.com/af/r/promotion/3412 | 新規申込 ¥1,500-2,500 |

注: `https://af.moshimo.com/af/r/promotion/<ID>` の番号は時期で変わる可能性あり。リンクが 404 の場合は、もしも管理画面トップ → 「プロモーション検索」で `ConoHa WING` / `ロリポップ` と検索。

---

## 申請順の推奨

1. **もしも 2件まとめて申請** (ConoHa WING + Lolipop): 同じASPで一度にまとめると審査もまとめて通る
2. **A8.net 3件まとめて申請** (Xserver + mixhost + Sakura): 同上
3. 提携承認まで通常 1-3営業日。サーバージャンルは比較的審査が緩い

---

## 申請時に貼る項目 (各 ASP 共通)

申請フォームに以下を貼る。詳細は `docs/ASP_APPLICATION_VALUES.md` を参照:

- **サイト名**: Pickly
- **サイト URL**: https://pickly.blog
- **サイトカテゴリ**: 比較・ランキング / IT・インターネット
- **紹介文(中)**: ASP_APPLICATION_VALUES.md の200字版を貼る
- **想定月間PV**: 5,000-10,000(3-6ヶ月後)
- **連絡先メール**: contact@pickly.blog

---

## 承認後の作業 (catalog-overrides.json への反映)

### Step 1 — リンクコード取得

#### もしもの場合 (ConoHa WING / Lolipop)

1. もしも管理画面 → 「提携中プロモーション」
2. 該当案件を開く → 「リンクコード取得」
3. デフォルトで生成される URL をコピー:
   ```
   https://af.moshimo.com/af/c/click?a_id=AAAAA&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.conoha.jp%2Fwing%2F
   ```
4. URL からパラメータを抽出 → `.env.local` に書く:
   ```bash
   AFFILIATE_MOSHIMO_SID=AAAAA
   MOSHIMO_CONOHA_WING_P_ID=170
   MOSHIMO_CONOHA_WING_PC_ID=185
   MOSHIMO_CONOHA_WING_PL_ID=4062
   # Lolipop も同様に
   MOSHIMO_LOLIPOP_P_ID=...
   MOSHIMO_LOLIPOP_PC_ID=...
   MOSHIMO_LOLIPOP_PL_ID=...
   ```

   または、Claude Code CLI でパース:
   ```bash
   cd site && npm run moshimo:link -- --parse "https://af.moshimo.com/af/c/click?a_id=AAAAA&..."
   ```

#### A8.net の場合 (Xserver / mixhost / Sakura)

1. A8.net 管理画面 → 「提携中プログラム」
2. 該当プログラムを開く → 「広告リンク」
3. **テキスト形式** のリンクコードを表示し、URL をコピー:
   ```
   https://px.a8.net/svt/ejp?a8mat=XXXXXX+YYYYYY+ZZZZ+ABCDEF&a8ejpredirect=https%3A%2F%2Fwww.xserver.ne.jp%2F
   ```
4. URL 全体を `rawUrl` として catalog-overrides に保存(下記 Step 2)

A8 は管理画面が案件ごとに完全な URL を発行するので、`rawUrl` を直接保存するのが最も確実。

### Step 2 — catalog-overrides.json への反映

5社すべて、拡張版 CSV テンプレート + CLI で一括反映できる。

#### 推奨フロー: CSV 一括

`pipeline/catalog-rental-servers.csv` を開いて、a8 案件 3行の `rawUrl` 列に A8 管理画面で取得したテキスト形式の URL を貼り付ける。moshimo の 2行は空のままでよい(env 変数経由で解決)。

```bash
cd site

# プレビュー (--apply なしで何が書かれるか確認)
npm run catalog:update -- --offer-list ../pipeline/catalog-rental-servers.csv

# 適用
npm run catalog:update -- --offer-list ../pipeline/catalog-rental-servers.csv --apply
```

#### 個別反映 (1件ずつ)

もしも案件 (env 変数を .env.local に入れた後):

```bash
cd site
npm run catalog:update -- --offer conoha-wing --merchant conoha-wing --product-id "" --apply
npm run catalog:update -- --offer lolipop-server --merchant lolipop --product-id "" --apply
```

A8 案件 (rawUrl 必須):

```bash
cd site
npm run catalog:update -- \
  --offer xserver --network a8 --product-id xserver-jp \
  --raw-url "https://px.a8.net/svt/ejp?a8mat=XXXXX&a8ejpredirect=https%3A%2F%2Fwww.xserver.ne.jp%2F" \
  --apply

npm run catalog:update -- \
  --offer mixhost --network a8 --product-id mixhost-jp \
  --raw-url "https://px.a8.net/svt/ejp?a8mat=YYYYY&a8ejpredirect=https%3A%2F%2Fmixhost.jp%2F" \
  --apply

npm run catalog:update -- \
  --offer sakura-rentalserver --network a8 --product-id sakura-rentalserver-jp \
  --raw-url "https://px.a8.net/svt/ejp?a8mat=ZZZZZ&a8ejpredirect=https%3A%2F%2Fwww.sakura.ne.jp%2F" \
  --apply
```

### Step 3 — 検証

```bash
cd site
npm run validate     # i18n + typecheck + affiliate
# 期待: "approved" 警告が ConoHa/Xserver/Lolipop/Sakura/mixhost について消える
npm run build        # SSG ビルド
```

### Step 4 — デプロイ

`./deploy/deploy.sh` または PR マージで Cloudflare Pages 自動デプロイ。

---

## 注意事項

- **Amazonアソシエイトとの併用禁止例**: 一部のサーバー案件は「Amazon リンクと同一ページ内併用禁止」のような規約がある場合がある。提携承認時に必ず規約を読む
- **本人申込キャッシュバック禁止**: もしもは本人申込にキャッシュバック対応の案件があるが、ASP規約上禁止のことも多い。原則は「読者向け」で書く
- **PR 表記必須**: 全アフィリエイトリンクは `rel="sponsored"` 付与済み(コンポーネント側で対応済み)+ 記事冒頭の「PR」ラベル + `/disclosure` ページで開示
- **規約変更の追跡**: 各 ASP の規約は四半期に一度見直すこと。特に景表法・特商法の改正があるたびに反映
