# GA4 Daily Snapshot — セットアップ手順

毎朝9時に前日のGA4データを `data/analytics/daily.csv` に追記します。

## 1. プロパティIDを確認

GA4 → 管理 → プロパティ設定 → **プロパティID**（9桁の数字）をコピー。

## 2. gcloud認証（初回のみ）

```bash
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/analytics.readonly
```

ブラウザが開くのでGoogleアカウントでログイン。

## 3. 手動テスト実行

```bash
cd /Users/ken/Dropbox/affiliate_factory
GA4_PROPERTY_ID=123456789 npx tsx automation/ga4-daily-snapshot.ts
```

動作確認できたら `data/analytics/daily.csv` にデータが追記される。

## 4. launchd cron 登録（毎朝9時自動実行）

plistファイルを配置:

```bash
cp /Users/ken/Dropbox/affiliate_factory/docs/ga4-snapshot.plist \
   ~/Library/LaunchAgents/com.pickly.ga4-snapshot.plist

# GA4_PROPERTY_ID を実際の値に書き換える
nano ~/Library/LaunchAgents/com.pickly.ga4-snapshot.plist

# 登録
launchctl load ~/Library/LaunchAgents/com.pickly.ga4-snapshot.plist
```

## 5. データ確認

```bash
tail -20 data/analytics/daily.csv
```

## 6. 停止・削除

```bash
launchctl unload ~/Library/LaunchAgents/com.pickly.ga4-snapshot.plist
```

## CSV形式

| date | type | slug_or_path | offer_id | pageviews | sessions | bounce_rate | avg_session_sec | clicks |
|------|------|-------------|----------|-----------|----------|-------------|-----------------|--------|
| 2026-05-14 | pageview | best-vpn-2026 | | 42 | 38 | 0.421 | 87.3 | |
| 2026-05-14 | click | best-vpn-2026 | nordvpn-jp | | | | | 3 |
