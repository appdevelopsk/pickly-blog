/**
 * もしも - メディア(Pickly)のカテゴリを更新する。
 *
 * Usage:
 *   npm run moshimo:update-category                # default: IT・インターネット
 *   npm run moshimo:update-category -- "総合ショッピング"
 *
 * Notes:
 *   - もしも管理画面のカテゴリ選択肢が変動するため、エラー時は select の options を出力する
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const targetCategory = process.argv[2] ?? "IT・インターネット";

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  console.log("→ メディア管理画面へ");
  await page.goto("https://af.moshimo.com/af/shop/management/media", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Pickly行から編集リンクへ
  const picklyRow = page.locator("tr", { hasText: "Pickly" }).first();
  if ((await picklyRow.count()) === 0) {
    console.error("✗ Pickly メディア行が見つかりません");
    await context.close();
    process.exit(1);
  }

  const editLink = picklyRow.locator("a", { hasText: "編集" });
  if ((await editLink.count()) === 0) {
    // Try alternative: any link in the operation column
    console.error("✗ 編集 link が見つかりません。row HTML をダンプ:");
    console.log(await picklyRow.innerHTML());
    await context.close();
    process.exit(1);
  }
  console.log("→ Pickly 編集ページへ");
  await editLink.first().click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  // 編集ページの form を探索
  console.log(`→ カテゴリ select を探す`);
  const selects = await page.locator("select").all();
  console.log(`  ${selects.length} select 要素が見つかった`);

  let targetSelect = null;
  let availableOptions: string[] = [];
  for (const sel of selects) {
    const name = (await sel.getAttribute("name")) ?? "";
    const opts = await sel.locator("option").allTextContents();
    if (name.includes("category") || opts.includes(targetCategory) || opts.some((o) => o.includes("ショッピング") || o.includes("インターネット"))) {
      targetSelect = sel;
      availableOptions = opts;
      console.log(`  使用 select: name="${name}", options=${JSON.stringify(opts)}`);
      break;
    }
  }

  if (!targetSelect) {
    console.error("✗ カテゴリ select が見つかりません");
    for (const sel of selects) {
      const name = await sel.getAttribute("name");
      const opts = await sel.locator("option").allTextContents();
      console.log(`  select name="${name}", options=${JSON.stringify(opts.slice(0, 5))}`);
    }
    await context.close();
    process.exit(1);
  }

  if (!availableOptions.includes(targetCategory)) {
    console.error(`✗ "${targetCategory}" は選択肢にありません。available: ${JSON.stringify(availableOptions)}`);
    await context.close();
    process.exit(1);
  }

  console.log(`→ カテゴリを「${targetCategory}」に変更`);
  await targetSelect.selectOption({ label: targetCategory });

  // Submit
  console.log("→ 送信");
  const submitBtns = page.locator("button[type='submit'], input[type='submit']");
  const submitCount = await submitBtns.count();
  console.log(`  ${submitCount} submit ボタンが見つかった`);
  if (submitCount === 0) {
    console.error("✗ submit ボタンが見つからない");
    await context.close();
    process.exit(1);
  }
  await submitBtns.first().click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2000);

  // Confirm 画面が出る場合
  const confirmBtn = page.locator("button:has-text('登録'), button:has-text('確定'), input[value*='登録'], input[value*='確定'], button:has-text('変更')").first();
  if ((await confirmBtn.count()) > 0) {
    console.log("→ 確認画面で確定");
    await confirmBtn.click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
  }

  console.log(`✓ Pickly カテゴリを「${targetCategory}」に更新`);
  await page.waitForTimeout(1500);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
