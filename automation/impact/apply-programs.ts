/**
 * Impact.com API でVPNプログラムを検索して申請する
 * Usage: npx tsx impact/apply-programs.ts
 */
import { writeFileSync } from "node:fs";

process.loadEnvFile(new URL("../.env", import.meta.url).pathname);
const SID  = process.env.IMPACT_SID!;
const TOK  = process.env.IMPACT_TOKEN!;
const AUTH = "Basic " + Buffer.from(`${SID}:${TOK}`).toString("base64");
const BASE = `https://api.impact.com/Mediapartners/${SID}`;

const HEADERS = { Authorization: AUTH, Accept: "application/json", "Content-Type": "application/json" };

async function req(method: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: HEADERS,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json, text };
}

const TARGETS = [
  { id: "nordvpn",    keywords: ["NordVPN", "Nord VPN", "nordvpn"] },
  { id: "expressvpn", keywords: ["ExpressVPN", "Express VPN"] },
  { id: "protonvpn",  keywords: ["Proton VPN", "ProtonVPN", "Proton"] },
];

async function main() {
  // 1. APIで検索可能なエンドポイントを総当たり
  console.log("=== エンドポイント探索 ===");
  const endpoints = [
    "/Advertisers",
    "/Programs",
    "/MarketplacePrograms",
    "/Campaigns/Available",
    "/Campaigns/Marketplace",
    "/PartnerRequests",
  ];
  for (const ep of endpoints) {
    const r = await req("GET", `${ep}?PageSize=5`);
    console.log(`${ep}: ${r.status} → ${JSON.stringify(r.json).slice(0, 100)}`);
  }

  // 2. Marketplace広告主を検索 (正しいエンドポイントを探す)
  console.log("\n=== Marketplace検索 ===");
  for (const kw of ["NordVPN", "VPN", "ExpressVPN", "Proton"]) {
    const r = await req("GET", `/Advertisers?Text=${encodeURIComponent(kw)}&PageSize=20`);
    if (r.status === 200) {
      const data = r.json as Record<string, unknown>;
      const items = (data.Advertisers ?? data.advertisers ?? data.Programs ?? []) as Record<string, unknown>[];
      if (items.length > 0) {
        console.log(`"${kw}": ${items.length}件`);
        items.forEach(a => console.log(`  ${a.Id ?? a.id} | ${a.Name ?? a.name} | ${a.Status ?? a.state}`));
      }
    }
  }

  // 3. Joinエンドポイントを試す
  console.log("\n=== Join/Apply エンドポイント確認 ===");
  const joinEndpoints = [
    "/Campaigns/Join",
    "/ContractRequests",
    "/PartnerRequests",
    "/Relationships",
  ];
  for (const ep of joinEndpoints) {
    const r = await req("GET", `${ep}?PageSize=5`);
    console.log(`GET ${ep}: ${r.status} → ${JSON.stringify(r.json).slice(0, 150)}`);
  }

  // 4. 全エンドポイントのドキュメント確認
  console.log("\n=== API Root ===");
  const rootRes = await fetch("https://api.impact.com/Mediapartners", {
    headers: { Authorization: AUTH, Accept: "application/json" },
  });
  const rootText = await rootRes.text();
  console.log(`Root: ${rootRes.status} → ${rootText.slice(0, 300)}`);

  writeFileSync("/tmp/impact-api-root.txt", rootText);
}

main().catch(console.error);
