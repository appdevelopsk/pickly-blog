#!/usr/bin/env node
/**
 * pickly 管理ダッシュボードのデータを作って Cloudflare KV に置く。
 *
 * なぜ KV か (2026-08-13):
 *   appdevelopsk/pickly-blog は **公開リポジトリ**で、サイトは output:"export" の
 *   完全静的書き出し。よって
 *     - 売上JSONをリポにコミットする → 全世界に公開される。論外。
 *     - Next の API Route を置く → 静的書き出しなので存在できない。
 *   残る唯一の道が「Cloudflare Pages Functions が KV から読む」。リポにはコードだけ、
 *   数字は KV にだけ置く。fxea365 が Supabase でやっていることの静的サイト版。
 *
 * 出す数字の出どころ:
 *   売上   … Amazon は API が無いのでヘッドレススクレイプの日次CSV
 *            (growth/snapshots/amazon-earnings-daily.csv、US/JP のみ稼働)
 *            他ASPは scripts/asp-report.ts --json (Impact/ValueCommerce/AWIN/CJ)
 *   コスト … growth/pickly-costs.json (手書き。請求APIは存在しない)
 *   ファネル/記事別 … GA4 Data API (property 537610479)
 *
 * ★ 記事別の売上は**推定**である。Amazon は商品単位でしか成果を返さず「どの記事
 *   経由か」を持たない。よって market ごとの確定報酬を、その market の
 *   affiliate_click 数で按分している。画面にも推定と明示すること。
 *
 * 使い方:
 *   node scripts/admin-metrics.mjs           # 収集して KV に PUT
 *   node scripts/admin-metrics.mjs --dry-run # 収集して標準出力に出すだけ
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE_DIR = resolve(HERE, "..");
const GROWTH = "/Users/ken/Dropbox/00_集客統合/growth";
const SA_PATH = "/Users/ken/Dropbox/pickly/.secrets/ga4-service-account.json";
const COSTS_PATH = resolve(GROWTH, "pickly-costs.json");
const AMAZON_CSV = resolve(GROWTH, "snapshots/amazon-earnings-daily.csv");

const CF_ACCOUNT = "ca1064295acacbeda97245fa9293209f";
const CF_NAMESPACE = "a9fc779d79594ebc8d907fd1581bc468"; // pickly-admin-metrics
const CF_TOKEN_FILE = "/Users/ken/.cloudflare-token";
const KV_KEY = "metrics:latest";

const GA4_PROPERTY = "537610479";
const DAYS = 28;
const DRY = process.argv.includes("--dry-run");

const warnings = [];
const warn = (m) => { warnings.push(m); console.error("⚠ " + m); };

const dstr = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// ── GA4 ──────────────────────────────────────────────────────────────────────
async function ga4Token() {
  const sa = JSON.parse(readFileSync(SA_PATH, "utf-8"));
  const b64 = (b) => Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const now = Math.floor(Date.now() / 1000);
  const h = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const p = b64(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  }));
  const s = createSign("RSA-SHA256");
  s.update(`${h}.${p}`);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${h}.${p}.${b64(s.sign(sa.private_key))}`,
    }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("GA4 token 取得失敗: " + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}

async function ga4(token, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "yesterday" }], ...body }),
  });
  const j = await res.json();
  if (j.error) throw new Error("GA4: " + JSON.stringify(j.error).slice(0, 200));
  return j.rows ?? [];
}

const eventFilter = (name) => ({
  filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: name } },
});

/** 本人(東大阪)を除いた実流入も併記する。自分の閲覧を成果と誤読しないため。 */
const SELF_CITY = "Higashiosaka";

