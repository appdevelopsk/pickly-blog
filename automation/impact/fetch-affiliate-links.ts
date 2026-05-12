/**
 * Impact.com REST API から参加中プログラムのトラッキングリンクを取得する
 * Usage: npx tsx impact/fetch-affiliate-links.ts
 */
import { writeFileSync } from "node:fs";

process.loadEnvFile(new URL("../.env", import.meta.url).pathname);
const ACCOUNT_SID  = process.env.IMPACT_SID!;
const AUTH_TOKEN   = process.env.IMPACT_TOKEN!;
const BASE         = `https://api.impact.com/Mediapartners/${ACCOUNT_SID}`;
const AUTH         = "Basic " + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

const TARGETS = ["NordVPN", "ExpressVPN", "Proton"];

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: AUTH, Accept: "application/json" },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${path}: ${t.slice(0, 200)}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

async function main() {
  // 1. 参加中キャンペーン一覧
  console.log("参加中キャンペーン取得中...");
  const campaigns = await get("/Campaigns?Status=Active&PageSize=100");
  writeFileSync("/tmp/impact-campaigns.json", JSON.stringify(campaigns, null, 2));

  const items = (campaigns.Campaigns ?? campaigns.data ?? []) as Record<string, unknown>[];
  console.log(`✓ ${items.length}件`);

  const matched: Record<string, unknown>[] = [];
  for (const c of items) {
    const name = String(c.Name ?? c.name ?? c.CampaignName ?? "");
    if (TARGETS.some(t => name.includes(t))) {
      console.log(`  ✓ ${name} (ID: ${c.Id ?? c.id ?? c.CampaignId})`);
      matched.push(c);
    }
  }

  if (matched.length === 0) {
    console.log("\n対象キャンペーンが見つかりません。全件を確認:");
    items.slice(0, 20).forEach(c => console.log(`  ${c.Name ?? c.name} / ID=${c.Id ?? c.id}`));
    console.log("\n全件: /tmp/impact-campaigns.json");
    return;
  }

  // 2. 各キャンペーンのトラッキングリンク取得
  const results: Record<string, string> = {};

  for (const c of matched) {
    const campaignId = String(c.Id ?? c.id ?? c.CampaignId ?? "");
    const name       = String(c.Name ?? c.name ?? "");
    console.log(`\nリンク取得: ${name} (${campaignId})`);

    try {
      // トラッキングリンク一覧
      const links = await get(`/Campaigns/${campaignId}/Links?LinkType=TEXT&PageSize=20`);
      writeFileSync(`/tmp/impact-links-${campaignId}.json`, JSON.stringify(links, null, 2));

      const linkItems = (links.Links ?? links.data ?? []) as Record<string, unknown>[];
      if (linkItems.length > 0) {
        const first = linkItems[0];
        const url = String(first.TrackingLink ?? first.Url ?? first.url ?? first.ClickUrl ?? "");
        console.log(`  ✓ リンク: ${url}`);
        const key = TARGETS.find(t => name.includes(t))?.toLowerCase().replace(" ", "") ?? name;
        results[key] = url;
      } else {
        // デフォルトトラッキングURL を生成
        const trackingUrl = String(c.TrackingLink ?? c.DefaultTrackingLink ?? "");
        if (trackingUrl) {
          console.log(`  ✓ デフォルト: ${trackingUrl}`);
          const key = TARGETS.find(t => name.includes(t))?.toLowerCase().replace(" ", "") ?? name;
          results[key] = trackingUrl;
        } else {
          console.log("  ✗ リンク未取得");
          console.log("  キャンペーン詳細:", JSON.stringify(c, null, 2).slice(0, 300));
        }
      }
    } catch (err) {
      console.log(`  ✗ エラー: ${err}`);
    }
  }

  writeFileSync("/tmp/impact-affiliate-links.json", JSON.stringify(results, null, 2));
  console.log("\n=== 結果 ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
