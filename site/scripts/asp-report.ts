/**
 * ASP 収益一覧取得スクリプト
 *
 * 対応ASP:
 *   - Impact      : IMPACT_SID + IMPACT_TOKEN (automation/.env)
 *   - ValueCommerce: VALUECOMMERCE_CLIENT_KEY + CLIENT_SECRET (site/.env.local)
 *   - AWIN        : AWIN_API_TOKEN (要取得 → AWINダッシュボード > Account > API)
 *   - CJ          : CJ_API_KEY    (要取得 → CJ Account > Account > API Key)
 *   - Amazon      : CSV手動DLのため非対応
 *   - A8 / もしも  : API非公開のため非対応
 *
 * 使い方:
 *   cd site && npx tsx scripts/asp-report.ts
 *   cd site && npx tsx scripts/asp-report.ts --days 7
 */

import path from "node:path";
import fs from "node:fs";

// .env.local と automation/.env を読み込む
function loadEnv(...filePaths: string[]) {
  const env: Record<string, string> = {};
  for (const fp of filePaths) {
    if (!fs.existsSync(fp)) continue;
    for (const line of fs.readFileSync(fp, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    }
  }
  return env;
}

const ENV = loadEnv(
  path.resolve(__dirname, "../.env.local"),
  path.resolve(__dirname, "../../automation/.env")
);

const args = process.argv.slice(2);
const DAYS = parseInt(args[args.indexOf("--days") + 1] ?? "30");

function dateStr(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
}

const START = dateStr(DAYS);
const END = dateStr(1);

type AspResult = {
  name: string;
  clicks: number | null;
  conversions: number | null;
  revenue: number | null;
  currency: string;
  status: "ok" | "error" | "no_token";
  error?: string;
};

// ── Impact ────────────────────────────────────────────────────────────────────
async function fetchImpact(): Promise<AspResult> {
  const sid = ENV["IMPACT_SID"];
  const token = ENV["IMPACT_TOKEN"];
  const base: AspResult = { name: "Impact", clicks: null, conversions: null, revenue: null, currency: "USD", status: "no_token" };

  if (!sid || !token) return { ...base, error: "IMPACT_SID / IMPACT_TOKEN が未設定" };

  // SID から数字部分を抽出
  const accountSid = sid.match(/(\d{7})/)?.[1];
  if (!accountSid) return { ...base, status: "error", error: "SID から AccountSid を抽出できませんでした" };

  try {
    const res = await fetch(
      `https://api.impact.com/Mediapartners/${sid}/Actions`,
      {
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) return { ...base, status: "error", error: `HTTP ${res.status}` };
    const data = await res.json() as any;
    const actions = data?.Actions ?? [];
    const conversions = actions.length;
    const revenue = actions.reduce((s: number, a: any) => s + (Number(a.Payout) || 0), 0);
    return { ...base, clicks: null, conversions, revenue, status: "ok" };
  } catch (e: any) {
    return { ...base, status: "error", error: e.message };
  }
}

// ── ValueCommerce ─────────────────────────────────────────────────────────────
async function fetchValueCommerce(): Promise<AspResult> {
  const clientKey = ENV["VALUECOMMERCE_CLIENT_KEY"];
  const clientSecret = ENV["VALUECOMMERCE_CLIENT_SECRET"];
  const base: AspResult = { name: "ValueCommerce", clicks: null, conversions: null, revenue: null, currency: "JPY", status: "no_token" };

  if (!clientKey || !clientSecret) return { ...base, error: "VALUECOMMERCE_CLIENT_KEY / CLIENT_SECRET が未設定" };

  try {
    // Step1: トークン取得
    const tokenRes = await fetch("https://api.valuecommerce.com/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientKey,
        client_secret: clientSecret,
      }),
    });
    if (!tokenRes.ok) return { ...base, status: "error", error: `Token HTTP ${tokenRes.status}` };
    const { access_token } = await tokenRes.json() as any;

    // Step2: 注文レポート取得
    const sid = ENV["AFFILIATE_VALUECOMMERCE_SID"];
    const reportRes = await fetch(
      `https://api.valuecommerce.com/v2/orders?site_id=${sid}&start_date=${START}&end_date=${END}&limit=500`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!reportRes.ok) return { ...base, status: "error", error: `Report HTTP ${reportRes.status}` };
    const data = await reportRes.json() as any;
    const orders = data?.orders ?? [];
    const conversions = orders.length;
    const revenue = orders.reduce((s: number, o: any) => s + (Number(o.publisher_income) || 0), 0);
    return { ...base, clicks: null, conversions, revenue, status: "ok" };
  } catch (e: any) {
    return { ...base, status: "error", error: e.message };
  }
}