async function collectGa4() {
  const token = await ga4Token();

  const [daily, byPath, byDomain, views, byCity, totals] = await Promise.all([
    ga4(token, { dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }, { name: "totalUsers" }], orderBys: [{ dimension: { dimensionName: "date" } }] }),
    ga4(token, {
      dimensions: [{ name: "pagePath" }], metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter("affiliate_click"),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 100,
    }),
    // ★ customEvent:link_domain は 179件中172件が "(not set)"。イベントが
    //   link_domain パラメータを送っていないため使い物にならない。link_url は
    //   全件入っているので、そこからホストを割り出す。
    ga4(token, {
      dimensions: [{ name: "customEvent:link_url" }], metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter("affiliate_click"),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 2000,
    }),
    // limit は大きく。300 だと閲覧数の少ない記事が落ちて、クリックはあるのに
    // 閲覧数 null という穴あきの行になる(クリック率が出せなくなる)。
    ga4(token, {
      dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 5000,
    }),
    ga4(token, { dimensions: [{ name: "city" }], metrics: [{ name: "sessions" }], limit: 200 }),
    ga4(token, { metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }, { name: "userEngagementDuration" }] }),
  ]);

  const num = (r, i = 0) => Number(r.metricValues[i].value) || 0;

  // link_url -> ホスト単位に畳む。ASP/ロケール別の内訳はこれが元になる。
  const hostCounts = new Map();
  for (const r of byDomain) {
    let host = "(URL不明)";
    try { host = new URL(r.dimensionValues[0].value).hostname.replace(/^www\./, ""); } catch { /* 空や壊れたURL */ }
    hostCounts.set(host, (hostCounts.get(host) ?? 0) + num(r));
  }
  const clicksByDomain = [...hostCounts.entries()]
    .map(([domain, clicks]) => ({ domain, clicks, market: DOMAIN_MARKET[domain] ?? null }))
    .sort((a, b) => b.clicks - a.clicks);
  const selfSessions = byCity.filter((r) => r.dimensionValues[0].value === SELF_CITY).reduce((a, r) => a + num(r), 0);

  const viewsByPath = new Map(views.map((r) => [r.dimensionValues[0].value, { views: num(r, 0), sessions: num(r, 1) }]));
  const clicksByPath = byPath.map((r) => {
    const path = r.dimensionValues[0].value;
    const clicks = num(r);
    const v = viewsByPath.get(path);
    return { path, clicks, views: v?.views ?? null, locale: path.split("/").filter(Boolean)[0] ?? "?" };
  });

  const totalSessions = totals.length ? num(totals[0], 0) : 0;
  return {
    sessions: totalSessions,
    users: totals.length ? num(totals[0], 1) : 0,
    pageViews: totals.length ? num(totals[0], 2) : 0,
    avgEngagementSec: totalSessions ? round((totals.length ? num(totals[0], 3) : 0) / totalSessions, 1) : 0,
    selfSessions,
    realSessions: Math.max(0, totalSessions - selfSessions),
    affiliateClicks: clicksByPath.reduce((a, r) => a + r.clicks, 0),
    clicksByPath,
    clicksByDomain,
    daily: daily.map((r) => ({
      date: r.dimensionValues[0].value.replace(/^(\d{4})(\d\d)(\d\d)$/, "$1-$2-$3"),
      sessions: num(r, 0), users: num(r, 1),
    })),
    articleViewsTop: views.slice(0, 50).map((r) => ({ path: r.dimensionValues[0].value, views: num(r, 0) })),
  };
}

// ── Amazon (スクレイプCSV) ────────────────────────────────────────────────────
/** market -> Amazon の報酬通貨。按分と円換算に要る。 */
const MARKET_CURRENCY = { us: "USD", jp: "JPY", uk: "GBP", de: "EUR", fr: "EUR", it: "EUR", es: "EUR", ca: "CAD" };
/** GA4 の link_domain から market を引く。記事別按分に使う。 */
const DOMAIN_MARKET = {
  "amazon.com": "us", "www.amazon.com": "us",
  "amazon.co.jp": "jp", "www.amazon.co.jp": "jp",
  "amazon.co.uk": "uk", "www.amazon.co.uk": "uk",
  "amazon.de": "de", "www.amazon.de": "de",
  "amazon.fr": "fr", "www.amazon.fr": "fr",
  "amazon.it": "it", "www.amazon.it": "it",
  "amazon.es": "es", "www.amazon.es": "es",
  "amazon.ca": "ca", "www.amazon.ca": "ca",
};

