# Pickly 配信オートメーション

サイトは検索/AI/画像/RSS（pull型）は最大化済み。ここでは**push型（こちらから配信）**を、できる限り自動・無料で増やす手順。

前提（実装済・稼働中）:
- RSS: `https://pickly.blog/feed.xml`（最新50記事）
- OG画像: `https://img.pickly.blog/og/<slug>-<locale>.png`（全記事・縦長1000x1500）
- 画像sitemap: `https://pickly.blog/sitemap.xml`（Google画像検索）

---

## ★最優先: RSS → Pinterest（API承認を迂回・主動線を自動化）
Pinterest API の Standard 承認待ちでも、**IFTTT/Zapier はあなたのログイン済みPinterestアカウントで投稿できる**ため、承認不要で自動ピン化できる。

1. https://ifttt.com （無料）でアカウント作成
2. Create → If **RSS Feed**「New feed item」→ Feed URL = `https://pickly.blog/feed.xml`
3. Then **Pinterest**「Add Pin to board」→ 接続（Pinterestログイン）→ ジャンル別ボード選択
   - Image URL: `{{EntryImageUrl}}`（RSSのenclosure＝OG画像）
   - Title/Note: `{{EntryTitle}}` / Link: `{{EntryUrl}}`
4. 有効化 → 以後、新記事が自動でピン化される

※ 既存575記事の一括ピンは `PINTEREST_PRIORITY_POSTS.md`（手動）で先行。承認が下りれば `pinterest-post.yml`（実装済）で全自動に切替。

## RSS → X / Facebook / LinkedIn（Buffer or Zapier）
- **Buffer**（無料枠）: https://buffer.com → 各SNS接続 → 「RSS」連携 or Zapier経由 → `feed.xml` を各SNSへ自動投稿
- **Zapier**（無料枠100tasks/月）: RSS by Zapier → Twitter/Facebook Page/LinkedIn
- 1日数件に分散（バースト回避）

---

## Mastodon 自動投稿（実装済・トークン設定で発効）
無料・API簡単。`social-syndicate.yml`（日次）が自動投稿する。
1. 任意のMastodonインスタンスでアカウント作成（例 mastodon.social）
2. 設定 → 開発 → 新規アプリ → スコープ `write:statuses` → アクセストークン取得
3. GitHub → Settings → Secrets:
   - `MASTODON_INSTANCE` = `https://mastodon.social`（あなたのインスタンス）
   - `MASTODON_TOKEN` = アクセストークン
4. 次回の日次実行（or 手動 `Run workflow`）で投稿開始。OGタグ対応済なのでリンクカードが綺麗に出る

## Telegram チャンネル自動投稿（実装済・トークン設定で発効）
1. Telegramで @BotFather → `/newbot` → **Bot Token** 取得
2. 公開チャンネル作成 → Botを管理者に追加 → チャンネル名（例 `@pickly_picks`）を控える
3. GitHub Secrets:
   - `TELEGRAM_BOT_TOKEN` = Bot Token
   - `TELEGRAM_CHAT_ID` = `@pickly_picks`
4. 日次実行で OG画像付き投稿が開始

> `social-syndicate.yml` は設定された channel だけに投稿（gated）。古い記事から1日4件ドリップ＝575記事を約5か月でカタログ全配信。`LIMIT` で調整可。冪等ログ `site/scripts/.social-posted.json`。

---

## 計測
全チャネルの効果は GA4（参照元/メディア）＝週次 `GROWTH_REPORT.md` に出る。`pinterest` / `mastodon` / `t.co`(X) / `flipboard` / Google画像 などが増えれば成功。

## まとめ（チャネル別 状態）
| チャネル | 種別 | 状態 |
|---|---|---|
| Google検索(17言語) / Bing | pull | ✅ |
| Google画像検索 | pull | ✅ 画像sitemap |
| LLM(ChatGPT/Claude/Gemini/Perplexity/Apple/Meta) | pull | ✅ robots+llms.txt開放 |
| RSS/アグリゲーター | pull | ✅ feed.xml |
| Pinterest | push | ⏳ IFTTT(即) or API承認後 pinterest-post.yml |
| Mastodon / Telegram | push | ⏳ 実装済・トークン設定で発効 |
| X/FB/LinkedIn | push | ⏳ Buffer/Zapier(あなたが接続) |
