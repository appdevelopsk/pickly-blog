/**
 * IndexNow bulk URL submission — Bing / Yandex / other engines.
 *
 * IndexNow is a protocol supported by Bing, Yandex, Seznam, Naver, etc.
 * One submission notifies all participating engines simultaneously.
 *
 * Setup (one-time):
 *   1. Key file already deployed: https://pickly.blog/505118c2333ec1cbddc87177c90a0dce.txt
 *   2. Run this script after any new pages are published.
 *
 * Usage:
 *   npx tsx scripts/indexnow-submit.ts              # submit all en+ja URLs
 *   npx tsx scripts/indexnow-submit.ts --dry-run
 *   npx tsx scripts/indexnow-submit.ts --reset      # re-submit all URLs
 *
 * Quota: no hard limit, but submit each URL at most once per day.
 * State: ~/.config/pickly/indexnow-submitted.json
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SITE_URL = "https://pickly.blog";
const KEY = "505118c2333ec1cbddc87177c90a0dce";
const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/indexnow-submitted.json");
// Yandex endpoint (Bing has per-IP rate limits; use Bing separately via Webmaster Tools)
const ENDPOINT = "https://yandex.com/indexnow";
const BATCH_SIZE = 100; // smaller batches to avoid 403 errors

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESET = args.includes("--reset");

interface State { submitted: Record<string, string> } // url → ISO timestamp

function loadState(): State {
  if (RESET) return { submitted: {} };
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); }
  catch { return { submitted: {} }; }
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
  const locales = ["en", "ja", "ko", "zh-CN", "zh-TW", "de", "fr", "es", "pt-BR", "it", "ru", "ar", "hi", "id", "th", "vi", "tr"];
  const urls: string[] = [
    `${SITE_URL}/`,
    ...locales.map((l) => `${SITE_URL}/${l}/`),
  ];
  for (const slug of slugs) {
    for (const locale of ["en", "ja"]) {
      urls.push(`${SITE_URL}/${locale}/articles/${slug}/`);
    }
  }
  return urls;
}

async function submitBatch(urls: string[]): Promise<boolean> {
  const body = {
    host: "pickly.blog",
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList: urls,
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (res.ok || res.status === 202) return true;
  const text = await res.text().catch(() => "");
  console.error(`  ✗ HTTP ${res.status}: ${text.slice(0, 100)}`);
  return false;
}

async function main() {
  const slugs = listArticleSlugs();
  const allUrls = buildUrls(slugs);
  const state = loadState();
  const newUrls = allUrls.filter((u) => !state.submitted[u]);

  console.log(`Total URLs: ${allUrls.length}`);
  console.log(`Already submitted: ${Object.keys(state.submitted).length}`);
  console.log(`Will submit now: ${newUrls.length}\n`);

  if (DRY_RUN) {
    console.log("Dry-run — would submit:");
    for (const u of newUrls.slice(0, 20)) console.log(`  ${u}`);
    if (newUrls.length > 20) console.log(`  ... and ${newUrls.length - 20} more`);
    return;
  }

  if (newUrls.length === 0) {
    console.log("Nothing new to submit.");
    return;
  }

  let ok = 0;
  for (let i = 0; i < newUrls.length; i += BATCH_SIZE) {
    const batch = newUrls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const success = await submitBatch(batch);
    if (success) {
      const now = new Date().toISOString();
      for (const u of batch) state.submitted[u] = now;
      ok += batch.length;
      console.log(`✓ Batch ${batchNum}: ${batch.length} URLs`);
      saveState(state);
    } else {
      console.error(`✗ Batch ${batchNum} failed`);
    }
    // Rate limit: Bing enforces per-minute quotas; wait between batches
    if (i + BATCH_SIZE < newUrls.length) {
      await new Promise((r) => setTimeout(r, 3_000));
    }
  }

  saveState(state);
  console.log(`\n完了: ${ok} URLs submitted to IndexNow (Bing/Yandex/etc.)`);
  console.log(`累計: ${Object.keys(state.submitted).length} / ${allUrls.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
