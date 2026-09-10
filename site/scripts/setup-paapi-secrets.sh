#!/usr/bin/env bash
# PA-API の資格情報を GitHub Secrets に登録する。
#
# 楽天/Yahoo/ValueCommerce の6件は 2026-09-09 に登録済み。
# 残るのは PA-API の3件だけで、これは Amazon アソシエイトの
# アカウント作業（鍵の発行）が先に必要なため自動化できない。
#
# 鍵の取り方:
#   https://affiliate.amazon.co.jp/assoc_credentials/home
#   「認証情報を管理」→「認証情報を追加」でアクセスキーとシークレットを発行。
#   シークレットは発行時にしか表示されないので必ず控えること。
#
# 使い方:
#   PAAPI_ACCESS_KEY=xxx PAAPI_SECRET_KEY=yyy ./scripts/setup-paapi-secrets.sh
set -euo pipefail

: "${PAAPI_ACCESS_KEY:?PAAPI_ACCESS_KEY を環境変数で渡してください}"
: "${PAAPI_SECRET_KEY:?PAAPI_SECRET_KEY を環境変数で渡してください}"
PARTNER_TAG="${PAAPI_PARTNER_TAG:-pickly-22}"

cd "$(dirname "$0")/../.."

for pair in \
  "PAAPI_ACCESS_KEY:$PAAPI_ACCESS_KEY" \
  "PAAPI_SECRET_KEY:$PAAPI_SECRET_KEY" \
  "PAAPI_PARTNER_TAG:$PARTNER_TAG"
do
  name="${pair%%:*}"
  value="${pair#*:}"
  printf '%s' "$value" | gh secret set "$name" --body -
  echo "登録: $name (${#value}文字)"
done

echo
echo "登録後の確認:"
echo "  gh workflow run prices.yml -f job=daily"
echo "  gh run watch"
echo
echo "注意: PA-API は売上要件（直近30日に10件以上の適格売上）を満たさないと"
echo "      AccessDenied で価格が取れません。その場合も既存価格は保持され、"
echo "      UI は日付なしで従来通り表示されます（壊れません）。"