function collectAmazon() {
  if (!existsSync(AMAZON_CSV)) {
    warn(`Amazon の日次CSVが無い: ${AMAZON_CSV} — 売上が0として扱われる`);
    return { accounts: [], asOf: null };
  }
  const lines = readFileSync(AMAZON_CSV, "utf-8").trim().split("\n");
  const head = lines[0].split(",");
  const rows = lines.slice(1).map((l) => Object.fromEntries(l.split(",").map((v, i) => [head[i], v])));
  if (!rows.length) {
    warn("Amazon の日次CSVが空。スクレイプ(com.pickly.amazon-earnings)が動いているか確認");
    return { accounts: [], asOf: null };
  }
  // アカウントごとに最新日の行だけを採る。CSVは日次追記なので同じアカウントが何行もある。
  const latest = new Map();
  for (const r of rows) {
    const prev = latest.get(r.account);
    if (!prev || r.date > prev.date) latest.set(r.account, r);
  }
  const asOf = [...latest.values()].reduce((a, r) => (r.date > a ? r.date : a), "");
  const staleDays = Math.floor((Date.now() - Date.parse(asOf)) / 864e5);
  if (staleDays > 2) warn(`Amazon の数字が ${staleDays} 日前 (${asOf}) で止まっている。スクレイプのログイン切れを疑う`);

  const accounts = [...latest.values()].map((r) => ({
    market: r.account,
    currency: MARKET_CURRENCY[r.account] ?? "USD",
    date: r.date,
    commissions30d: Number(r.commissions30d) || 0,
    bounties30d: Number(r.bounties30d) || 0,
    clicks30d: Number(r.clicks30d) || 0,
    monthEarnings: Number(r.monthEarnings) || 0,
    monthOrdered: Number(r.monthOrdered) || 0,
    monthShipped: Number(r.monthShipped) || 0,
    monthClicks: Number(r.monthClicks) || 0,
  }));

  // 掲載はしているのにスクレイプ対象になっていない market を明示する。
  const covered = new Set(accounts.map((a) => a.market));
  const missing = Object.keys(MARKET_CURRENCY).filter((m) => !covered.has(m));
  if (missing.length) {
    warn(`Amazon の売上を取得できていない market: ${missing.join(", ")} — 記事は出ているので売上は「不明」であって0ではない`);
  }
  return { accounts, asOf, missingMarkets: missing };
}

// ── 他ASP ────────────────────────────────────────────────────────────────────
function collectAsp() {
  try {
    const out = execFileSync("npx", ["tsx", "scripts/asp-report.ts", "--days", String(DAYS), "--json"], {
      cwd: SITE_DIR, encoding: "utf-8", timeout: 180_000, stdio: ["ignore", "pipe", "ignore"],
    });
    const line = out.trim().split("\n").filter((l) => l.startsWith("{")).pop();
    const parsed = JSON.parse(line);
    for (const r of parsed.results) {
      if (r.status !== "ok") warn(`ASP 未接続: ${r.name} — ${r.error}`);
    }
    return parsed.results;
  } catch (e) {
    warn("ASP レポートの取得に失敗: " + String(e.message).slice(0, 160));
    return [];
  }
}

// ── 為替 ─────────────────────────────────────────────────────────────────────
const FX_FALLBACK = { USD: 150, JPY: 1, GBP: 190, EUR: 163, CAD: 110 };
async function collectFx() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=JPY&to=USD,GBP,EUR,CAD", { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    const rates = { JPY: 1 };
    for (const [cur, perJpy] of Object.entries(j.rates ?? {})) rates[cur] = round(1 / perJpy, 4);
    if (!rates.USD) throw new Error("USD が返らない");
    return { rates, date: j.date, source: "frankfurter.app" };
  } catch (e) {
    warn("為替の取得に失敗、固定レートを使う: " + String(e.message).slice(0, 100));
    return { rates: FX_FALLBACK, date: null, source: "固定値(フォールバック)" };
  }
}

