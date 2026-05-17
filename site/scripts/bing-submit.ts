/**
 * Bing Webmaster API — bulk URL submission.
 *
 * Quota: 500 URLs/day per site.
 * Docs: https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api
 *
 * Usage:
 *   npx tsx scripts/bing-submit.ts              # submit en+ja URLs (up to 500)
 *   npx tsx scripts/bing-submit.ts --all        # include all locales
 *   npx tsx scripts/bing-submit.ts --sitemap    # also submit sitemap
 *   npx tsx scripts/bing-submit.ts --dry-run
 *   npx tsx scripts/bing-submit.ts --reset      # re-submit all
 *
 * State: ~/.config/pickly/bing-submitted.json
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SITE_URL = "https://pickly.blog";
const API_KEY = "62fdbaf69a7b4489a5450ddbccfa8a20";
const BASE = "https://ssl.bing.com/webmaster/api.svc/json";
const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/bing-submitted.json");
const DAILY_LIMIT = 500;
const BATCH_SIZE = 100;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESET = args.includes("--reset");
const ALL_LOCALES = args.includes("--all");
const SUBMIT_SITEMAP = args.includes("--sitemap");

interface State { submitted: Record<string, string> }

function loadState(): State {
  if (RESET) return { submitted: {} };
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); }
  catch { return { submitted: {} }; }
}

function saveState(s: State) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 2));
}

function buildUrls(): string[] {
  const slugs = fs.readdirSync(ARTICLES_DIR)
    .filter((s) => fs.existsSync(path.join(ARTICLES_DIR, s, "meta.ts")))
    .sort();
  const locales = ALL_LOCALES
    ? ["en", "ja", "ko", "zh-CN", "zh-TW", "de", "fr", "es", "pt-BR", "it", "ru", "ar", "hi", "id", "th", "vi", "tr"]
    : ["en", "ja"];
  const urls: string[] = [`${SITE_URL}/`, ...locales.map((l) => `${SITE_URL}/${l}/`)];
  for (const slug of slugs) {
    for (const locale of locales) {
      urls.push(`${SITE_URL}/${locale}/articles/${slug}/`);
    }
  }
  return urls;
}

async function submitBatch(urls: string[]): Promise<boolean> {
  const res = await fetch(`${BASE}/SubmitUrlbatch?apikey=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ siteUrl: `${SITE_URL}/`, urlList: urls }),
  });
  if (res.ok) return true;
  const text = await res.text().catch(() => "");
  console.error(`  ✗ HTTP ${res.status}: ${text.slice(0, 100)}`);
  return false;
}

async function submitSitemap() {
  const res = await fetch(
    `${BASE}/AddSitemap?apikey=${API_KEY}&siteUrl=${encodeURIComponent(SITE_URL + "/")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ sitemapUrl: `${SITE_URL}/sitemap.xml` }),
    }
  );
  if (res.ok) {
    console.log(`✓ Sitemap submitted: ${SITE_URL}/sitemap.xml`);
  } else {
    const t = await res.text().catch(() => "");
    console.error(`✗ Sitemap submission failed: HTTP ${res.status} ${t.slice(0, 80)}`);
  }
}

async function main() {
  if (SUBMIT_SITEMAP) await submitSitemap();

  const allUrls = buildUrls();
  const state = loadState();
  const newUrls = allUrls.filter((u) => !state.submitted[u]).slice(0, DAILY_LIMIT);

  console.log(`Total URLs: ${allUrls.length}`);
  console.log(`Already submitted: ${Object.keys(state.submitted).length}`);
  console.log(`Will submit now: ${newUrls.length} (daily limit: ${DAILY_LIMIT})\n`);

  if (DRY_RUN) {
    for (const u of newUrls.slice(0, 20)) console.log(`  ${u}`);
    if (newUrls.length > 20) console.log(`  ... and ${newUrls.length - 20} more`);
    return;
  }

  if (newUrls.length === 0) { console.log("Nothing new to submit."); return; }

  let ok = 0;
  for (let i = 0; i < newUrls.length; i += BATCH_SIZE) {
    const batch = newUrls.slice(i, i + BATCH_SIZE);
    const success = await submitBatch(batch);
    if (success) {
      const now = new Date().toISOString();
      for (const u of batch) state.submitted[u] = now;
      ok += batch.length;
      saveState(state);
      console.log(`✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} URLs`);
    } else {
      console.error(`✗ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed`);
    }
    if (i + BATCH_SIZE < newUrls.length) await new Promise((r) => setTimeout(r, 1_000));
  }

  console.log(`\n完了: ${ok} / ${newUrls.length} URLs → Bing`);
  console.log(`累計: ${Object.keys(state.submitted).length} / ${allUrls.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
