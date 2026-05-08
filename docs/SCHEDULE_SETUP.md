# Schedule（自動化）セットアップ

Claude Code の `schedule` skill を使い、毎日決まった時刻に Claude Code が起動して

1. 新規記事を生成（spec があれば）
2. 既存記事を更新（価格変動など）
3. Pinterest にピン投稿

を実行する。

---

## 前提条件

- Claude Code がインストール済み（このプロジェクトで使用中）
- `.env.local` に Pinterest と ASP の認証情報が完全に揃っている
- `pipeline/specs/` にこれから生成する記事の spec が並んでいる

## 推奨スケジュール

| 時刻 (JST) | 処理 | 理由 |
|---|---|---|
| 09:00 | Pinterest pin (en/es/de向け) | US/EU朝のフィード |
| 21:00 | Pinterest pin (ja/ko/zh向け) | アジア圏の夜のフィード |
| 02:00 | 新規記事1本生成 + 全locale翻訳 | 低リソース時間帯 |
| 日曜 03:00 | 全記事の updatedAt 検査 + 価格再確認 | 週次メンテナンス |

## schedule skill の登録

Claude Code 内で:

```
/schedule
```

対話形式で:

1. **name**: `affiliate-pin-morning`
2. **cron**: `0 9 * * *`
3. **prompt**: 以下を貼り付け

```
cd /Users/ken/Dropbox/affiliate_factory/automation
PINTEREST_LOCALE_FILTER=en,es,de npm run post
```

同様に他のジョブも登録。

## 新規記事自動生成ジョブ

新規記事生成は Claude Code 自身に実行させる。schedule の prompt に直接指示を書く:

```
/Users/ken/Dropbox/affiliate_factory/pipeline/specs/ にある未消費の spec を1つ選び、
pipeline/prompts/01_write.md → 02_translate.md → 03_image.md の順に実行し、
最後に site/src/articles/<slug>/ にコミットして PR は作らず main に直 push する。
```

これは Claude Code の `schedule` skill が「Claude Code を起動 → そこに prompt を渡す」モデルだからこそできる芸当。

## 失敗時の挙動

`schedule` skill のジョブが失敗した場合:

1. 通知が `~/.claude/projects/.../notifications/` に残る
2. 翌日のジョブはそのまま実行される（chained でない）
3. Pinterest API が 429 を返したら `PINTEREST_MAX_PINS_PER_RUN` を半減する手動対応が必要

## 監視

```bash
/schedule list      # 登録済みジョブ確認
/schedule logs <name>  # 最終実行ログ
```

## アンチパターン

- ❌ 1日10ジョブ以上登録 → Claude Code 起動コスト（あなたの利用枠）が無駄に消費される
- ❌ 同じ Pinterest アカウントに 1日 50+ ピン → spammer 認定リスク
- ❌ 失敗を放置 → 静かに収益が落ちるが気付けない。週1回手動で `/schedule logs` を確認する
- ❌ ASP 提携解除を見逃す → catalog の approved=true を定期的に確認するジョブが別途必要
