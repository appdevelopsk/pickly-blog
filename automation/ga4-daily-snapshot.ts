/**
 * GA4 daily snapshot — appends yesterday's data to data/analytics/daily.csv
 *
 * Auth: run automation/ga4-auth-setup.ts once to generate .secrets/ga4-token.json
 * Run manually : GA4_PROPERTY_ID=537610479 npx tsx automation/ga4-daily-snapshot.ts
 * Cron (launchd): see docs/GA4_SNAPSHOT_SETUP.md
 */

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { OAuth2Client } from "google-auth-library";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? "537610479";
const TOKEN_PATH   = resolve(import.meta.dirname, "../.secrets/ga4-token.json");
const OUT_FILE     = resolve(import.meta.dirname, "../data/analytics/daily.csv");

// ── Auth ──────────────────────────────────────────────────────────────────────
const tok = JSON.parse(readFileSync(TOKEN_PATH, "utf-8"));
const auth = new OAuth2Client(tok.client_id, tok.client_secret);
auth.setCredentials({ refresh_token: tok.refresh_token });
const { token: accessToken } = await auth.getAccessToken();
if (!accessToken) throw new Error("Failed to get access token");

// ── Helpers ───────────────────────────────────────────────────────────────────
function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const date = process.argv[2] ?? yesterday();
const BASE = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}`;
const HEADERS = {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json",
};

type ReportRow = { dimensionValues: Array<{value:string}>; metricValues: Array<{value:string}> };
type ReportResult = { rows?: ReportRow[] };

async function runReport(body: object): Promise<ReportResult> {
  const res = await fetch(`${BASE}:runReport`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.warn(`GA4 API warning ${res.status}: ${err.slice(0, 200)}`);
    return { rows: [] };
  }
  return res.json() as Promise<ReportResult>;
}

console.log(`Fetching GA4 data for ${date} → property ${PROPERTY_ID}`);

// ── 1. Pageviews by article slug ──────────────────────────────────────────────
const pageviewsRes = await runReport({
  dateRanges: [{ startDate: date, endDate: date }],
  dimensions: [{ name: "pagePath" }],
  metrics: [
    { name: "screenPageViews" },
    { name: "sessions" },
    { name: "bounceRate" },
    { name: "averageSessionDuration" },
  ],
  dimensionFilter: {
    filter: {
      fieldName: "pagePath",
      stringFilter: { matchType: "CONTAINS", value: "/articles/" },
    },
  },
  orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
  limit: 200,
});

// ── 2. Affiliate clicks by article + offer ────────────────────────────────────
const clicksRes = await runReport({
  dateRanges: [{ startDate: date, endDate: date }],
  dimensions: [
    { name: "customEvent:article_slug" },
    { name: "customEvent:offer_id" },
  ],
  metrics: [{ name: "eventCount" }],
  dimensionFilter: {
    filter: {
      fieldName: "eventName",
      stringFilter: { matchType: "EXACT", value: "affiliate_click" },
    },
  },
  orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
  limit: 500,
});

// ── Write CSV ─────────────────────────────────────────────────────────────────
const CSV_HEADER = "date,type,slug_or_path,offer_id,pageviews,sessions,bounce_rate,avg_session_sec,clicks\n";

if (!existsSync(OUT_FILE)) {
  writeFileSync(OUT_FILE, CSV_HEADER);
  console.log(`Created ${OUT_FILE}`);
}

const lines: string[] = [];

for (const row of pageviewsRes.rows ?? []) {
  const path   = row.dimensionValues[0]?.value ?? "";
  const views  = row.metricValues[0]?.value ?? "0";
  const sess   = row.metricValues[1]?.value ?? "0";
  const bounce = parseFloat(row.metricValues[2]?.value ?? "0").toFixed(3);
  const avgSec = parseFloat(row.metricValues[3]?.value ?? "0").toFixed(1);
  const slug   = path.replace(/^\/[a-z-]+\/articles\//, "").replace(/\/$/, "") || path;
  lines.push(`${date},pageview,${slug},,${views},${sess},${bounce},${avgSec},`);
}

for (const row of clicksRes.rows ?? []) {
  const slug    = row.dimensionValues[0]?.value ?? "(not set)";
  const offerId = row.dimensionValues[1]?.value ?? "(not set)";
  const clicks  = row.metricValues[0]?.value ?? "0";
  lines.push(`${date},click,${slug},${offerId},,,,,${clicks}`);
}

if (lines.length > 0) {
  appendFileSync(OUT_FILE, lines.join("\n") + "\n");
  console.log(`Appended ${lines.length} rows to ${OUT_FILE}`);
} else {
  console.log("No data returned (site may be too new — try again tomorrow after traffic accumulates).");
}

// ── Summary ───────────────────────────────────────────────────────────────────
const totalViews = (pageviewsRes.rows ?? [])
  .reduce((s, r) => s + parseInt(r.metricValues[0]?.value ?? "0"), 0);
const totalClicks = (clicksRes.rows ?? [])
  .reduce((s, r) => s + parseInt(r.metricValues[0]?.value ?? "0"), 0);

console.log(`\n── ${date} summary ──`);
console.log(`  Pageviews:        ${totalViews}`);
console.log(`  Affiliate clicks: ${totalClicks}`);
console.log(`  Articles tracked: ${pageviewsRes.rows?.length ?? 0}`);
