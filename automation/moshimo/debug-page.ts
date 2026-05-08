/**
 * 任意ページのHTMLとセレクタ候補をダンプする(デバッグ用)。
 * Usage:
 *   npm run moshimo:debug-page -- "https://af.moshimo.com/af/shop/media/index"
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const url = process.argv[2] ?? "https://af.moshimo.com/af/shop/media/index";

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  console.log(`→ ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // ページタイトル
  console.log("\nTitle:", await page.title());
  console.log("URL:", page.url());

  // テーブル/フォームの構造抽出
  console.log("\n=== Tables ===");
  const tableCount = await page.locator("table").count();
  for (let i = 0; i < tableCount; i++) {
    const t = page.locator("table").nth(i);
    const headers = await t.locator("th").allTextContents();
    const firstRowCells = await t.locator("tbody tr").first().locator("td").allTextContents();
    console.log(`Table ${i}: headers=${JSON.stringify(headers)}`);
    console.log(`           row0=${JSON.stringify(firstRowCells.map((c) => c.slice(0, 40)))}`);
  }

  // すべての anchor / button のテキスト
  console.log("\n=== Action elements (a/button) ===");
  const links = await page.locator("a, button").all();
  const texts: string[] = [];
  for (const l of links.slice(0, 80)) {
    const t = (await l.textContent())?.trim().slice(0, 50);
    const href = await l.getAttribute("href");
    const cls = await l.getAttribute("class");
    if (t) texts.push(`  ${t.padEnd(40)} | href=${href?.slice(0, 50) ?? ""} | class=${cls?.slice(0, 40) ?? ""}`);
  }
  for (const line of [...new Set(texts)].slice(0, 40)) console.log(line);

  // フォーム要素 (主に edit 系)
  console.log("\n=== Form fields ===");
  const forms = await page.locator("form").all();
  for (let i = 0; i < forms.length; i++) {
    const action = await forms[i].getAttribute("action");
    const inputs = await forms[i].locator("input, select, textarea").all();
    console.log(`Form ${i}: action=${action}`);
    for (const inp of inputs) {
      const name = await inp.getAttribute("name");
      const type = await inp.getAttribute("type");
      const value = await inp.getAttribute("value");
      console.log(`  ${type ?? "?"} name=${name} value=${value?.slice(0, 30) ?? ""}`);
    }
  }

  // Specific search: anything containing "Pickly"
  console.log("\n=== Pickly markers ===");
  const picklyEls = await page.locator(":has-text('Pickly')").all();
  console.log(`Found ${picklyEls.length} elements containing 'Pickly'`);

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
