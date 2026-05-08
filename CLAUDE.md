# affiliate_factory — project rules

> 量産型アフィリエイト比較・レビューサイト。Pinterest流入主軸＋多言語＋ASP統合で、Google検索に依存せずに全世界展開する。

---

## アーキテクチャ要点

- **1ドメイン集約**: ドメインオーソリティ集中、Cloudflare Pages（無料・帯域無制限）でデプロイ
- **Next.js 15 App Router**, Static Export 主体（記事はSSG）
- **next-intl** で17言語、URL prefix は `/[locale]/...`
- **17言語すべて active から開始**（Toolifyとは異なる方針 — Pinterest流入主軸でGoogle検索依存しないため、HCUペナルティリスクが低い）
- **記事3種類**: review（単品レビュー）/ comparison（比較ランキング）/ guide（バイヤーズガイド）
- **ASP-agnostic アフィリリンク層**: Amazon Associates, A8.net, もしも, ShareASale, CJ, Impact を1つの抽象で扱う

## ⚠️ 守るべき方針

1. **Pinterest優先**: 各記事に1000x1500の縦長OG画像必須。SEO第二優先
2. **AI生成色を消す**: 「In conclusion」「Furthermore」等の定型句、空虚な総論段落は禁止
3. **ジャンル過剰拡散禁止**: 1サイト=最大10ジャンルまで（Pinterest algorithm がmixed-genre嫌うため）
4. **ASP承認前**: pending: true で起動 → UI上は disabled / 「準備中」表示
5. **景表法・特商法対応**: 全アフィリリンクに rel="sponsored" + 「PR」ラベル + /disclosure ページ必須
6. **Pinterestアカウント=ジャンル別**: 1アカウントで全ジャンル投稿しない（algorithm penalty）
7. **コピペ禁止**: 他サイトからの転載・自動翻訳のみは禁止。Claude Codeで生成 → ローカライズ

## ディレクトリ

```
site/                      Next.js本体
  src/app/[locale]/        ロケール付きルート
  src/articles/<slug>/     各記事の実装 + i18n + spec
  src/lib/affiliates/      ASP抽象層 + offer catalog
  src/lib/articles/        記事 registry + types
  src/lib/i18n/            17 locale 定義
  src/lib/seo/             構造化データ・metadata + OG image gen
  src/components/articles/ ReviewArticle / ComparisonArticle / GuideArticle
  src/components/          共通UI（disclosure label, affiliate link）
pipeline/
  specs/                   記事 spec YAML（量産時の入力）
  prompts/                 Claude Code 用プロンプト群
    01_write.md            英語記事執筆
    02_translate.md        17言語翻訳
    03_image.md            Pinterest用画像生成プロンプト
  scripts/                 量産シェルスクリプト
automation/
  pinterest/               Pinterest API クライアント + 投稿スクリプト
docs/
  ASP_SETUP.md             各ASP（Amazon/A8/もしも/ShareASale等）登録手順
  PINTEREST_SETUP.md       Pinterest Business + Developer App 設定
  CONTENT_GUIDELINES.md    AI生成色を消すための執筆規則
```

## 記事量産フロー（標準）

1. `pipeline/specs/<slug>.yaml` を書く（5分）
   - type: review | comparison | guide
   - product/category, target_locale, primary_asp など
2. Claude Code で:
   - `pipeline/prompts/01_write.md` → en記事markdown生成
   - `pipeline/prompts/02_translate.md` → 17言語翻訳
   - `pipeline/prompts/03_image.md` → Pinterest用画像生成プロンプト
3. `cd site && npm run validate` で型/ i18n / アフィリリンクチェック
4. `npm run build` で全ビルド成功確認
5. PRマージで Cloudflare Pages 自動デプロイ
6. `cd automation/pinterest && npm run post` で新規記事のPinterestピン投稿

## チェックスクリプト

| 用途 | コマンド |
|---|---|
| TypeScript | `npm run typecheck` |
| i18n キー一致 | `npm run audit:i18n` |
| アフィリリンク監査 | `npm run audit:affiliate` |
| 全部まとめて | `npm run validate` |
| ビルド | `npm run build` |

## 環境変数

`.env.local` に設定（コミット禁止）:

```
NEXT_PUBLIC_SITE_URL=https://example.pages.dev
NEXT_PUBLIC_SITE_NAME=AffiliateFactory
NEXT_PUBLIC_CONTACT_EMAIL=contact@example.com

# ASP IDs（最低1つあれば動く）
AFFILIATE_AMAZON_TAG_JP=
AFFILIATE_AMAZON_TAG_US=
AFFILIATE_A8_SID=
AFFILIATE_MOSHIMO_SID=
AFFILIATE_SHAREASALE_USER_ID=
AFFILIATE_CJ_PID=
AFFILIATE_IMPACT_CAMPAIGN_ID=

# Pinterest API
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
PINTEREST_ACCESS_TOKEN=
PINTEREST_DEFAULT_BOARD_ID=
```

未設定でもビルドは通る（pending状態で表示）。

## 翻訳ルール（Claude Code 自身が実行）

外部翻訳API禁止、Claude Code (=自分) が直接翻訳する。
詳細は `pipeline/prompts/02_translate.md`。

## デプロイ前チェック

1. `npm run validate` PASS
2. `npm run build` PASS（Static export かつ 全 [locale]/[slug] 組合せが pre-render される）
3. `/sitemap.xml` `/robots.txt` がアクセス可能
4. プライバシー・規約・お問い合わせ・disclosure の4ページが完備

## アンチパターン（事前回避）

- ❌ 1記事を1ASPに依存 → 提携解除で全部ゴミ化。必ず複数ASPフォールバック対応
- ❌ Pinterestを1アカウントで全ジャンル投稿 → algorithm penalty
- ❌ AI生成色そのまま放置 → 直帰率高 + Pinterest品質スコア低下
- ❌ rel="sponsored" 忘れ → SEOペナルティ + Amazon Associates規約違反
- ❌ /disclosure ページなし → 景表法違反 + ASP規約違反
- ❌ Cloudflare Pages デプロイ前に画像最適化忘れ → Pinterest表示が遅い

## Toolifyとの関係

別プロジェクト・別ドメイン・別Cloudflare Pagesプロジェクト。コード・設定・デプロイすべて独立。i18n・affiliate抽象パターンはToolifyから流用したが、コードは別管理。Toolifyに混ぜない。
