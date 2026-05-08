# ASP Setup Guide

各ASPの登録手順と、承認後にアフィリエイトリンクを catalog に追加する方法。

---

## 申請順序の推奨

審査の早さ・案件量・収益性で並べた現実的な順序。

| # | ASP | 主要市場 | 審査スピード | 月収目安 | 必要素材 |
|---|---|---|---|---|---|
| 1 | **もしもアフィリエイト** | JP | 3-5日 | 〜¥30k/月 | サイト1つ、5記事以上 |
| 2 | **A8.net** | JP | 即時〜3日 | 〜¥100k/月 | サイト不要でも登録可 |
| 3 | **Amazon Associates JP** | JP | 180日以内に3売上必須 | 〜¥50k/月 | サイト10記事以上推奨 |
| 4 | **Amazon Associates US** | US | 180日以内に3売上必須 | $〜500/月 | 英語サイト必須 |
| 5 | **Rakuten アフィリエイト** | JP | 即時 | 〜¥30k/月 | 楽天アカウントあれば即時 |
| 6 | **ValueCommerce** | JP | 1-2週間 | 〜¥80k/月 | サイト10記事以上 |
| 7 | **ShareASale** | US | 1-2週間 | $〜500/月 | 英語サイト + アクセス |
| 8 | **CJ Affiliate** | US | 1-2週間 | $〜1k/月 | 英語サイト + 月1k pv |
| 9 | **Impact** | global | 1-4週間 (案件別) | $〜2k/月 | 英語サイト + アクセス |
| 10 | **Awin** | EU/UK | 1-2週間 + $5登録料 | €〜500/月 | EU向けサイト |

## 申請前に必要なもの

1. **完成したサイト** （5-10記事以上、TOPページ、運営者情報、プライバシー、利用規約、お問い合わせ）
2. **独自ドメイン**（`.pages.dev` サブドメインだとAmazon審査落ちやすい）
3. **メールアドレス** （独自ドメインのメール推奨：contact@yourdomain.com）
4. **広告表記ページ** `/disclosure`（必須・景表法対応）

## 各ASP個別ノート

### Amazon Associates
- 180日以内に3件売上達成必須。達成しないとアカウント閉鎖
- リンクは必ず `tag=` パラメータで付与（asp.ts で自動付与済み）
- 価格を記事に書く場合は「執筆時点」と明記必須
- 商品画像はAPI経由のみ（自前ホスト禁止）

### A8.net
- セルフバックがある（自分で申し込んで報酬発生）
- 即時提携OKな案件と承認制案件あり
- A8リンクの `a8mat` パラメータが SID

### もしもアフィリエイト
- W報酬制度（A8より高単価のことが多い）
- かんたんリンクで Amazon/楽天/Yahoo統合リンクが作れる
- もしもの管理画面でクリック→中間URL生成→`rawUrl`にセット

### ShareASale
- 提携にマーチャント審査が個別にある
- US商品でJP配送NG多数 → ターゲットlocale慎重に
- レポート遅延が大きい（1日遅れ）

### Impact
- SaaS / VPN / ホスティング系の高単価案件多数
- 「マーチャント側がパブリッシャー側に申請する」モデルもあり
- 提携キャンペーンごとに別の Campaign ID が必要

## 承認後の作業

ASPで案件提携承認 → catalog に offer を追加:

```ts
// site/src/lib/affiliates/catalog.ts
{
  id: "nordvpn",
  category: "tech",
  name: { en: "NordVPN", ja: "NordVPN" },
  description: { en: "...", ja: "..." },
  links: [
    {
      network: "impact",
      productId: "abc123",  // Impact の Action Tracker ID
      markets: ["US", "EU", "global"],
      approved: true,
    },
    {
      network: "a8",
      productId: "ja-deeplink-id",
      markets: ["JP"],
      approved: true,
    },
  ],
}
```

`approved: true` にすると UI 上で有効化され、`rel="sponsored"` でリンクが出力される。

## 環境変数の設定

`.env.local` に各ASPのアカウントID/タグを設定（`.env.example` 参照）。
未設定だとリンクは `?tag=PENDING` のような placeholder で出力されるので、Cloudflare Pages でも `Settings → Environment variables` に必ず本番値を設定すること。
