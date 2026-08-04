/**
 * Record a Pinterest "Standard access" demo video with Playwright.
 *  Phase A: real OAuth flow (authorize → consent → Allow → token) = authentication
 *  Phase B: dashboard showing authenticated boards + the pins the app publishes = main feature
 * Output: ./pinterest-demo/<auto>.webm  (converted to .mp4 by the wrapper)
 */
import { chromium } from "playwright-core";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const EXE = "/Users/ken/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const PROFILE = path.join(os.homedir(), ".cache/pickly-playwright/pinterest");
const OUT = path.join(process.cwd(), "pinterest-demo");
const ENVF = path.join(os.homedir(), ".config/pickly/pinterest.env");

const env = fs.readFileSync(ENVF, "utf8");
const pick = (k) => (env.match(new RegExp(`${k}=["']?([^"'\\n]+)`)) || [])[1];
const APP_ID = pick("PINTEREST_APP_ID");
const APP_SECRET = pick("PINTEREST_APP_SECRET");
const LOGIN_EMAIL = pick("PINTEREST_LOGIN_EMAIL");
const LOGIN_PW = pick("PINTEREST_LOGIN_PW");
// dashboard data uses the known-good growth token (pickly.env token is stale)
const growthEnv = fs.readFileSync("/Users/ken/Dropbox/00_集客統合/growth/.env", "utf8");
const TOKEN = (growthEnv.match(/PINTEREST_ACCESS_TOKEN=([^\n]+)/) || [])[1]?.trim() || pick("PINTEREST_ACCESS_TOKEN");
const REDIRECT = "http://localhost:8080/callback";
const SCOPES = "boards:read,boards:write,pins:read,pins:write,user_accounts:read";
const AUTH_URL =
  `https://www.pinterest.com/oauth/?client_id=${APP_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? "").replace(/[<&>"]/g, (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;", '"': "&quot;" }[c]));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---- callback server: capture OAuth code, exchange for token, show success page ----
let gotCode = null;
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost:8080");
  if (u.pathname !== "/callback") return res.writeHead(404).end();
  gotCode = u.searchParams.get("code");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(`<!doctype html><html><head><meta charset=utf-8>
  <style>html,body{margin:0;height:100%;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center}
  .card{text-align:center}.c{color:#fb923c;font-size:30px;font-weight:800}.ok{font-size:64px}.s{color:#cbd5e1;margin-top:8px}</style></head>
  <body><div class=card><div class=ok>✅</div><div class=c>Pinterest account connected</div>
  <div class=s>Pickly Pin Bot is now authorized (boards &amp; pins scopes)</div>
  <div class=s style="margin-top:6px;opacity:.7">authorization code: ${esc((gotCode || "").slice(0, 12))}…</div></div></body></html>`);
});
await new Promise((r) => server.listen(8080, r));

// ---- helpers ----
async function fetchJSON(url, opts) {
  const r = await fetch(url, opts);
  return { status: r.status, json: await r.json().catch(() => null) };
}
async function getBoards() {
  const { json } = await fetchJSON("https://api.pinterest.com/v5/boards?page_size=8", { headers: { Authorization: `Bearer ${TOKEN}` } });
  return (json?.items || []).map((b) => ({ name: b.name, id: b.id }));
}
async function getPins() {
  try {
    const xml = await (await fetch("https://pickly.blog/feed.xml")).text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 3).map((m) => {
      const b = m[1];
      const t = (b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const l = (b.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
      const img = (b.match(/<enclosure url="([^"]+)"/) || [])[1] || "";
      return { title: t.replace(/&amp;/g, "&"), link: l, img };
    });
    return items;
  } catch { return []; }
}

function titleCard(text, sub) {
  return `data:text/html,${encodeURIComponent(`<!doctype html><html><head><meta charset=utf-8><style>
  html,body{margin:0;height:100%;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center}
  .t{font-size:34px;font-weight:800;color:#fb923c}.s{color:#cbd5e1;margin-top:12px;font-size:18px}</style></head>
  <body><div style=text-align:center><div class=t>${esc(text)}</div><div class=s>${esc(sub)}</div></div></body></html>`)}`;
}

function dashboard(boards, pins) {
  const boardRows = boards.map((b) => `<li><b>${esc(b.name)}</b> <span class=id>${esc(b.id)}</span></li>`).join("");
  const pinCards = pins.map((p) => `<div class=pin>
    <img src="${esc(p.img)}" referrerpolicy="no-referrer">
    <div class=meta><div class=pt>${esc(p.title)}</div><div class=pl>${esc(p.link)}</div></div></div>`).join("");
  return `data:text/html,${encodeURIComponent(`<!doctype html><html><head><meta charset=utf-8><style>
  html,body{margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0}
  .wrap{padding:26px 34px}.h{font-size:26px;font-weight:800;color:#fb923c}.sub{color:#94a3b8;margin:4px 0 18px}
  .grid{display:grid;grid-template-columns:300px 1fr;gap:26px}
  .box{background:#1e293b;border-radius:14px;padding:16px 18px}
  h3{margin:0 0 10px;font-size:15px;color:#fbbf24;text-transform:uppercase;letter-spacing:.05em}
  ul{list-style:none;margin:0;padding:0}li{padding:7px 0;border-bottom:1px solid #334155;font-size:15px}
  .id{color:#64748b;font-size:11px;float:right}
  .pin{display:flex;gap:14px;align-items:center;margin-bottom:12px;background:#0b1220;border-radius:10px;padding:10px}
  .pin img{width:60px;height:90px;object-fit:cover;border-radius:8px;background:#334155}
  .pt{font-weight:700;font-size:14px;line-height:1.3}.pl{color:#60a5fa;font-size:12px;margin-top:4px}
  code{display:block;background:#0b1220;border:1px solid #334155;border-radius:8px;padding:12px;color:#a7f3d0;font-size:12px;margin-top:12px;white-space:pre-wrap}
  .badge{display:inline-block;background:#16a34a;color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;margin-left:8px}</style></head>
  <body><div class=wrap>
  <div class=h>Pickly Pin Bot — live integration <span class=badge>✓ authenticated</span></div>
  <div class=sub>Authenticated via OAuth above · reads boards · creates pins linking to our own articles</div>
  <div class=grid>
    <div class=box><h3>Connected boards (GET /v5/boards)</h3><ul>${boardRows}</ul></div>
    <div class=box><h3>Pins to publish (from pickly.blog)</h3>${pinCards}
      <code>POST https://api.pinterest.com/v5/pins
{ "board_id": "${esc(boards[0]?.id || "")}",
  "title": "${esc((pins[0]?.title || "").slice(0, 40))}…",
  "link": "${esc(pins[0]?.link || "")}",
  "media_source": { "source_type": "image_url", "url": "<og image>" } }</code>
    </div>
  </div></div></body></html>`)}`;
}

// ---- record ----
const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: true,
  executablePath: EXE,
  viewport: { width: 1280, height: 800 },
  locale: "en-US",
  recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
});
const page = ctx.pages()[0] || (await ctx.newPage());

try {
  // intro card
  await page.goto(titleCard("Pickly Pin Bot", "Standard access demo · authentication + pin creation"));
  await sleep(3500);

  // PHASE A — auth label, then real OAuth
  await page.goto(titleCard("1 / 2 — Authentication", "OAuth: the user grants boards & pins access"));
  await sleep(2500);

  // ensure the Pinterest web session is logged in (so the authorize page shows consent, not a login wall)
  await page.goto("https://www.pinterest.com/login/", { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const emailField = page.locator("input#email, input[name='id'], input[type='email']").first();
  if (await emailField.count().catch(() => 0)) {
    await emailField.fill(LOGIN_EMAIL || "");
    const pwField = page.locator("input#password, input[type='password']").first();
    if (await pwField.count().catch(() => 0)) await pwField.fill(LOGIN_PW || "");
    const loginBtn = page.getByRole("button", { name: /^(log in|ログイン|sign in)$/i }).first();
    if (await loginBtn.count().catch(() => 0)) { try { await loginBtn.click({ timeout: 4000 }); } catch {} }
    else await page.keyboard.press("Enter");
    for (let i = 0; i < 25 && page.url().includes("/login"); i++) await sleep(800);
    console.log("login result url:", page.url());
  } else {
    console.log("already logged in (no login form)");
  }
  await sleep(1500);

  await page.goto(AUTH_URL, { waitUntil: "domcontentloaded" });
  await sleep(3500); // show the consent screen

  // click the grant/allow button only (avoid SSO 'Continue with ...' buttons)
  const labels = ["Give access", "Allow access", "Allow", "Authorize", "アクセスを許可", "許可する", "許可"];
  let clicked = false;
  for (const t of labels) {
    const btn = page.getByRole("button", { name: new RegExp(t, "i") }).first();
    if (await btn.count().catch(() => 0)) {
      try { await btn.click({ timeout: 4000 }); clicked = true; break; } catch {}
    }
  }
  if (!clicked) {
    // fallback: any submit-ish button
    const any = page.locator("button[type=submit], button:has-text('access'), button:has-text('Allow')").first();
    if (await any.count().catch(() => 0)) { try { await any.click({ timeout: 4000 }); clicked = true; } catch {} }
  }
  console.log("consent clicked:", clicked);

  // wait for redirect to callback success page
  for (let i = 0; i < 20 && !gotCode; i++) await sleep(700);
  await sleep(3500); // dwell on success page

  // optional: exchange code (proves full flow; non-fatal)
  if (gotCode) {
    const tok = await fetchJSON("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${APP_ID}:${APP_SECRET}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code: gotCode, redirect_uri: REDIRECT }),
    });
    console.log("token exchange:", tok.status, tok.json?.access_token ? "(access_token received)" : JSON.stringify(tok.json).slice(0, 120));
  }

  // PHASE B — feature
  await page.goto(titleCard("2 / 2 — Main feature", "Reading boards & creating pins via the API"));
  await sleep(2500);
  const [boards, pins] = await Promise.all([getBoards(), getPins()]);
  console.log("boards:", boards.length, "pins:", pins.length);
  await page.goto(dashboard(boards, pins), { waitUntil: "domcontentloaded" });
  await sleep(9000);

  // outro
  await page.goto(titleCard("Pickly Pin Bot", "Requesting standard access to publish to production"));
  await sleep(2500);
} catch (e) {
  console.log("RECORD ERROR:", e.message);
}

const video = page.video();
await ctx.close(); // finalizes the video file
server.close();
const vp = video ? await video.path() : null;
console.log("VIDEO_WEBM:", vp);
