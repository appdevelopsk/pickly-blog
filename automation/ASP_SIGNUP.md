# ASP Sign-up Automation

国内/海外 4 ASP の Playwright 半自動化スクリプト。
全て chromium.launchPersistentContext で `~/.cache/pickly-playwright/<asp>/` にセッション永続化、認証情報は `~/.config/pickly/<asp>.env` (chmod 600) から読み込む。

## 共通の前提

1. `cd /Users/ken/Dropbox/affiliate_factory/automation`
2. `npm install` (初回のみ)
3. `~/.config/pickly/` ディレクトリ存在確認: `mkdir -p ~/.config/pickly && chmod 700 ~/.config/pickly`

## 1. A8.net (国内、審査ゆるめ・即時 / 1営業日)

### 必要な env (~/.config/pickly/a8.env)
```
A8_EMAIL=app.develop.sk@gmail.com
A8_LOGIN_ID=任意 (3-15半角英数)
A8_PASSWORD=任意 (8-16半角英数+記号)
A8_LAST_NAME=...
A8_FIRST_NAME=...
A8_LAST_NAME_KANA=...
A8_FIRST_NAME_KANA=...
A8_BIRTHDAY=YYYY-MM-DD
A8_POSTAL_CODE=1234567
A8_PREFECTURE=東京都
A8_ADDRESS=...
A8_PHONE=09012345678
A8_SITE_NAME=Pickly
A8_SITE_URL=https://pickly.blog/
A8_SITE_CATEGORY=エンタメ・趣味
A8_SITE_DESCRIPTION=...
```

### 実行
```sh
chmod 600 ~/.config/pickly/a8.env
npm run a8:signup       # 初回登録 (headed)
npm run a8:login        # 既存アカウントログイン (headed)
npm run a8:list-programs -- --keyword "VPN"   # 検索
```

## 2. ShareASale (US/SaaS、審査3-7営業日)

### 必要な env
```
SHAREASALE_USERNAME=任意
SHAREASALE_PASSWORD=...
SHAREASALE_EMAIL=app.develop.sk@gmail.com
SHAREASALE_FIRST_NAME=...
SHAREASALE_LAST_NAME=...
SHAREASALE_PHONE=+81-90-1234-5678
SHAREASALE_ADDRESS1=...
SHAREASALE_CITY=Tokyo
SHAREASALE_STATE=Tokyo
SHAREASALE_ZIP=1234567
SHAREASALE_COUNTRY=Japan
SHAREASALE_WEBSITE_URL=https://pickly.blog/
SHAREASALE_WEBSITE_NAME=Pickly
SHAREASALE_WEBSITE_DESCRIPTION=Honest reviews and rankings, picked by humans, written for humans across 17 languages.
```

### 実行
```sh
chmod 600 ~/.config/pickly/shareasale.env
npm run shareasale:signup
```

## 3. Impact.com (global, VPN系/SaaS、審査1-3営業日)

### 必要な env
```
IMPACT_EMAIL=app.develop.sk@gmail.com
IMPACT_PASSWORD=...
IMPACT_FIRST_NAME=...
IMPACT_LAST_NAME=...
IMPACT_COMPANY_NAME=Pickly
IMPACT_WEBSITE_URL=https://pickly.blog/
IMPACT_COUNTRY=Japan
IMPACT_PHONE=+81-90-1234-5678
IMPACT_MONTHLY_VISITORS=1000
IMPACT_PRIMARY_CATEGORY=Reviews
```

### 実行
```sh
chmod 600 ~/.config/pickly/impact.env
npm run impact:signup
```

## 4. Amazon Associates US (US Amazon、180日以内に3件売上達成必須)

### 必要な env
```
AMAZON_US_EMAIL=app.develop.sk@gmail.com (Amazon.com アカウント)
AMAZON_US_PASSWORD=...
AMAZON_US_PAYEE_NAME=Full Legal Name (英字)
AMAZON_US_WEBSITE_URL=https://pickly.blog/
AMAZON_US_PREFERRED_STORE_ID=US
AMAZON_US_PRIMARY_TOPICS=Consumer Electronics, Home & Garden, Beauty & Personal Care
AMAZON_US_TRAFFIC_SOURCES=Pinterest, SEO, Direct
AMAZON_US_MONTHLY_VISITORS=under-500
AMAZON_US_PHONE=+81-90-1234-5678
```

### 実行
```sh
chmod 600 ~/.config/pickly/amazon-us.env
npm run amazon-us:signup
```

⚠ 登録後別途 W-8BEN tax interview を Account → Tax info から完了させる。

## 後続作業 (申請通過後)

1. 各 ASP の affiliate ID / API token を `~/.config/pickly/<asp>.env` に追記
2. `site/src/lib/affiliates/catalog.ts` の RAW_CATALOG に各オファーを追加
3. `affiliateConfig.affiliate-overrides.json` で a_id 等の per-promotion 値を統合
4. `cd site && npm run validate && ./deploy/deploy.sh` で反映