// ── 組み立て ─────────────────────────────────────────────────────────────────
function buildFunnel(ga, amazon) {
  const aspClicks = amazon.accounts.reduce((a, x) => a + x.clicks30d, 0);
  const orders = amazon.accounts.reduce((a, x) => a + x.monthOrdered, 0);
  const shipped = amazon.accounts.reduce((a, x) => a + x.monthShipped, 0);
  const pct = (n, d) => (d ? round((n / d) * 100, 2) : null);
  return {
    steps: [
      { key: "sessions", label: "セッション", value: ga.realSessions, note: "本人の閲覧を除いた実流入" },
      { key: "affiliateClicks", label: "アフィリクリック(GA4計測)", value: ga.affiliateClicks, rateFromPrev: pct(ga.affiliateClicks, ga.realSessions) },
      { key: "aspClicks", label: "ASP側で記録されたクリック", value: aspClicks, rateFromPrev: pct(aspClicks, ga.affiliateClicks), note: "Amazon US/JP のみ。GA4 との差はリンク切れ・計測漏れ・未取得marketを示す" },
      { key: "orders", label: "注文", value: orders, rateFromPrev: pct(orders, aspClicks) },
      { key: "shipped", label: "発送(確定間近)", value: shipped, rateFromPrev: pct(shipped, orders) },
    ],
    leak: ga.affiliateClicks > 0 && aspClicks < ga.affiliateClicks
      ? `GA4 は ${ga.affiliateClicks} クリックを計測しているが ASP 側の記録は ${aspClicks}。差 ${ga.affiliateClicks - aspClicks} 件はどこにも着地していないか、売上を取得できていない market のもの。`
      : null,
  };
}

/**
 * 記事別の収益「推定」。
 *
 * ★ Amazon は成果を商品単位でしか返さず「どの記事から来たか」を持たない。
 *   よって厳密な記事別売上は原理的に取得できない。ここでは
 *     記事の推定売上 = 確定報酬の合計 × (その記事の affiliate_click / 全クリック)
 *   という単純な按分に留める。市場別に割り直すには「記事 × market」のクリックが
 *   要るが GA4 の1クエリでは取れないので、取れるようになるまでやらない。
 *   画面では必ず「推定」と明示すること。
 */
function estimateByArticle(ga, amazon, fx) {
  const jpy = (v, cur) => v * (fx.rates[cur] ?? FX_FALLBACK[cur] ?? 0);
  const totalEarnJpy = amazon.accounts.reduce((a, x) => a + jpy(x.commissions30d + x.bounties30d, x.currency), 0);
  const totalClicks = ga.affiliateClicks || 0;

  return ga.clicksByPath.slice(0, 60).map((r) => ({
    path: r.path,
    locale: r.locale,
    views: r.views,
    clicks: r.clicks,
    // 1閲覧あたりのクリック数。読者は1ページで複数商品を押すので 100% を超える。
    // 「クリック率」と書くと誤読するのでこの名前にする。
    clicksPerView: r.views ? round(r.clicks / r.views, 2) : null,
    estRevenueJpy: totalClicks ? round(totalEarnJpy * (r.clicks / totalClicks), 1) : 0,
  }));
}

