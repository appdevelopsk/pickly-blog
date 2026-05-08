#!/usr/bin/env bash
# =============================================================================
# Pickly.blog - Local build + rsync deploy to XServer VPS
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
