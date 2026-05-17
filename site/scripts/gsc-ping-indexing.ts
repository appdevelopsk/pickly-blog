/**
 * Google Indexing API — bulk URL notify.
 *
 * Uses the same OAuth2 credentials as gsc-submit.ts (gsc-credentials.json + gsc-token.json).
 * No service account needed — authenticates as the verified Search Console owner.
 *
 * Quota: 200 URLs/day per project (default).
 *
 * Usage:
 *   npx tsx scripts/gsc-ping-indexing.ts                # ping en+ja, up to 100 URLs
 *   npx tsx scripts/gsc-ping-indexing.ts --limit 200
 *   npx tsx scripts/gsc-ping-indexing.ts --locale ja    # only Japanese URLs
 *   npx tsx scripts/gsc-ping-indexing.ts --dry-run
 *   npx tsx scripts/gsc-ping-indexing.ts --reset        # clear pinged state
 *
 * State: ~/.config/pickly/indexing-pinged.json (tracks pinged URLs to avoid re-pinging)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { google } from "googleapis";

const SITE_URL = "https://pickly.blog";
const CREDENTIALS_PATH = path.resolve(__dirname, "../gsc-credentials.json");
const TOKEN_PATH = path.resolve(__dirname, "../gsc-token.json");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/indexing-pinged.json");
const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const SCOPES = [
  "https://www.googleapis.com/auth/indexing",
  "https://www.googleapis.com/auth/webmasters",
];

const args = process.argv.slice(2);
const get = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const LIMIT = parseInt(get("limit") ?? "100", 10);
const LOCALE_FILTER = get("locale");
const DRY_RUN = args.includes("--dry-run");
const RESET = args.includes("--reset");

interface State { pinged: Record<string, string> }

function loadState(): State {
  if (RESET) return { pinged: {} };
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); }
  catch { return { pinged: {} }; }
}

function saveState(s: State) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 2));
}

async function getAuthClient() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3456");

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    // Refresh if needed — googleapis handles this automatically on API calls
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES, prompt: "consent" });
  console.log("\nブラウザで認証してください:\n");
  console.log(authUrl);

  const code = await new Promise<string>((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost:3456");
      const c = url.searchParams.get("code");
      if (c) {
        res.end("認証成功。ターミナルに戻ってください。");
        server.close();
        resolve(c);
      }
    });
    server.listen(3456);
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  return oAuth2Client;
}

function listArticleSlugs(): string[] {
  return fs.readdirSync(ARTICLES_DIR)
    .filter((s) => fs.existsSync(path.join(ARTICLES_DIR, s, "meta.ts")))
    .sort();
}

function buildUrls(slugs: string[]): string[] {
  const locales = LOCALE_FILTER ? [LOCALE_FILTER] : ["en", "ja"];
  const urls: string[] = [];
  for (const slug of slugs) {
    for (const locale of locales) {
      urls.push(`${SITE_URL}/${locale}/articles/${slug}/`);
    }
  }
  return urls;
}

async function main() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`✗ OAuth credentials not found at: ${CREDENTIALS_PATH}`);
    console.error(`  Run gsc-submit.ts first to set up OAuth credentials.`);
    process.exit(1);
  }

  const auth = await getAuthClient();
  const indexing = google.indexing({ version: "v3", auth });

  const state = loadState();
  const allSlugs = listArticleSlugs();
  const allUrls = buildUrls(allSlugs);
  const candidates = allUrls.filter((u) => !state.pinged[u]).slice(0, LIMIT);

  console.log(`Total articles: ${allSlugs.length}`);
  console.log(`Total URLs (after locale filter): ${allUrls.length}`);
  console.log(`Already pinged: ${Object.keys(state.pinged).length}`);
  console.log(`Will ping now: ${candidates.length}\n`);

  if (DRY_RUN) {
    console.log("Dry-run — would ping:");
    for (const u of candidates.slice(0, 20)) console.log(`  ${u}`);
    if (candidates.length > 20) console.log(`  ... and ${candidates.length - 20} more`);
    return;
  }

  let ok = 0, fail = 0;
  for (const url of candidates) {
    try {
      await indexing.urlNotifications.publish({
        requestBody: { url, type: "URL_UPDATED" },
      });
      state.pinged[url] = new Date().toISOString();
      ok++;
      if (ok % 10 === 0) {
        saveState(state);
        console.log(`  ✓ ${ok}/${candidates.length} (saved checkpoint)`);
      }
    } catch (e: any) {
      const msg = e?.errors?.[0]?.message ?? e?.message ?? String(e);
      console.error(`  ✗ ${url}: ${msg.slice(0, 120)}`);
      fail++;
      if (msg.toLowerCase().includes("quota")) {
        console.error("  ⚠ Quota exceeded — stopping. Resume tomorrow.");
        break;
      }
    }
  }

  saveState(state);
  console.log(`\n完了: ✓ ${ok} / ✗ ${fail}`);
  console.log(`累計 pinged: ${Object.keys(state.pinged).length} / ${allUrls.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
