#!/usr/bin/env bash
# =============================================================================
# ⚠️ 非推奨 — このスクリプトは本番に反映されません (2026-07-31 確認)
# =============================================================================
# pickly.blog の本番は **Cloudflare Pages** (project: pickly-blog / production
# branch: main / build: `cd site && npm install && npm run build`)。
# デプロイは **`git push origin main`** だけで、Pages が自動ビルドする。
#
# 実測: VPS の /var/www/pickly.blog/ に置いたファイルはオリジン直叩きでは 200 を
# 返すが、pickly.blog(=Cloudflare) 経由では 404。つまり CDN はこの VPS を見て
# いない。ここへ rsync しても本番は 1 バイトも変わらない。
#
# しかも `rsync --delete` の除外は .DS_Store だけなので、実行すると VPS 上の
# OG 画像 18,498 件が消える (OG は R2 配信・out/og は .gitignore 済みのため
# ローカルビルドに含まれない)。**実行しないこと。**
#
# 残してある理由: VPS 構成へ戻す判断をした場合の出発点として。その時は
# --exclude='og/' の追加を検討すること。
# =============================================================================
# Pickly.blog - Local build + rsync deploy to XServer VPS (レガシー)
# =============================================================================
# Prerequisites:
#   - SSH config for "pickly-vps" set up in ~/.ssh/config (see DEPLOY.md)
#   - VPS has /var/www/pickly.blog/ created and owned by deploy user
#   - Cloudflare API token in ~/.cloudflare-token (optional, for cache purge)
# Usage:
#   ./deploy/deploy.sh           # full build + deploy + cache purge
#   ./deploy/deploy.sh --dry     # rsync dry-run (no upload)
#   ./deploy/deploy.sh --no-build  # skip build, just sync existing out/
# =============================================================================
set -euo pipefail

# 誤爆防止。本番は Cloudflare Pages なので、このスクリプトは通常使わない。
if [[ "${PICKLY_ALLOW_VPS_DEPLOY:-}" != "1" ]]; then
  cat >&2 <<'WARN'
⚠️  停止しました: このスクリプトは本番(pickly.blog)に反映されません。

  本番は Cloudflare Pages です。デプロイは:
      git push origin main

  それでも VPS へ rsync したい場合のみ:
      PICKLY_ALLOW_VPS_DEPLOY=1 ./deploy/deploy.sh
  (--delete で VPS 上の OG 画像 18,498 件が消えます。--exclude='og/' を検討)
WARN
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/site"
SSH_HOST="${PICKLY_VPS_HOST:-pickly-vps}"
REMOTE_PATH="${PICKLY_REMOTE_PATH:-/var/www/pickly.blog}"
CF_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
CF_TOKEN_FILE="${CLOUDFLARE_TOKEN_FILE:-$HOME/.cloudflare-token}"

DRY_RUN=""
SKIP_BUILD=""

for arg in "$@"; do
  case "$arg" in
    --dry) DRY_RUN="--dry-run" ;;
    --no-build) SKIP_BUILD=1 ;;
    *) echo "Unknown arg: $arg"; exit 2 ;;
  esac
done

echo "→ deploy target: $SSH_HOST:$REMOTE_PATH"

# 1. Build (順序重要: og:generate → build → og:generate が public/og/ を out/ にコピー)
if [[ -z "$SKIP_BUILD" ]]; then
  echo "→ npm run validate"
  (cd "$SITE" && npm run validate)
  echo "→ npm run og:generate (PNG画像生成、public/og/)"
  (cd "$SITE" && npm run og:generate)
  echo "→ npm run build (Next.js Static Export、public/ を out/ にコピー)"
  (cd "$SITE" && rm -rf .next out && npm run build)
fi

OUT="$SITE/out"
if [[ ! -d "$OUT" ]]; then
  echo "✗ $OUT not found — run npm run build first"; exit 1
fi

# 2. Sync
echo "→ rsync $OUT/ → $SSH_HOST:$REMOTE_PATH/"
# macOS BSD rsync は --chmod 非対応のため、ローカルで一括 chmod してから rsync する。
find "$OUT" -type d -exec chmod 755 {} \;
find "$OUT" -type f -exec chmod 644 {} \;
rsync -avz --delete $DRY_RUN \
  --exclude='.DS_Store' \
  "$OUT/" "$SSH_HOST:$REMOTE_PATH/"

if [[ -n "$DRY_RUN" ]]; then
  echo "(dry-run, no upload performed)"
  exit 0
fi

# 3. Reload nginx (only needed if config changed; safe to skip otherwise)
# ssh "$SSH_HOST" "sudo systemctl reload nginx" || true

# 4. Purge Cloudflare cache (optional)
if [[ -n "$CF_ZONE_ID" && -f "$CF_TOKEN_FILE" ]]; then
  echo "→ purging Cloudflare cache for zone $CF_ZONE_ID"
  CF_TOKEN="$(cat "$CF_TOKEN_FILE")"
  curl -sX POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}' | grep -o '"success":[^,]*' || true
else
  echo "(skipping CF cache purge — set CLOUDFLARE_ZONE_ID + put token in $CF_TOKEN_FILE to enable)"
fi

echo "✓ deploy complete → https://pickly.blog/"
