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
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function main() {
  // フィルターなし全件
  console.log("全キャンペーン取得...");
  const all = await get("/Campaigns?PageSize=100");
  writeFileSync("/tmp/impact-all-campaigns.json", JSON.stringify(all, null, 2));
  console.log("total:", all["@total"]);
  const items: Record<string, unknown>[] = all.Campaigns ?? [];
  items.forEach(c => console.log(`  ${c.Id} | ${c.Name} | status=${c.Status ?? c.State}`));

  // Pending/Applied も確認
  for (const status of ["Joined", "Applied", "Pending", "Approved", "Inactive"]) {
    const r = await get(`/Campaigns?PageSize=100&Status=${status}`);
    if ((r["@total"] ?? "0") !== "0") {
      console.log(`\nStatus=${status}: ${r["@total"]}件`);
      (r.Campaigns ?? []).forEach((c: Record<string, unknown>) =>
        console.log(`  ${c.Id} | ${c.Name}`)
      );
    }
  }
}

main().catch(console.error);
