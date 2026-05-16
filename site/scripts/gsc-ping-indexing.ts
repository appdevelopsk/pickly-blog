/**
 * Google Indexing API — bulk URL notify.
 *
 * Reference: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 *
 * Setup (service account, separate from GSC OAuth):
 *   1. https://console.cloud.google.com → APIs → enable "Indexing API"
 *   2. Create service account → download JSON key
 *   3. Save key as site/indexing-sa.json (gitignored)
 *   4. In Search Console: Settings → Users → Add service account email as "Owner"
 *
 * Quota: 200 URLs/day per project (default), can request quota increase.
 *
 * Usage:
 *   npx tsx scripts/gsc-ping-indexing.ts                # ping ja+en top 100 articles
 *   npx tsx scripts/gsc-ping-indexing.ts --limit 50
 *   npx tsx scripts/gsc-ping-indexing.ts --locale ja    # only Japanese URLs
 *   npx tsx scripts/gsc-ping-indexing.ts --dry-run
 *
 * State: ~/.config/pickly/indexing-pinged.json (tracks pinged URLs to avoid re-pinging)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { google } from "googleapis";

const SITE_URL = "https://pickly.blog";
const SA_PATH = path.resolve(__dirname, "../indexing-sa.json");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/indexing-pinged.json");
const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const SCOPES = ["https://www.googleapis.com/auth/indexing"];

const args = process.argv.slice(2);
const get = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const LIMIT = parseInt(get("limit") ?? "100", 10);
const LOCALE_FILTER = get("locale");
const DRY_RUN = args.includes("--dry-run");

interface State { pinged: Record<string, string> } // url → ISO timestamp

function loadState(): State {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); }
  catch { return { pinged: {} }; }
}

function saveState(s: State) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 2));
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
  if (!fs.existsSync(SA_PATH)) {
    console.error(`✗ Service account JSON not found at: ${SA_PATH}`);
    console.error(`  See setup instructions in this script's header comment.`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({ keyFile: SA_PATH, scopes: SCOPES });
  const indexing = google.indexing({ version: "v3", auth });

  const state = loadState();
  const allSlugs = listArticleSlugs();
  const allUrls = buildUrls(allSlugs);
  // Skip URLs already pinged
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
      console.error(`  ✗ ${url}: ${msg.slice(0, 100)}`);
      fail++;
      if (msg.includes("Quota exceeded") || msg.includes("quota")) {
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