// ── AWIN ──────────────────────────────────────────────────────────────────────
async function fetchAwin(): Promise<AspResult> {
  const token = ENV["AWIN_API_TOKEN"];
  const publisherId = ENV["AFFILIATE_AWIN_PUBLISHER_ID"];
  const base: AspResult = { name: "AWIN", clicks: null, conversions: null, revenue: null, currency: "USD", status: "no_token" };

  if (!token) return { ...base, error: "AWIN_API_TOKEN が未設定 (AWIN管理画面 > Account > API Access で取得)" };

  try {
    const res = await fetch(
      `https://api.awin.com/publishers/${publisherId}/transactions/?startDate=${START}T00%3A00%3A00&endDate=${END}T23%3A59%3A59&timezone=UTC&status=pending`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return { ...base, status: "error", error: `HTTP ${res.status}` };
    const data = await res.json() as any[];
    const conversions = data.length;
    const revenue = data.reduce((s, t) => s + (Number(t.commissionAmount?.amount) || 0), 0);
    return { ...base, clicks: null, conversions, revenue, status: "ok" };
  } catch (e: any) {
    return { ...base, status: "error", error: e.message };
  }
}

// ── CJ ────────────────────────────────────────────────────────────────────────
async function fetchCj(): Promise<AspResult> {
  const apiKey = ENV["CJ_API_KEY"];
  const cid = ENV["AFFILIATE_CJ_PID"];
  const base: AspResult = { name: "CJ", clicks: null, conversions: null, revenue: null, currency: "USD", status: "no_token" };

  if (!apiKey) return { ...base, error: "CJ_API_KEY が未設定 (CJ管理画面 > Account > API Key で取得)" };

  try {
    const res = await fetch(
      `https://commission-detail.api.cj.com/v3/commissions?publisher-id=${cid}&start-date=${START}&end-date=${END}&count=100`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!res.ok) return { ...base, status: "error", error: `HTTP ${res.status} (アカウント承認待ちの可能性あり)` };
    const data = await res.json() as any;
    const items = data?.data?.commissions ?? [];
    const conversions = items.length;
    const revenue = items.reduce((s: number, c: any) => s + (Number(c.pubCommissionAmountUsd) || 0), 0);
    return { ...base, clicks: null, conversions, revenue, status: "ok" };
  } catch (e: any) {
    return { ...base, status: "error", error: e.message };
  }
}

// ── メイン ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n📊 ASP 収益レポート`);
  console.log(`期間: ${START} 〜 ${END} (${DAYS}日間)\n`);

  const results = await Promise.all([fetchImpact(), fetchValueCommerce(), fetchAwin(), fetchCj()]);

  const w = { name: 18, clicks: 8, conv: 8, rev: 12 };
  console.log(
    "ASP".padEnd(w.name) +
    "クリック".padStart(w.clicks) +
    "成果".padStart(w.conv) +
    "報酬".padStart(w.rev) +
    "  状態"
  );
  console.log("-".repeat(60));

  for (const r of results) {
    if (r.status === "no_token" || r.status === "error") {
      console.log(`${r.name.padEnd(w.name)}${"—".padStart(w.clicks)}${"—".padStart(w.conv)}${"—".padStart(w.rev)}  ⚠ ${r.error}`);
    } else {
      const clicks = r.clicks !== null ? String(r.clicks) : "—";
      const conv = r.conversions !== null ? String(r.conversions) : "—";
      const rev = r.revenue !== null ? `${r.currency} ${r.revenue.toFixed(2)}` : "—";
      console.log(`${r.name.padEnd(w.name)}${clicks.padStart(w.clicks)}${conv.padStart(w.conv)}${rev.padStart(w.rev)}  ✓`);
    }
  }

  console.log("\n手動確認が必要なASP:");
  console.log("  Amazon   : https://affiliate.amazon.co.jp/home (JP) / https://affiliate-program.amazon.com (US)");
  console.log("  A8.net   : https://www.a8.net/a8v2/report.html");
  console.log("  もしも   : https://af.moshimo.com/af/report");
}

main().catch(console.error);
