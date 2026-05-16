/**
 * GSC sitemap submission + URL inspection script.
 *
 * Usage:
 *   npx tsx scripts/gsc-submit.ts --sitemap        # submit sitemap.xml
 *   npx tsx scripts/gsc-submit.ts --inspect 30     # inspect top 30 pages
 *   npx tsx scripts/gsc-submit.ts --status         # show sitemap submission status
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { google } from "googleapis";

const SITE_URL = "https://pickly.blog/";
const SITEMAP_URL = "https://pickly.blog/sitemap.xml";
const CREDENTIALS_PATH = path.resolve(__dirname, "../gsc-credentials.json");
const TOKEN_PATH = path.resolve(__dirname, "../gsc-token.json");
// webmasters scope (not readonly) needed for sitemap submission
const SCOPES = ["https://www.googleapis.com/auth/webmasters"];

const args = process.argv.slice(2);
const get = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const SUBMIT_SITEMAP = args.includes("--sitemap");
const STATUS = args.includes("--status");
const INSPECT_COUNT = args.includes("--inspect") ? parseInt(get("inspect") ?? "20") : 0;

async function getAuthClient() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3456");

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
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

async function submitSitemap(auth: any) {
  const search = google.searchconsole({ version: "v1", auth });
  console.log(`→ Submitting sitemap: ${SITEMAP_URL}`);
  try {
    await search.sitemaps.submit({ siteUrl: SITE_URL, feedpath: SITEMAP_URL });
    console.log("✓ Submitted");
  } catch (e: any) {
    console.error("✗ Failed:", e?.message ?? e);
  }
}

async function showStatus(auth: any) {
  const search = google.searchconsole({ version: "v1", auth });
  console.log(`→ Sitemap submission status for ${SITE_URL}\n`);
  const res = await search.sitemaps.list({ siteUrl: SITE_URL });
  const sitemaps = res.data.sitemap ?? [];
  if (sitemaps.length === 0) {
    console.log("(No sitemaps submitted yet)");
    return;
  }
  for (const s of sitemaps) {
    console.log(`Path: ${s.path}`);
    console.log(`  Last submitted: ${s.lastSubmitted}`);
    console.log(`  Last downloaded: ${s.lastDownloaded ?? "(never)"}`);
    console.log(`  URLs in sitemap: ${s.contents?.[0]?.submitted ?? "?"} (indexed: ${s.contents?.[0]?.indexed ?? "?"})`);
    console.log(`  Errors: ${s.errors ?? 0} / Warnings: ${s.warnings ?? 0}`);
    console.log(`  Is pending: ${s.isPending} / Is sitemaps index: ${s.isSitemapsIndex}`);
    console.log();
  }
}

async function inspectUrls(auth: any, count: number) {
  const search = google.searchconsole({ version: "v1", auth });
  // Top priority URLs: home + most popular comparison articles
  const slugs = [
    "best-massage-gun-2026",
    "best-coffee-maker-2026",
    "best-air-fryer-2026",
    "best-robot-vacuum-2026",
    "best-mattress-2026",
    "best-mattress-for-back-pain-2026",
    "best-noise-cancelling-headphones-2026",
    "best-running-shoes-for-flat-feet-2026",
    "best-vpn-2026",
    "best-electric-toothbrush-2026",
    "best-hair-dryer-2026",
    "best-camping-tent-2026",
    "best-luggage-2026",
    "best-air-purifier-2026",
    "best-fitness-tracker-2026",
    "best-protein-powder-2026",
    "best-dash-cam-2026",
    "best-projector-2026",
    "best-blender-2026",
    "best-smart-watch-2026",
  ].slice(0, count);

  // Inspect both en and ja locales
  const urls: string[] = [`${SITE_URL}en/`, `${SITE_URL}ja/`];
  for (const slug of slugs) {
    urls.push(`${SITE_URL}en/articles/${slug}/`);
    urls.push(`${SITE_URL}ja/articles/${slug}/`);
  }

  console.log(`→ Inspecting ${urls.length} URLs (showing index status)\n`);
  console.log(`${"URL".padEnd(75)} ${"Index".padEnd(20)} ${"Crawled"}`);
  console.log("─".repeat(120));

  let indexed = 0, submitted_not_indexed = 0, crawled_not_indexed = 0, not_crawled = 0, errors = 0;

  for (const url of urls) {
    try {
      const r = await search.urlInspection.index.inspect({
        requestBody: { siteUrl: SITE_URL, inspectionUrl: url },
      });
      const idx = r.data.inspectionResult?.indexStatusResult;
      const verdict = idx?.verdict ?? "?";
      const coverage = idx?.coverageState ?? "?";
      const lastCrawl = idx?.lastCrawlTime?.split("T")[0] ?? "—";
      const short = url.replace(SITE_URL, "/").slice(0, 73);
      console.log(`${short.padEnd(75)} ${(verdict + "/" + coverage.slice(0, 12)).padEnd(20)} ${lastCrawl}`);

      if (verdict === "PASS") indexed++;
      else if (coverage.includes("Submitted")) submitted_not_indexed++;
      else if (coverage.includes("Crawled")) crawled_not_indexed++;
      else not_crawled++;
    } catch (e: any) {
      console.log(`${url.slice(0, 73).padEnd(75)} ERROR: ${e?.message?.slice(0, 30) ?? e}`);
      errors++;
    }
  }

  console.log("─".repeat(120));
  console.log(`\n集計:`);
  console.log(`  ✓ Indexed (PASS):       ${indexed}`);
  console.log(`  ⏱ Submitted, awaiting:  ${submitted_not_indexed}`);
  console.log(`  ⚠ Crawled, not indexed: ${crawled_not_indexed}`);
  console.log(`  ✗ Not crawled yet:      ${not_crawled}`);
  console.log(`  ⚠ Errors:               ${errors}`);
}

async function main() {
  const auth = await getAuthClient();
  if (SUBMIT_SITEMAP) await submitSitemap(auth);
  if (STATUS) await showStatus(auth);
  if (INSPECT_COUNT > 0) await inspectUrls(auth, INSPECT_COUNT);
  if (!SUBMIT_SITEMAP && !STATUS && INSPECT_COUNT === 0) {
    console.log("Usage:");
    console.log("  npx tsx scripts/gsc-submit.ts --sitemap     # submit sitemap.xml");
    console.log("  npx tsx scripts/gsc-submit.ts --status      # show sitemap status");
    console.log("  npx tsx scripts/gsc-submit.ts --inspect 20  # inspect 20 top URLs");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
