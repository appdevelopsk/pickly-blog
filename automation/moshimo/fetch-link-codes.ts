/**
 * もしも - 提携承認済みプロモーションのリンクコード(a_id/p_id/pc_id/pl_id)を一括抽出。
 *
 * Usage:
 *   npm run moshimo:fetch-link-codes               # stdout 出力
 *   npm run moshimo:fetch-link-codes -- --apply    # ../site/.env.local に追記
 *   npm run moshimo:fetch-link-codes -- Yahoo      # キーワードフィルタ
 *
 * 出力: .env.local 形式
 *   MOSHIMO_AMAZON_JP_A_ID=5539220
 *   MOSHIMO_AMAZON_JP_P_ID=170
 *   MOSHIMO_AMAZON_JP_PC_ID=185
 *   MOSHIMO_AMAZON_JP_PL_ID=4062
 *
 * 各プロモーションごとに固有 a_id を持つ(promotion×media 単位の affiliate_id)。
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { launch, ensureLoggedIn } from "./_browser";

const SHOP_SITE_ID = process.env.MOSHIMO_SHOP_SITE_ID ?? "671111";

interface PromotionInfo {
  promoId: string;
  name: string;
  a_id?: string;
  p_id?: string;
  pc_id?: string;
  pl_id?: string;
  envPrefix: string | null;
}

function mapEnvPrefix(name: string, promoId: string): string | null {
  // 案件名のヒントから env prefix を決定
  const text = name + " " + promoId;
  if (/Amazon|amazon/.test(text) || promoId === "170") return "MOSHIMO_AMAZON_JP";
  if (/楽天市場|rakuten\.co\.jp/.test(text) || promoId === "54") return "MOSHIMO_RAKUTEN";
  if (/Yahoo|ヤフー/.test(text) || promoId === "1225") return "MOSHIMO_YAHOO_SHOPPING";
  if (/ConoHa AI/.test(text)) return "MOSHIMO_CONOHA_AI_CANVAS";
  if (/ConoHa WING/.test(text)) return "MOSHIMO_CONOHA_WING";
  if (/楽天カード/.test(text)) return "MOSHIMO_RAKUTEN_CARD";
  if (/楽天証券/.test(text)) return "MOSHIMO_RAKUTEN_SECURITIES";
  if (/SBI証券/.test(text)) return "MOSHIMO_SBI_SECURITIES";
  if (/MyProtein|マイプロテイン/.test(text)) return "MOSHIMO_MYPROTEIN";
  if (/あすけん/.test(text)) return "MOSHIMO_ASKEN";
  if (/iHerb/.test(text)) return "MOSHIMO_IHERB";
  // フォールバック: promotion_id をベースにした汎用 prefix
  return `MOSHIMO_PROMO_${promoId}`;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const filter = args.find((a) => !a.startsWith("--"));

  const { context, page } = await launch({ headless: true });
  await ensureLoggedIn(page);

  console.log("→ 提携中プロモーション一覧へ");
  await page.goto("https://af.moshimo.com/af/shop/promotion/search?apply_status=2", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2000);

  // 提携中プロモーションのID + 名前を抽出
  const promotions = await page.evaluate((filterArg) => {
    const out: { promoId: string; name: string }[] = [];
    document.querySelectorAll("#content tr, main tr").forEach((tr) => {
      const link = tr.querySelector("a[href*='/promotion/detail']") as HTMLAnchorElement | null;
      if (!link) return;
      const m = link.href.match(/promotion_id=(\d+)/);
      if (!m) return;
      // h3/h2 や class=promotion_name 等の正式名
      const nameEl = tr.querySelector(".promotion_name, h2, h3, strong") as HTMLElement | null;
      const name = nameEl?.textContent?.trim() ?? (tr.textContent ?? "").trim().slice(0, 80);
      if (filterArg && !name.includes(filterArg)) return;
      out.push({ promoId: m[1], name });
    });
    return out;
  }, filter ?? "");

  console.log(`→ ${promotions.length} 件の提携プロモーションから抽出\n`);

  const results: PromotionInfo[] = [];

  for (const promo of promotions) {
    process.stdout.write(`  · id=${promo.promoId} ${promo.name.slice(0, 40)}…`);
    const sourceUrl = `https://af.moshimo.com/af/shop/promotion/source/anywhere?promotion_id=${promo.promoId}&shop_site_id=${SHOP_SITE_ID}`;
    try {
      await page.goto(sourceUrl, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);

      const sourceHtml = await page.evaluate(() => {
        const ta = document.querySelector("textarea[name='target_source']") as HTMLTextAreaElement | null;
        return ta?.value ?? "";
      });

      const m = sourceHtml.match(/href=['"]?(\/\/af\.moshimo\.com\/af\/c\/click[^'" ]+|https?:\/\/af\.moshimo\.com\/af\/c\/click[^'" ]+)/);
      if (!m) {
        console.log(" (URL not found)");
        results.push({ promoId: promo.promoId, name: promo.name, envPrefix: mapEnvPrefix(promo.name, promo.promoId) });
        continue;
      }
      let url = m[1];
      if (url.startsWith("//")) url = "https:" + url;
      const u = new URL(url);
      const info: PromotionInfo = {
        promoId: promo.promoId,
        name: promo.name,
        a_id: u.searchParams.get("a_id") ?? undefined,
        p_id: u.searchParams.get("p_id") ?? undefined,
        pc_id: u.searchParams.get("pc_id") ?? undefined,
        pl_id: u.searchParams.get("pl_id") ?? undefined,
        envPrefix: mapEnvPrefix(promo.name, promo.promoId),
      };
      results.push(info);
      console.log(` ✓ a_id=${info.a_id} p_id=${info.p_id} pc_id=${info.pc_id} pl_id=${info.pl_id}`);
    } catch (e) {
      console.log(` ✗ ${(e as Error).message.split("\n")[0]}`);
    }
  }

  await context.close();

  // 出力
  const lines: string[] = [];
  lines.push("# === moshimo affiliate parameters (auto-generated) ===");
  lines.push(`# Date: ${new Date().toISOString()}`);
  lines.push("");

  // Global a_id (the most common one) for backwards compat
  const aIds = results.map((r) => r.a_id).filter(Boolean) as string[];
  const dominant = aIds.sort((a, b) => aIds.filter((x) => x === a).length - aIds.filter((x) => x === b).length).pop();
  if (dominant) lines.push(`AFFILIATE_MOSHIMO_SID=${dominant}`);
  lines.push("");

  for (const r of results) {
    if (!r.envPrefix) continue;
    lines.push(`# ${r.name.replace(/\s+/g, " ").slice(0, 60)} (id=${r.promoId})`);
    if (r.a_id) lines.push(`${r.envPrefix}_A_ID=${r.a_id}`);
    if (r.p_id) lines.push(`${r.envPrefix}_P_ID=${r.p_id}`);
    if (r.pc_id) lines.push(`${r.envPrefix}_PC_ID=${r.pc_id}`);
    if (r.pl_id) lines.push(`${r.envPrefix}_PL_ID=${r.pl_id}`);
    lines.push("");
  }

  const output = lines.join("\n");
  console.log("\n" + output);

  if (apply) {
    const envPath = path.resolve(__dirname, "../../site/.env.local");
    let existing = "";
    try { existing = await fs.readFile(envPath, "utf8"); } catch {}
    // 既存の moshimo関連行を削除
    const filteredExisting = existing
      .split("\n")
      .filter((line) => !line.startsWith("MOSHIMO_") && !line.startsWith("AFFILIATE_MOSHIMO_") && !line.startsWith("# === moshimo"))
      .join("\n")
      .replace(/\n+$/, "");
    const newContent = filteredExisting + "\n\n" + output + "\n";
    await fs.writeFile(envPath, newContent);
    console.log(`\n✓ wrote to ${envPath}`);
  } else {
    console.log("# (--apply で ../site/.env.local に書き込み)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
