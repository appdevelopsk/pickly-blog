# Pinterest 自動投稿セットアップ

Pinterest API v5 で記事を自動ピン投稿する手順。

---

## 1. Pinterest Business Account 作成

1. https://business.pinterest.com/ で Business アカウント作成（無料）
2. プロフィールを完成させる（ジャンル・国・言語）
3. ドメイン認証: Settings → Claim → 自分のドメインを追加
4. 認証は「HTML タグ追加」が一番楽（`<meta name="p:domain_verify" content="...">` を `app/[locale]/layout.tsx` に貼る）

## 2. Pinterest Developer App 作成

1. https://developers.pinterest.com/apps/ で「Create app」
2. Redirect URI: `http://localhost:8080/callback` を追加
3. Standard access を申請（OAuth + 投稿用に必須、即時承認のことが多い）
4. App ID と App Secret をコピー → `.env.local` の `PINTEREST_APP_ID` `PINTEREST_APP_SECRET` に設定

## 3. アクセストークン取得

```bash
cd automation
npm install
npm run auth
```

ブラウザが開く → Pinterest にログインして承認 → ターミナルにアクセストークンが表示される。
`.env.local` の `PINTEREST_ACCESS_TOKEN` に貼り付け。

トークンは30日有効。リフレッシュトークン (1年有効) も同時に出るので保存。

## 4. ボード作成

Pinterest UIで投稿先のボードを作成。1ジャンル=1ボードを推奨（algorithmが「このアカウントは○○の専門」と認識しやすい）。

```bash
npm run boards
# → ボードIDの一覧が表示される
```

`.env.local` の `PINTEREST_DEFAULT_BOARD_ID` にメインボードのIDを設定。

## 5. 自動投稿

```bash
npm run post
```

実行されること:
- `site/src/articles/` を全列挙
- 各 (slug, locale) ペアごとに `${SITE_URL}/og/${slug}-${locale}.png` の画像URLでピン投稿
- 1日最大 `PINTEREST_MAX_PINS_PER_RUN`（デフォルト10）
- ピン間隔30秒（rate limit回避）

### 重要な制約

- **1日のピン数上限**: 25が安全圏。50超えると spammer 認定リスク
- **同一画像の連投NG**: locale違いでも同じ画像URLだと弾かれる → 言語別に画像を生成すること
- **アカウント年齢**: 新規アカウントは1日5ピンから始める（最初の30日）
- **投稿時間帯**: ターゲット国の朝7-9時 / 夕方17-21時 がベスト

## 6. 定期実行（schedule skill）

Claude Code の `schedule` skill を使って毎日自動実行:

```
/schedule
> create
> name: pinterest-daily
> cron: 0 9 * * *  (毎日09:00 JST)
> command: cd /Users/ken/Dropbox/affiliate_factory/automation && npm run post
```

詳細は CLAUDE Code の `/schedule help` を参照。

## トラブルシューティング

| エラー | 原因 | 対処 |
|---|---|---|
| 401 Unauthorized | トークン期限切れ | `npm run auth` で再取得 |
| 429 Too Many Requests | rate limit | `PINTEREST_MAX_PINS_PER_RUN` を下げる、SLEEP_MS を増やす |
| 400 Invalid image | 画像が1000x1500でない | `npm run og:generate` で再生成 |
| 403 Forbidden | アカウント自動化検知 | 24時間放置 → 1日5ピンから再開 |

## アカウント凍結リスク回避

Pinterest が嫌うパターン:
- 全部同じテンプレ画像（色・レイアウト）
- 1分以内に複数ピン
- 同一URLへの大量誘導
- スパムワード（"click here" "make money fast"）

回避策:
- 画像テンプレを 5-10 種類ローテーション
- 30秒以上のディレイ
- 1記事あたりlocale別に異なるピン
- pinDescription はAI臭を消す（`02_translate.md` の規則遵守）
