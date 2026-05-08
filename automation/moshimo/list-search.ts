/**
 * 検索結果のリストを表示する(申請前確認用)
 * Usage: npm run moshimo:list-search -- "Amazon商品紹介"
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const keyword = process.argv[2];
  if (!keyword) { console.error("Usage: keyword required"); process.exit(2); }
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  await page.goto(`https://af.moshimo.com/af/shop/promotion/search?words=${encodeURIComponent(keyword)}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const links = await page.locator("#content a[href*='/promotion/detail'], main .summary a[href*='/promotion/detail']").all();
  console.log(`\n=== "${keyword}" 検索結果 ${links.length} 件 ===\n`);
  for (let i = 0; i < links.length; i++) {
    const t = (await links[i].textContent())?.trim().slice(0, 60);
    const href = await links[i].getAttribute("href");
    const idMatch = href?.match(/promotion_id=(\d+)/);
    if (t) console.log(`  [${i}] id=${idMatch?.[1]} | ${t}`);
  }
  await context.close();
}
main();
