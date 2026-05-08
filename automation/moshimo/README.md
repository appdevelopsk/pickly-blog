# もしもアフィリエイト Playwright 自動化

Headed Chromium でもしものログイン UI を 1 度突破 → セッション永続化 → 以降のメディア管理・提携申請・リンクコード取得を CLI 化する。

---

## 制約と注意

- **規約グレーゾーン**: ASP は基本「自分のアカウントを通常人間がやる範囲で操作する」のはOK。短時間の連射は避ける。
- **reCAPTCHA**: 初回ログイン時のみ手動。永続コンテキストに保存後、以降は自動可。
- **2FA**: 設定している場合、初回手動。コードはターミナルでなくブラウザに直接入力。
- **UI 変更耐性**: もしもの画面構造が変わるとセレクタ調整必要。年1-2回メンテ前提。
- **本番セッション保護**: `~/.cache/pickly-playwright/moshimo/` を git に commit しない(.gitignore済み)。

---

## セットアップ

```bash
cd /Users/ken/Dropbox/affiliate_factory/automation
npm install   # playwright + tsx 等
npx playwright install chromium
```

## 使い方

### Step 1: 初回ログイン (人間が操作)

```bash
npm run moshimo:login
```

→ Chromium が開く → 通常通りログイン (ID/PW + reCAPTCHA) → ダッシュボード到達したらターミナルで Enter。

セッションが `~/.cache/pickly-playwright/moshimo/` に保存される。30 日有効。

### Step 2: メディアカテゴリ更新

```bash
# デフォルト「IT・インターネット」に変更
npm run moshimo:update-category

# 別カテゴリを指定
npm run moshimo:update-category -- "ガジェット・家電"
```

### Step 3: プロモーション提携申請

```bash
# 1件ずつ
npm run moshimo:apply-promotion -- Amazon
npm run moshimo:apply-promotion -- 楽天市場
npm run moshimo:apply-promotion -- "Yahoo!ショッピング"
npm run moshimo:apply-promotion -- ConoHa
npm run moshimo:apply-promotion -- マイプロテイン

# 一括
for kw in "Amazon" "楽天市場" "Yahoo!ショッピング" "ConoHa" "マイプロテイン"; do
  npm run moshimo:apply-promotion -- "$kw"
done
```

### Step 4: 提携承認後、リンクコード一括抽出

承認待ちが解消(数時間〜数日)したら:

```bash
# 全提携プロモーションから (a_id, p_id, pc_id, pl_id) を抽出
npm run moshimo:fetch-link-codes

# .env.local に直接追記
npm run moshimo:fetch-link-codes >> ../site/.env.local
```

### Step 5: catalog 反映 → デプロイ

```bash
cd ../site

# Amazon ASIN を Pickly の VPN記事に紐付け
npm run catalog:update -- --offer nordvpn --merchant amazon-jp --asin B0BRG7V8M2 --apply

# CSV一括
npm run catalog:update -- --offer-list catalog-asins.csv --apply

# 検証 + デプロイ
npm run validate && npm run build && cd .. && ./deploy/deploy.sh
```

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| ログイン後すぐ「ログインセッション無効」エラー | クッキーがブロックされている。Chromium プロファイル削除して `npm run moshimo:login` 再実行: `rm -rf ~/.cache/pickly-playwright/moshimo` |
| カテゴリ更新で `select` が見つからない | UI が変わった。`update-category.ts` のセレクタを調整 |
| reCAPTCHA が頻繁に出る | 短時間の連射が原因。`for` ループの間に `sleep 5` を入れる |
| アカウント凍結警告 | 自動化を停止、もしもサポートに連絡 |

---

## デバッグ用コマンド

```bash
# ヘッドレス実行 (CI / リモート用)
HEADLESS=1 npm run moshimo:fetch-link-codes

# Chromium プロセスの確認
ps aux | grep -i "Chromium\|Playwright"

# セッションデータの場所
ls ~/.cache/pickly-playwright/moshimo/
```

## ToS 遵守ポリシー

このスクリプトは「人間がブラウザで行う操作の置き換え」を目的とし、以下を遵守する:
- ✅ 自分のアカウントのみ操作
- ✅ 1秒未満のリクエスト連射を避ける
- ✅ reCAPTCHA を bypass しない
- ✅ 公開データのスクレイピングではない
- ❌ 他者のアカウントへのアクセス禁止
- ❌ 規約で禁止される自動投稿等は実装しない
