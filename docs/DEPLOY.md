# Pickly.blog デプロイ手順

XServer VPS (210.131.218.20) に静的ファイル配信、前段に Cloudflare CDN を配置するハイブリッド構成。

---

## アーキテクチャ

```
読者 (世界中、Pinterest流入)
   ↓
Cloudflare Edge (310+ 拠点でキャッシュ、無料プラン)
   ↓
XServer VPS nginx (210.131.218.20)
   ├─ api.30sec-challenge.com  (既存・Node.js backend)
   └─ pickly.blog              (新規・静的ファイル) ← /var/www/pickly.blog/
```

## 初期セットアップ (一度だけ)

### 1. Cloudflare サイト追加

1. https://dash.cloudflare.com で `pickly.blog` を Add site (Free plan)
2. 表示された 2つの NS をメモ (例: `ada.ns.cloudflare.com` `bob.ns.cloudflare.com`)
3. XServerドメイン管理画面 → ネームサーバー設定 → 上記2つに変更
4. 反映待ち (10分〜2時間)
5. Cloudflare DNS タブで以下を追加:
   - **A  pickly.blog → 210.131.218.20 (Proxied=オレンジ雲)**
   - **CNAME www → pickly.blog (Proxied)**
6. SSL/TLS タブ → Encryption mode → **Full (strict)** に設定 (Let's Encrypt 取得後)
   - 暫定: **Flexible** にしておけば SSL なしで動作確認可

### 2. VPS 側 (SSH ログイン後)

```bash
# nginx vhost
sudo mkdir -p /var/www/pickly.blog
sudo chown -R $USER:$USER /var/www/pickly.blog
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/pickly.blog  # deploy/nginx.conf を /tmp に scp してから
sudo ln -s /etc/nginx/sites-available/pickly.blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Let's Encrypt
sudo certbot --nginx -d pickly.blog -d www.pickly.blog \
  --redirect --non-interactive --agree-tos -m contact@pickly.blog

# 自動更新確認
sudo certbot renew --dry-run
```

### 3. ローカル SSH 設定

`~/.ssh/config` に追記:

```
Host pickly-vps
  HostName 210.131.218.20
  User root        # or 専用 deploy ユーザー作成推奨
  IdentityFile ~/Downloads/xserver-vps-key.pem
  Port 22
```

接続確認: `ssh pickly-vps "echo ok"`

### 4. Cloudflare API トークン (任意・キャッシュ自動パージ用)

1. Cloudflare ダッシュボード右上 → My Profile → API Tokens
2. Create Token → Custom Token
3. Permission: Zone → Cache Purge → Purge
4. Zone Resources: Include → Specific zone → pickly.blog
5. 生成されたトークンを `~/.cloudflare-token` に保存 (`chmod 600`)
6. `pickly.blog` の Zone ID をコピー (Overview ページ右下) し、シェル環境変数に:
   ```bash
   echo 'export CLOUDFLARE_ZONE_ID=xxxxx' >> ~/.zshrc
   ```

## 通常のデプロイ

```bash
cd /Users/ken/Dropbox/affiliate_factory
./deploy/deploy.sh
```

実行内容:
1. `cd site && npm run validate` (型・i18n・affiliate audit)
2. `npm run build` (Static Export → `site/out/`)
3. `npm run og:generate` (Pinterest用OG画像生成)
4. `rsync site/out/ → pickly-vps:/var/www/pickly.blog/`
5. Cloudflare Cache Purge API 叩く (CF_ZONE_ID + token あれば)

オプション:
- `--dry` : rsync ドライラン (差分確認)
- `--no-build` : ビルドスキップ、`out/` の現状を rsync のみ

## 動作確認

```bash
curl -I https://pickly.blog/en/                  # → 200 OK
curl https://pickly.blog/en/articles/best-vpn-2026/ | grep -oE '<h1[^>]*>[^<]*</h1>'
```

## デプロイ後チェック

- [ ] https://pickly.blog/ → /en/ にリダイレクト (`_redirects` 効いてる)
- [ ] https://pickly.blog/en/ 200、ヒーロー文表示
- [ ] https://pickly.blog/ja/articles/best-vpn-2026/ 200、日本語タイトル
- [ ] https://pickly.blog/og/best-vpn-2026-en.svg 200、画像表示
- [ ] HTTPS 証明書有効 (curl -v で SSL 確認)
- [ ] Cloudflare ヘッダー (`cf-cache-status: HIT/MISS/DYNAMIC`) 返却
- [ ] Lighthouse モバイル 90+ (Performance/SEO/Accessibility)

## 障害時の切り戻し

```bash
ssh pickly-vps "ls -la /var/www/pickly.blog.bak.*"   # 過去バックアップあれば
ssh pickly-vps "cp -r /var/www/pickly.blog.bak.YYYY-MM-DD /var/www/pickly.blog"
ssh pickly-vps "sudo systemctl reload nginx"
```

または `git revert HEAD && ./deploy/deploy.sh`。

## SSL 関連トラブル

- **証明書取得失敗**: `:80` で `/.well-known/acme-challenge/` にアクセス可能か確認 (Cloudflare Proxied がブロックしてる可能性 → 取得時のみ DNS Only=灰色雲 に変更)
- **Cloudflare Full(strict) でエラー522/525**: VPS側証明書が無効。`certbot --nginx -d pickly.blog` 再実行
- **HSTS preload に登録したい**: 安定運用後に https://hstspreload.org で申請

## 容量目安

- 静的サイト 17 locale × 54 ページ × 平均30KB = 約 30MB
- OG画像 17 SVG × 平均5KB = 約100KB
- 合計 30MB 程度 → VPS 50GB SSD の 0.06% 消費。問題なし。
