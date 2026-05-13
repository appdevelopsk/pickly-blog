/**
 * CJ W-8BEN 税務情報提出
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import * as path from "path";
import * as os from "os";
import * as fsp from "fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");
const CONFIRM_CODE = "624333";

async function main() {
  await fsp.mkdir(USER_DATA_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, viewport: { width: 1280, height: 900 }, locale: "en-US",
  });
  const page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);

  await page.goto(
    "https://members.cj.com/member/app/publisher/account/settings/tax-information",
    { waitUntil: "domcontentloaded" }
  );
  try { await page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 15000 }); } catch {}
  await page.waitForTimeout(3000);

  // 「編集」クリック
  await page.locator("text=編集").first().click({ force: true });
  await page.waitForTimeout(3000);

  const body1 = await page.evaluate(() => document.body.innerText);
  console.log("After 編集:\n", body1.slice(0, 500));
  writeFileSync("/tmp/cj-tax-edit.html", await page.content());

  // 確認コード入力フィールドを探す
  const codeInput = await page.$("input[id*='confirm'], input[placeholder*='確認コード'], input[label*='確認']");
  const codeInputByLabel = page.locator("text=確認コード").locator("..").locator("input").first();

  // ラベルで探す
  const allInputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("input[type='text']")).map((e) => ({
      id: e.id,
      placeholder: (e as HTMLInputElement).placeholder,
      rect: e.getBoundingClientRect().height > 0,
      nearLabel: e.closest("div")?.querySelector("label, span")?.textContent?.trim().slice(0, 30),
    }))
  );
  console.log("Inputs:", JSON.stringify(allInputs, null, 2));

  // 確認コードフィールドに入力
  let filled = false;
  for (const inp of allInputs) {
    if (inp.nearLabel?.includes("確認コード") || inp.nearLabel?.includes("Confirmation")) {
      await page.fill(`input#${inp.id}`, CONFIRM_CODE);
      filled = true;
      console.log("Filled confirmation code into:", inp.id);
      break;
    }
  }

  if (!filled) {
    // 最後のテキスト input に入力（確認コードフィールドが最後のはず）
    const visibleInputs = await page.$$("input[type='text']:visible");
    if (visibleInputs.length > 0) {
      const lastInput = visibleInputs[visibleInputs.length - 1];
      await lastInput.fill(CONFIRM_CODE);
      filled = true;
      console.log("Filled into last visible input");
    }
  }

  await page.waitForTimeout(500);

  // 「提出」ボタンクリック
  const submitBtn = page.locator("text=提出").first();
  if (await submitBtn.count() > 0) {
    await submitBtn.click({ force: true });
    console.log("Clicked 提出");
    await page.waitForTimeout(5000);

    const body2 = await page.evaluate(() => document.body.innerText);
    console.log("After 提出:\n", body2.slice(0, 2000));
    writeFileSync("/tmp/cj-tax-after-submit.html", await page.content());
  } else {
    console.log("提出ボタンが見つかりません");
  }

  await context.close();
}
main().catch(console.error);