async function main() {
  const costs = JSON.parse(readFileSync(COSTS_PATH, "utf-8"));
  const [fx, ga, asp] = await Promise.all([collectFx(), collectGa4(), Promise.resolve(collectAsp())]);
  const amazon = collectAmazon();

  const jpy = (v, cur) => round(v * (fx.rates[cur] ?? FX_FALLBACK[cur] ?? 0), 1);

  const revenueRows = [
    ...amazon.accounts.map((a) => ({
      source: `Amazon ${a.market.toUpperCase()}`,
      connected: true,
      currency: a.currency,
      revenue: round(a.commissions30d + a.bounties30d, 2),
      revenueJpy: jpy(a.commissions30d + a.bounties30d, a.currency),
      clicks: a.clicks30d,
      orders: a.monthOrdered,
      asOf: a.date,
    })),
    ...(amazon.missingMarkets ?? []).map((m) => ({
      source: `Amazon ${m.toUpperCase()}`,
      connected: false,
      currency: MARKET_CURRENCY[m],
      revenue: null, revenueJpy: null, clicks: null, orders: null,
      note: "スクレイプ未対応。売上は0ではなく不明",
    })),
    ...asp.map((r) => ({
      source: r.name,
      connected: r.status === "ok",
      currency: r.currency,
      revenue: r.status === "ok" ? round(r.revenue ?? 0, 2) : null,
      revenueJpy: r.status === "ok" ? jpy(r.revenue ?? 0, r.currency) : null,
      clicks: r.clicks, orders: r.conversions,
      note: r.status === "ok" ? undefined : r.error,
    })),
  ];

  // 報酬が発生しない先へ流れているクリックを検知する。
  // 2026-08-04 の実例: 無効化された Skimlinks(go.skimresources.com)へ全クリックの
  // 4割が吸われていた。撤去済みだが、同じ型(死んだリダイレクタ・停止したASP)は
  // 画面を見ても分からないのでクリック先ホストから機械的に見つける。
  const DEAD_HOSTS = { "go.skimresources.com": "Skimlinks(2026-08-04にアカウント無効化)" };
  for (const d of ga.clicksByDomain) {
    if (DEAD_HOSTS[d.domain] && d.clicks > 0) {
      warn(`報酬にならない先へ ${d.clicks} クリック流出: ${d.domain} — ${DEAD_HOSTS[d.domain]}`);
    }
  }

  const revenueJpy = round(revenueRows.reduce((a, r) => a + (r.revenueJpy ?? 0), 0), 1);
  const costJpy = costs.items.reduce((a, i) => a + (i.monthlyJpy || 0), 0);

  const payload = {
    generatedAt: new Date().toISOString(),
    period: { start: dstr(DAYS), end: dstr(1), days: DAYS },
    fx,
    profit: {
      revenueJpy,
      costJpy,
      profitJpy: round(revenueJpy - costJpy, 1),
      connectedSources: revenueRows.filter((r) => r.connected).length,
      totalSources: revenueRows.length,
    },
    revenue: revenueRows,
    costs: { items: costs.items, monthlyJpy: costJpy },
    funnel: buildFunnel(ga, amazon),
    articles: estimateByArticle(ga, amazon, fx),
    localeClicks: ga.clicksByDomain,
    traffic: {
      sessions: ga.sessions, realSessions: ga.realSessions, selfSessions: ga.selfSessions,
      users: ga.users, pageViews: ga.pageViews, avgEngagementSec: ga.avgEngagementSec,
      daily: ga.daily,
    },
    warnings,
  };

  if (DRY) {
    const out = resolve(GROWTH, "snapshots/pickly-admin-metrics-preview.json");
    writeFileSync(out, JSON.stringify(payload, null, 2));
    console.log(JSON.stringify({ ...payload, articles: payload.articles.slice(0, 5), traffic: { ...payload.traffic, daily: "…" } }, null, 2));
    console.log(`\n(dry-run) 全文: ${out}`);
    return;
  }

  const cfToken = readFileSync(CF_TOKEN_FILE, "utf-8").trim();
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_NAMESPACE}/values/${KV_KEY}`;
  const form = new FormData();
  form.append("value", JSON.stringify(payload));
  form.append("metadata", JSON.stringify({ generatedAt: payload.generatedAt }));
  const res = await fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${cfToken}` }, body: form });
  const j = await res.json();
  if (!j.success) throw new Error("KV への書き込み失敗: " + JSON.stringify(j.errors).slice(0, 300));
  console.log(`✓ KV 更新 (${KV_KEY}) 売上 ¥${revenueJpy} − コスト ¥${costJpy} = 利益 ¥${payload.profit.profitJpy} / 警告 ${warnings.length}件`);
}

main().catch((e) => { console.error("✗ " + e.message); process.exit(1); });
