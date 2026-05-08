/**
 * Redirect URI を Pinterest App に追加。
 * Usage: npx tsx pinterest/add-redirect-uri.ts <app_id> [<uri>]
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const appId = process.argv[2] ?? "1568630";
  const uri = process.argv[3] ?? "http://localhost:8080/callback";

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  await page.goto(`https://developers.pinterest.com/apps/${appId}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Redirect URIs section の input を探す
  const inputs = await page.evaluate(() => {
    const out: { idx: number; type: string; placeholder: string; name: string; id: string; visible: boolean }[] = [];
    Array.from(document.querySelectorAll("input")).forEach((el, idx) => {
      const e = el as HTMLInputElement;
      out.push({
        idx,
        type: e.type,
        placeholder: e.placeholder ?? "",
        name: e.name ?? "",
        id: e.id ?? "",
        visible: !!(e as HTMLElement).offsetParent,
      });
    });
    return out;
  });

  console.log("=== inputs (visible) ===");
  for (const i of inputs.filter((x) => x.visible).slice(0, 15)) {
    console.log(`  [${i.idx}] type=${i.type} id=${i.id || "-"} name=${i.name || "-"} placeholder="${i.placeholder.slice(0, 40)}"`);
  }

  // text inputs から redirect っぽいのを探す
  const candidates = inputs.filter(
    (i) => i.visible && i.type === "text" && (
      /redirect|uri|url|callback/i.test(i.placeholder) ||
      /redirect|uri|callback/i.test(i.id) ||
      /redirect|uri|callback/i.test(i.name)
    ),
  );
  console.log(`\n候補 input: ${candidates.length}個`);
  for (const c of candidates) console.log(`  [${c.idx}] placeholder="${c.placeholder}"`);

  let targetIdx: number | null = candidates[0]?.idx ?? null;

  // フォールバック: text input で空のもの (Redirect URI section の input は最初は空)
  if (targetIdx === null) {
    const empty = inputs.filter((i) => i.visible && i.type === "text" && !i.placeholder.includes("eg:"));
    targetIdx = empty[0]?.idx ?? null;
  }

  if (targetIdx === null) {
    console.error("✗ redirect URI input 見つからず");
    await page.screenshot({ path: "/tmp/pinterest-no-redirect-input.png", fullPage: true });
    await context.close();
    process.exit(1);
  }

  // Index で nth() してフィル
  console.log(`\n→ input[${targetIdx}] に "${uri}" を入力`);
  const allInputs = await page.locator("input").all();
  await allInputs[targetIdx].fill(uri);
  await page.waitForTimeout(500);

  // Add ボタン or Enter
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);

  // Save ボタンクリック - 通常 ページ下部
  const saveBtn = page.locator("button:has-text('Save'), button:has-text('保存'), button[type='submit']").last();
  if ((await saveBtn.count()) > 0) {
    await saveBtn.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(500);
    await saveBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: "/tmp/pinterest-redirect-added.png", fullPage: true });
  console.log("→ /tmp/pinterest-redirect-added.png に保存");

  // Verify
  const finalState = await page.evaluate((u) => {
    const text = document.body.textContent ?? "";
    return text.includes(u);
  }, uri);
  console.log(`Redirect URI 反映: ${finalState ? "✓ 確認" : "未確認(画面で要確認)"}`);

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
