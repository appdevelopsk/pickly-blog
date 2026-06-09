/**
 * GA4 → GROWTH_REPORT.md generator (periodic growth analysis).
 *
 * Pulls last 7d & 28d from the GA4 Data API and writes a readable Markdown
 * report: traffic by source/medium, top pages, and affiliate_click events by
 * source — so each distribution experiment (see EXPERIMENTS.md) is measurable.
 *
 * Auth (service account, unattended):
 *   GA_SERVICE_ACCOUNT_JSON  — service-account key JSON (raw or base64).
 *                              The SA email must be a Viewer on the GA4 property.
 *   GA4_PROPERTY_ID          — numeric GA4 property id (NOT the stream/measurement id).
 *
 * If unset, exits 0 with a notice (so the scheduled workflow is a no-op until configured).
 */
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as fs from "node:fs";
import * as path from "node:path";

const SA_RAW = process.env.GA_SERVICE_ACCOUNT_JSON ?? "";
const OAUTH_RAW = process.env.GA_OAUTH_JSON ?? "";        // {client_id,client_secret,refresh_token}
const PROPERTY = process.env.GA4_PROPERTY_ID ?? "";
const OUT = path.resolve(__dirname, "../../GROWTH_REPORT.md");
const NOW = process.env.REPORT_DATE || new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

function parseMaybeB64(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  const txt = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(txt);
}

async function main() {
  const sa = parseMaybeB64(SA_RAW);
  const oauth = parseMaybeB64(OAUTH_RAW);
  if ((!sa && !oauth) || !PROPERTY) {
    console.log("GA4 reporting not configured (need GA4_PROPERTY_ID + GA_SERVICE_ACCOUNT_JSON or GA_OAUTH_JSON) — skipping.");
    return;
  }
  // Prefer service account (robust, non-expiring); fall back to OAuth refresh token.
  let auth: OAuth2Client | InstanceType<typeof google.auth.GoogleAuth>;
  if (sa) {
    auth = new google.auth.GoogleAuth({
      credentials: sa as { client_email: string; private_key: string },
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });
  } else {
    const o = oauth as { client_id: string; client_secret: string; refresh_token: string };
    const c = new OAuth2Client(o.client_id, o.client_secret);
    c.setCredentials({ refresh_token: o.refresh_token });
    auth = c;
  }
  const data = google.analyticsdata({ version: "v1beta", auth: auth as never });
  const property = `properties/${PROPERTY}`;

  const run = async (body: object) => {
    const res = await data.properties.runReport({ property, requestBody: body });
    return res.data.rows ?? [];
  };
  const dr = (days: number) => [{ startDate: `${days}daysAgo`, endDate: "today" }];

  // Totals (28d)
  const totals = await run({
    dateRanges: dr(28),
    metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
  });
  const t = totals[0]?.metricValues ?? [];
  const totSessions = t[0]?.value ?? "0", totUsers = t[1]?.value ?? "0", totViews = t[2]?.value ?? "0";

  // By source/medium (28d)
  const bySrc = await run({
    dateRanges: dr(28),
    dimensions: [{ name: "sessionSourceMedium" }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: "20",
  });

  // Top pages (28d)
  const pages = await run({
    dateRanges: dr(28),
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: "20",
  });

  // affiliate_click by source (28d)
  const clicks = await run({
    dateRanges: dr(28),
    dimensions: [{ name: "sessionSourceMedium" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "affiliate_click" } } },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: "20",
  });

  // 7d sessions for trend
  const s7 = (await run({ dateRanges: dr(7), metrics: [{ name: "sessions" }] }))[0]?.metricValues?.[0]?.value ?? "0";

  const md: string[] = [];
  md.push(`# Pickly Growth Report`);
  md.push(`生成: ${NOW} ／ GA4 property ${PROPERTY}`);
  md.push("");
  md.push(`## サマリ（直近28日）`);
  md.push(`- セッション: **${totSessions}** ／ ユーザー: **${totUsers}** ／ PV: **${totViews}**`);
  md.push(`- 直近7日セッション: **${s7}**`);
  md.push("");
  md.push(`## 参照元/メディア別 セッション（28日）← どのチャネルが効いているか`);
  md.push(`| source / medium | sessions | users |`);
  md.push(`|---|--:|--:|`);
  for (const r of bySrc) md.push(`| ${r.dimensionValues?.[0]?.value} | ${r.metricValues?.[0]?.value} | ${r.metricValues?.[1]?.value} |`);
  if (!bySrc.length) md.push(`| (データなし) | 0 | 0 |`);
  md.push("");
  md.push(`## affiliate_click（28日・参照元別）← 収益に繋がる行動`);
  md.push(`| source / medium | clicks |`);
  md.push(`|---|--:|`);
  for (const r of clicks) md.push(`| ${r.dimensionValues?.[0]?.value} | ${r.metricValues?.[0]?.value} |`);
  if (!clicks.length) md.push(`| (まだ0) | 0 |`);
  md.push("");
  md.push(`## 上位ページ（28日・PV）`);
  md.push(`| page | views | users |`);
  md.push(`|---|--:|--:|`);
  for (const r of pages) md.push(`| ${r.dimensionValues?.[0]?.value} | ${r.metricValues?.[0]?.value} | ${r.metricValues?.[1]?.value} |`);
  if (!pages.length) md.push(`| (データなし) | 0 | 0 |`);
  md.push("");
  md.push(`> 読み方: 参照元に pinterest/quora/note 等が増えれば配信実験が効いている証拠。`);
  md.push(`> 実験設計は EXPERIMENTS.md を参照。`);

  fs.writeFileSync(OUT, md.join("\n") + "\n");
  console.log(`✓ wrote ${OUT} (28d sessions=${totSessions}, 7d=${s7}, sources=${bySrc.length})`);
}

main().catch((e) => { console.error(e?.message ?? e); process.exit(1); });
