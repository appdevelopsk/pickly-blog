/**
 * One-time Pinterest OAuth helper.
 *
 * 1. Create app at https://developers.pinterest.com/apps/
 * 2. Set redirect URI to http://localhost:8080/callback
 * 3. Set PINTEREST_APP_ID and PINTEREST_APP_SECRET in .env
 * 4. Run `npm run auth`. Browser opens, you approve, terminal prints access token.
 * 5. Paste into PINTEREST_ACCESS_TOKEN in .env
 *
 * Tokens are valid 30 days; refresh tokens valid 1 year. Refresh logic added later if needed.
 */
import http from "node:http";
import { URL } from "node:url";

const APP_ID = process.env.PINTEREST_APP_ID;
const APP_SECRET = process.env.PINTEREST_APP_SECRET;
const REDIRECT = "http://localhost:8080/callback";
const SCOPES = "boards:read,boards:write,pins:read,pins:write";

if (!APP_ID || !APP_SECRET) {
  console.error("Set PINTEREST_APP_ID and PINTEREST_APP_SECRET in .env");
  process.exit(1);
}

const authUrl =
  `https://www.pinterest.com/oauth/?client_id=${APP_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}` +
  `&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

console.log("Open in browser:");
console.log(authUrl);
console.log("\nWaiting on http://localhost:8080/callback ...");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost:8080");
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("missing code");
    return;
  }

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
  const data = (await tokenRes.json()) as Record<string, unknown>;

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Done — check terminal for token.\n");

  console.log("\n=== Pinterest tokens ===");
  console.log(JSON.stringify(data, null, 2));
  console.log("\nAdd to .env:");
  console.log(`PINTEREST_ACCESS_TOKEN=${data.access_token ?? ""}`);
  console.log(`PINTEREST_REFRESH_TOKEN=${data.refresh_token ?? ""}`);
  process.exit(0);
});

server.listen(8080);
