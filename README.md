# affiliate_factory

Pinterest流入主軸の多言語アフィリエイトサイト・量産基盤。

## クイックスタート

```bash
cd site
npm install
npm run dev
# → http://localhost:3000/en
```

## 主要コマンド

```bash
npm run dev          # 開発サーバ
npm run build        # 本番ビルド（Static Export）
npm run typecheck    # TypeScript チェック
npm run validate     # 型 + i18n + アフィリリンク 一括監査
```

## 記事量産

1. `pipeline/specs/<slug>.yaml` に記事仕様を書く
2. Claude Code に `pipeline/prompts/01_write.md` を実行させて英語記事生成
3. `pipeline/prompts/02_translate.md` で 17言語翻訳
4. `npm run validate && npm run build` で確認
5. push → Cloudflare Pages 自動デプロイ

詳細は `CLAUDE.md` を参照。

## 各種設定

- ASP登録（Amazon, A8, もしも, ShareASale, CJ, Impact）: `docs/ASP_SETUP.md`
- Pinterest 自動投稿: `docs/PINTEREST_SETUP.md`
- AI生成色を消すルール: `docs/CONTENT_GUIDELINES.md`
