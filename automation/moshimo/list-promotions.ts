/**
 * 申請中・提携中 のプロモーションを id 含めて一覧表示
 */
import { launch, ensureLoggedIn } from "./_browser";

async function listStatus(page: import("playwright").Page, status: number, label: string) {
  await page.goto(`https://af.moshimo.com/af/shop/promotion/search?apply_status=${status}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const items = await page.evaluate(() => {
    const results: { name: string; promoId?: string }[] = [];
    document.querySelectorAll("a[href*='/promotion/detail']").forEach((a) => {
      const href = (a as HTMLAnchorElement).href;
      const m = href.match(/promotion_id=(\d+)/);
      const text = (a.textContent ?? "").trim();
      if (m && text && !text.includes("詳細条件へ")) {
        results.push({ name: text.slice(0, 60), promoId: m[1] });
      }
    });
    // Get promotion names from table rows
    const rowNames: string[] = [];
    document.querySelectorAll("#content table tbody tr, main table tbody tr").forEach((tr) => {
      const text = (tr.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 100);
      if (text && !text.match(/^\s*$/)) rowNames.push(text);
    });
    return { results, rowNames };
  });

  console.log(`\n=== ${label} ===`);
  if (items.rowNames.length === 0) {
    console.log("  (なし)");
  } else {
    for (const r of items.rowNames) console.log(`  · ${r}`);
  }
}

async function main() {
  const { context, page } = await launch({ headless: true });
  await ensureLoggedIn(page);

  await listStatus(page, 1, "申請中");
  await listStatus(page, 2, "提携中");
  await listStatus(page, 3, "否認");
  await context.close();
}
main();
