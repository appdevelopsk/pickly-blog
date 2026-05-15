/**
 * Twitter/X pin poster — pins.yaml → tweet with OG image.
 *
 * Auth: OAuth 1.0a (User context — posting requires user credentials)
 * Setup:
 *   1. https://developer.twitter.com/en/apps → Create app (Free tier OK)
 *   2. Settings → User authentication → Read and Write
 *   3. Keys and Tokens → generate Access Token & Secret
 *   4. Add to ~/.config/pickly/twitter.env:
 *        TWITTER_API_KEY=...
 *        TWITTER_API_SECRET=...
 *        TWITTER_ACCESS_TOKEN=...
 *        TWITTER_ACCESS_TOKEN_SECRET=...
 *
 * Rate limits (Free tier): 17 tweets/day, 50 tweets/month
 * Rate limits (Basic $100/mo): 100 tweets/day
 *
 * Usage:
 *   npm run twitter:post
 *   npm run twitter:post -- --limit 5 --locale en
 *   npm run twitter:post -- --dry-run
 *
 * State: ~/.config/pickly/twitter-posted.json
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PINS_PATH = path.resolve(__dirname, "../../pinterest/pins.yaml");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/twitter-posted.json");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/twitter.env");
const SLEEP_MS = 60_000; // Twitter rate limits are strict
const SITE_URL = "https://pickly.blog";

// ── Credentials ──────────────────────────────────────────────────────────────

function loadCreds() {
  const env: Record<string, string> = {};
  if (fs.existsSync(CREDS_FILE)) {
    for (const line of fs.readFileSync(CREDS_FILE, "utf8").split("\n")) {
      const m = line.match(/^(?:export\s+)?(\w+)=["']?([^"'\n]+)["']?/);
      if (m) env[m[1]] = m[2];
    }
  }
  return {
    apiKey:            process.env.TWITTER_API_KEY            ?? env.TWITTER_API_KEY            ?? "",
    apiSecret:         process.env.TWITTER_API_SECRET         ?? env.TWITTER_API_SECRET         ?? "",
    accessToken:       process.env.TWITTER_ACCESS_TOKEN       ?? env.TWITTER_ACCESS_TOKEN       ?? "",
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? env.TWITTER_ACCESS_TOKEN_SECRET ?? "",
  };
}

// ── OAuth 1.0a signer ─────────────────────────────────────────────────────────

function pct(s: string) { return encodeURIComponent(s); }

function oauthSign(
  method: string, url: string, params: Record<string, string>,
  creds: ReturnType<typeof loadCreds>
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key:     creds.apiKey,
    oauth_nonce:            crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        String(Math.floor(Date.now() / 1000)),
    oauth_token:            creds.accessToken,
    oauth_version:          "1.0",
  };
  const all = { ...params, ...oauthParams };
  const base =
    method.toUpperCase() + "&" + pct(url) + "&" +
    pct(Object.keys(all).sort().map((k) => `${pct(k)}=${pct(all[k])}`).join("&"));
  const signingKey = `${pct(creds.apiSecret)}&${pct(creds.accessTokenSecret)}`;
  const sig = crypto.createHmac("sha1", signingKey).update(base).digest("base64");
  return "OAuth " +
    Object.entries({ ...oauthParams, oauth_signature: sig })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${pct(k)}="${pct(v)}"`)
      .join(", ");
}

async function apiCall(
  method: string, url: string, body: unknown,
  creds: ReturnType<typeof loadCreds>,
  isMultipart = false
): Promise<unknown> {
  const authHeader = oauthSign(method, url, {}, creds);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader,
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    },
    body: isMultipart
      ? (body as FormData)
      : (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Twitter ${res.status} ${url}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

// ── Media upload (v1.1) ───────────────────────────────────────────────────────

async function uploadMediaFromUrl(imageUrl: string, creds: ReturnType<typeof loadCreds>): Promise<string | null> {
  // Fetch image bytes
  let buf: Buffer;
  try {
    const r = await fetch(imageUrl);
    if (!r.ok) return null;
    buf = Buffer.from(await r.arrayBuffer());
  } catch { return null; }

  const form = new FormData();
  form.append("media_data", buf.toString("base64"));

  const url = "https://upload.twitter.com/1.1/media/upload.json";
  const authHeader = oauthSign("POST", url, {}, creds);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader },
    body: form,
  });
  const data = await res.json() as Record<string, unknown>;
  return (data.media_id_string as string) ?? null;
}

// ── Tweet composition ─────────────────────────────────────────────────────────

function composeTweet(pin: { title: string; description: string; link: string; hashtags?: string[] }): string {
  const tags = (pin.hashtags ?? []).slice(0, 5).join(" ");
  // Twitter counts URLs as 23 chars regardless of length
  const urlLen = 24;
  const tagsLen = tags.length;
  const maxText = 280 - urlLen - tagsLen - 4; // 4 = spacing

  let text = pin.title;
  if (text.length > maxText) {
    text = text.slice(0, maxText - 1) + "…";
  }

  const parts = [text, pin.link];
  if (tags) parts.push(tags);
  return parts.join("\n\n");
}

// ── State ─────────────────────────────────────────────────────────────────────

function loadPosted(): Set<string> {
  try { return new Set((JSON.parse(fs.readFileSync(STATE_PATH, "utf8")).posted ?? [])); }
  catch { return new Set(); }
}

function markPosted(id: string) {
  const posted = loadPosted();
  posted.add(id);
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify({ posted: [...posted] }, null, 2));
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Pin {
  pin_id: string; article_slug?: string; locale: string; variant: string;
  title: string; description: string; link: string; hashtags?: string[];
}

async function main() {
  const args = process.argv.slice(2);
  const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const limit = parseInt(get("--limit") ?? "3", 10);
  const localeFilter = get("--locale") ?? "en"; // default en (Twitter is mostly English)
  const dryRun = args.includes("--dry-run");

  const creds = loadCreds();
  if (!dryRun && (!creds.apiKey || !creds.accessToken)) {
    console.error(`✗ 認証情報が見つかりません。${CREDS_FILE} を作成してください。`);
    console.error("  必要な変数: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET");
    process.exit(1);
  }

  const raw = fs.readFileSync(PINS_PATH, "utf8");
  const { pins: allPins } = yaml.load(raw) as { pins: Pin[] };
  const posted = loadPosted();

  let pins = allPins.filter((p) => !posted.has(p.pin_id));
  if (localeFilter) pins = pins.filter((p) => p.locale === localeFilter);
  const targets = pins.slice(0, limit);
  console.log(`→ Twitter 投稿対象: ${targets.length} 件 (locale=${localeFilter}, 残り${pins.length}件)`);

  let ok = 0, fail = 0;

  for (const pin of targets) {
    const slug = pin.article_slug ?? ((pin.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? pin.pin_id;
    const imageUrl = `${SITE_URL}/og/${slug}-${pin.locale}.png`;
    const articleUrl = pin.link.startsWith("http") ? pin.link : `${SITE_URL}${pin.link}`;
    const tweetText = composeTweet({ ...pin, link: articleUrl });

    if (dryRun) {
      console.log(`\n[${pin.pin_id}]\n${tweetText}\nimage: ${imageUrl}`);
      continue;
    }

    try {
      // 画像アップロード
      const mediaId = await uploadMediaFromUrl(imageUrl, creds);
      const body: Record<string, unknown> = { text: tweetText };
      if (mediaId) body.media = { media_ids: [mediaId] };

      await apiCall("POST", "https://api.twitter.com/2/tweets", body, creds);
      markPosted(pin.pin_id);
      console.log(`✓ ${pin.pin_id}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${pin.pin_id}:`, (err as Error).message?.slice(0, 150));
      fail++;
    }

    if (targets.indexOf(pin) < targets.length - 1) {
      console.log(`  ⏱ ${SLEEP_MS / 1000}s 待機...`);
      await new Promise((r) => setTimeout(r, SLEEP_MS));
    }
  }

  console.log(`\n完了: ✓${ok} ✗${fail} | 累計: ${loadPosted().size}件`);
}

main().catch((e) => { console.error(e); process.exit(1); });
