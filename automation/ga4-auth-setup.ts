/**
 * 一回だけ実行するOAuth2認証スクリプト
 * 実行: npx tsx automation/ga4-auth-setup.ts
 * → ブラウザが開く → Googleアカウントでログイン → refresh_tokenが .secrets/ga4-token.json に保存される
 */

import { createServer } from "http";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import open from "open";

const SECRETS_PATH = resolve(import.meta.dirname, "../.secrets/oauth-client.json");
const TOKEN_PATH = resolve(import.meta.dirname, "../.secrets/ga4-token.json");

const secrets = JSON.parse(readFileSync(SECRETS_PATH, "utf-8")).installed;
const CLIENT_ID = secrets.client_id;
const CLIENT_SECRET = secrets.client_secret;
const REDIRECT_URI = "http://localhost:4242/callback";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
];

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPES.join(" "));
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

console.log("Opening browser for Google OAuth2 authentication...");
console.log("If browser does not open, visit:");
console.log(authUrl.toString());

await open(authUrl.toString());

// Local server to catch the redirect
await new Promise<void>((resolve, reject) => {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, `http://localhost:4242`);
    const code = url.searchParams.get("code");
    if (!code) {
      res.end("No code received.");
      return;
    }

    res.end("<html><body><h2>認証成功！このタブは閉じてOKです。</h2></body></html>");
    server.close();

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json() as Record<string, string>;
    if (!tokens.refresh_token) {
      console.error("No refresh_token in response:", tokens);
      reject(new Error("No refresh_token"));
      return;
    }

    writeFileSync(TOKEN_PATH, JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
    }, null, 2));

    console.log(`\n✓ Token saved to ${TOKEN_PATH}`);
    console.log("You can now run ga4-daily-snapshot.ts");
    resolve();
  });

  server.listen(4242, () => {
    console.log("Waiting for OAuth callback on http://localhost:4242/callback ...");
  });

  server.on("error", reject);
});
