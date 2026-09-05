#!/bin/zsh
# pickly の価格履歴（price-history.json）を毎日1点ぶん追記する（2026-09-05）。
#
# なぜ:
#   商品カードの「値下げバッジ」を出すには、その日の価格だけでなく過去の価格が要る。
#   ところが楽天/Yahoo のアフィリエイトキャッシュ（rakuten-cache.json /
#   yahoo-cache.json）は**現在値しか持たない**（上書き更新なので履歴が残らない）。
#   → snapshot-prices.ts が毎日その2キャッシュを読み、offer id ごとに
#     {"d":"YYYY-MM-DD","r":<楽天円>,"y":<Yahoo円>} を price-history.json へ積む。
#   同じ日付の点は冪等に上書きされ、直近 KEEP=14 点だけ残す設計なので、
#   多重起動や当日の再実行をしても履歴は壊れない。
#
# 時刻: 19:00 JST。他の pickly 系 launchd（5:30/8:00/8:20/9:00/9:30/11:10/11:20/17:30）
#       と衝突せず、JST の日付境界からも十分離れている。
#
# 注意: 楽天/Yahoo のキャッシュ自体はこのジョブでは更新しない（全件リフレッシュは
#       3.5時間かかる別作業）。このジョブは「その時点のキャッシュ値を日次で記録する」だけ。

set -euo pipefail

SITE=/Users/ken/pickly-blog/site
HISTORY=site/src/lib/affiliates/price-history.json

export PATH="/Users/ken/.nvm/versions/node/v20.19.5/bin:/opt/homebrew/bin:/usr/bin:/bin"

cd "$SITE"

# npx tsx は Next.js と違い .env.local を自動で読まない。
set -a
. ./.env.local
set +a

echo "$(date '+%F %T') snapshot-prices を実行"
npx tsx scripts/snapshot-prices.ts

# 履歴の差分だけを commit する（本番反映は git push → Pages）。
cd /Users/ken/pickly-blog
if ! git diff --quiet -- "$HISTORY"; then
  git add "$HISTORY"
  git commit -q -o "$HISTORY" -m "data(price): 価格履歴を1点追記（日次）"
  git push -q origin main
  echo "$(date '+%F %T') push 済み: $HISTORY"
else
  echo "$(date '+%F %T') 差分なし"
fi
