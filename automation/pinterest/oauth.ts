/**
 * Pinterest OAuth: 永続セッションで auth URL を開いて、token を取得 → env保存
 *
 * Usage: npx tsx pinterest/oauth.ts
 *
 * 動作:
 *  1. localhost:8080 で callback サーバー起動
 *  2. Pinterest auth URL を Chromium で開く(既ログイン状態)
 *  3. ユーザーが「Approve」クリック
 *  4. callback で code 取得 → Pinterest API で token 交換
 *  5. ~/.config/pickly/pinterest.env に access_token + refresh_token 保存
 */
import http from "node:http";
import { URL } from "node:url";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { launch, ensureLoggedIn } from "./_browser";

const CREDS_FILE = path.join(os.homedir(), ".config/pickly/pinterest.env");

async function main() {
  const APP_ID = process.env.PINTEREST_APP_ID;
  const APP_SECRET = process.env.PINTEREST_APP_SECRET;
  if (!APP_ID || !APP_SECRET) {
    console.error("PINTEREST_APP_ID と PINTEREST_APP_SECRET が必要");
    process.exit(1);
  }

  const REDIRECT = "http://localhost:8080/callback";
  const SCOPES = "boards:read,boards:write,pins:read,pins:write,user_accounts:read";

  // 1. Callback server
  const tokenPromise = new Promise<{ access_token: string; refresh_token?: string }>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost:8080");
      if (url.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      if (error) {
        res.writeHead(400, { "Content-Type": "text/plain" }).end(`Error: ${error}`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }
      if (!code) {
        res.writeHead(400).end("missing code");
        return;
      }

      console.log(`✓ Authorization code 受領 (${code.slice(0, 10)}...)`);

      try {
        const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(`${APP_ID}:${APP_SECRET}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT,
          }),
        });
        const data = (await tokenRes.json()) as { access_token?: string; refresh_token?: string; error?: string };
        if (!tokenRes.ok || data.error || !data.access_token) {
          res.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify(data));
          server.close();
          reject(new Error(`Token exchange failed: ${JSON.stringify(data)}`));
          return;
        }
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("✓ Token 取得完了。ターミナルに戻ってください。\n");
        server.close();
        resolve({ access_token: data.access_token, refresh_token: data.refresh_token });
      } catch (e) {
        console.error("token exchange error:", e);
        res.writeHead(500).end(String(e));
        server.close();
        reject(e as Error);
      }
    });
    server.listen(8080, () => console.log("→ Callback server listening on http://localhost:8080/callback"));
  });

  // 2. Browser に auth URL を開く
  const authUrl =
    `https://www.pinterest.com/oauth/?client_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
    `&response_type=code&scope=${encodeURIComponent(SCOPES)}`;
  console.log("→ Auth URL:", authUrl);

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  console.log("→ OAuth 同意画面を開きます。Chromium で「Approve」ボタンをクリックしてください");
  await page.goto(authUrl, { waitUntil: "domcontentloaded" });

  // 自動で Approve を試みる(同意画面で「Authorize」「Approve」「Continue」ボタン)
  await page.waitForTimeout(3000);
  const approveBtn = page
    .locator("button:has-text('Give access'), button:has-text('Authorize'), button:has-text('Approve'), button:has-text('Continue'), button:has-text('許可'), button:has-text('連携')")
    .first();
  if ((await approveBtn.count()) > 0) {
    console.log("→ Approve ボタン自動クリック");
    await approveBtn.click().catch(() => {});
  } else {
    console.log("→ Approve ボタン未検出。手動でクリックしてください");
  }

  // 3. token 取得待機
  console.log("→ token 取得待機中...");
  const tokens = await Promise.race([
    tokenPromise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout (5min)")), 300000)),
  ]);

  await context.close();

  // 4. .env 保存
  let existing = "";
  try { existing = await fs.readFile(CREDS_FILE, "utf8"); } catch {}
  const filtered = existing
    .split("\n")
    .filter((l) => !l.startsWith("export PINTEREST_ACCESS_TOKEN") && !l.startsWith("export PINTEREST_REFRESH_TOKEN"))
    .join("\n")
    .replace(/\n+$/, "");
  const newContent =
    `${filtered}\nexport PINTEREST_ACCESS_TOKEN="${tokens.access_token}"\n` +
    (tokens.refresh_token ? `export PINTEREST_REFRESH_TOKEN="${tokens.refresh_token}"\n` : "");
  await fs.writeFile(CREDS_FILE, newContent, { mode: 0o600 });

  console.log("\n✓ Token 保存完了");
  console.log(`  access_token: ${tokens.access_token.slice(0, 20)}...`);
  if (tokens.refresh_token) console.log(`  refresh_token: ${tokens.refresh_token.slice(0, 20)}...`);
  console.log(`\n→ ${CREDS_FILE} に保存`);
  console.log("\nテスト: cd /Users/ken/Dropbox/affiliate_factory/automation && set -a; source ~/.config/pickly/pinterest.env; set +a; npm run boards");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
