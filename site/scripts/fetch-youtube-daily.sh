#!/bin/zsh
# pickly レビュー動画の言語別キャッシュを毎日1言語ぶん埋める（2026-08-12）。
#
# なぜ:
#   動画キャッシュは長く ja / en の2本しか無く、de/fr/es/ko/zh… の読者にも
#   英語動画が出ていた（本文と動画の言語が不一致）。言語別キャッシュに分けたが、
#   YouTube Data API は search=100units・1日10,000units = **1日約100検索**。
#   対象は 3,700 商品 × 16 言語なので一度には埋まらない。
#   → GA4実流入の多い記事の商品順(youtube-priority-ids.txt)に、1日1言語ずつ進める。
#     この並びは build-youtube-priority.ts が作る。当初は「掲載記事数の多い商品順」
#     だったが、ほぼ全商品が1記事にしか出ないため実質ランダムで、上位300件でも
#     全体の9%しか覆えなかった（実流入順にして31%）。
#   未取得ぶんはサイト側で en にフォールバックするので、途中でも表示は壊れない。
#
# 言語の順番（2026-08-12 GA4実測で組み直し）:
#   「閲覧シェア × 未取得率」の大きい順。当初は中国語圏を先頭にしていたが、
#   実測では en が 46.8% と半分近くを占め、zh-TW は 2.2% で最下位に近かった。
#   さらに en は巡回対象にすら入っておらず、上位1000商品の en 充足率は 58% だった。
#   ja は他言語へフォールバックしない設計なので、充足率38%＝日本語読者は上位でも
#   6割で動画が出ない。en の次に置く。
# 日替わりで巡回し、各言語の未取得ぶんが尽きたら次の言語へ自動で送る。

set -euo pipefail

SITE=/Users/ken/pickly-blog/site
KEY_UID=94ff31e3-4b07-4a34-8381-346ef363af19
KEY_PROJECT=pickly-496207
LIMIT=${LIMIT:-90}   # 1日のクォータ(約100検索)に対する安全域

cd "$SITE"

export PATH="/Users/ken/.nvm/versions/node/v20.19.5/bin:/opt/homebrew/bin:/usr/bin:/bin"
export YOUTUBE_API_KEY="$(gcloud services api-keys get-key-string "$KEY_UID" \
  --project="$KEY_PROJECT" --format='value(keyString)')"
if [[ -z "$YOUTUBE_API_KEY" ]]; then
  echo "$(date '+%F %T') 鍵を取得できず中止（gcloud の認証を確認）" >&2
  exit 1
fi

LANGS=(en ja fr de es it id pt-BR ko ru vi ar zh-CN zh-TW th hi tr)

# 未取得が残っている最初の言語を選ぶ（尽きた言語は飛ばす）。
TARGET=""
for L in $LANGS; do
  REMAIN=$(npx tsx scripts/youtube-remaining.ts "$L")
  if [[ "$REMAIN" -gt 0 ]]; then TARGET="$L"; break; fi
done
if [[ -z "$TARGET" ]]; then
  echo "$(date '+%F %T') 全言語とも優先リストぶんは取得済み。何もしない。"
  exit 0
fi

echo "$(date '+%F %T') --lang $TARGET を最大 $LIMIT 件"
npx tsx scripts/fetch-youtube.ts --lang "$TARGET" \
  --ids-file scripts/youtube-priority-ids.txt --limit "$LIMIT"

# キャッシュ差分だけを commit する（本番反映は git push → Pages）。
# ja だけ歴史的にサフィックス無し（fetch-youtube.ts の cachePath と同じ規則）。
if [[ "$TARGET" == "ja" ]]; then
  CACHE="src/lib/affiliates/youtube-cache.json"
else
  CACHE="src/lib/affiliates/youtube-cache-$TARGET.json"
fi
cd /Users/ken/pickly-blog
if ! git diff --quiet -- "site/$CACHE"; then
  git add "site/$CACHE"
  git commit -q -m "data(youtube): $TARGET のレビュー動画キャッシュを追補（日次）"
  git push -q origin main
  echo "$(date '+%F %T') push 済み: $CACHE"
else
  echo "$(date '+%F %T') 差分なし"
fi
