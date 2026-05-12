/**
 * Impact.com で VPN プログラムを検索して申請する
 * Usage: npx tsx impact/apply-vpn-programs.ts
 */
import { writeFileSync } from "node:fs";

process.loadEnvFile(new URL("../.env", import.meta.url).pathname);
const SID  = process.env.IMPACT_SID!;
const TOK  = process.env.IMPACT_TOKEN!;
const AUTH = "Basic " + Buffer.from(`${SID}:${TOK}`).toString("base64");
const BASE = `https://api.impact.com/Mediapartners/${SID}`;

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: AUTH, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as Record<string, unknown>;
}

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: AUTH, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`  POST ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return { status: res.status, body: text };
}

const TARGETS = ["NordVPN", "ExpressVPN", "Proton VPN", "ProtonVPN"];

async function main() {
  // 1. 自分のアカウント情報確認
  console.log("アカウント確認...");
  const me = await get("/").catch(() => ({}));
  console.log("アカウント:", JSON.stringify(me).slice(0, 200));

  // 2. 参加可能なプログラムを検索
  console.log("\nVPN プログラム検索...");
  for (const kw of ["VPN", "NordVPN", "ExpressVPN", "Proton"]) {
    const r = await get(`/Campaigns?Status=Active&PageSize=50`).catch(() => ({ Campaigns: [] }));
    const items = (r.Campaigns ?? []) as Record<string, unknown>[];
    const found = items.filter(c => String(c.Name ?? "").includes(kw));
    if (found.length > 0) {
      console.log(`keyword="${kw}": ${found.length}件`);
      found.forEach(c => console.log(`  ${c.Id} | ${c.Name} | ${c.Status}`));
    }
  }

  // 3. Market Place / 広告主カタログ検索（申請前プログラム）
  console.log("\n広告主カタログ検索...");
  const catalog = await get("/Advertisers?Status=Active&PageSize=100").catch(e => {
    console.log("Advertisers エンドポイント:", e.message.slice(0, 100));
    return { Advertisers: [] };
  });
  writeFileSync("/tmp/impact-advertisers.json", JSON.stringify(catalog, null, 2));
  const ads = (catalog.Advertisers ?? catalog.advertisers ?? []) as Record<string, unknown>[];
  console.log(`広告主 ${ads.length}件`);
  const vpnAds = ads.filter(a => TARGETS.some(t => String(a.Name ?? a.name ?? "").includes(t)));
  vpnAds.forEach(a => console.log(`  ✓ ${a.Id ?? a.id} | ${a.Name ?? a.name} | status=${a.Status ?? a.state}`));

  // 4. API エンドポイント一覧確認
  console.log("\n利用可能エンドポイント確認...");
  const root = await get("/").catch(e => ({ error: e.message }));
  writeFileSync("/tmp/impact-root.json", JSON.stringify(root, null, 2));
  console.log(JSON.stringify(root).slice(0, 500));
}

main().catch(console.error);
