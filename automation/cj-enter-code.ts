/**
 * CJ 確認コード入力 → W-8BEN フォーム記入・提出
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import * as path from "path";
import * as os from "os";
import * as fsp from "fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");
const CONFIRM_CODE = "800592";

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

  // 確認コード入力フィールドの現在値をクリアしてキーボードで入力
  const inputLocator = page.locator('[data-testid="verification-code-input"]');
  await inputLocator.click({ force: true });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(CONFIRM_CODE, { delay: 80 });
  console.log("Typed code:", CONFIRM_CODE);
  await page.waitForTimeout(500);

  // 入力値確認
  const currentVal = await inputLocator.inputValue().catch(() => "n/a");
  console.log("Input value:", currentVal);

  // 提出ボタンクリック
  const submitResult = await page.evaluate(() => {
    // テキストで提出ボタンを探す
    const btns = Array.from(document.querySelectorAll("button"));
    const submitBtn = btns.find((b) => b.textContent?.trim() === "提出");
    if (submitBtn) {
      submitBtn.click();
      return "submitted: " + submitBtn.textContent;
    }
    return "submit not found, buttons: " + btns.map((b) => b.textContent?.trim()).join(", ");
  });
  console.log("Submit result:", submitResult);
  await page.waitForTimeout(6000);

  const body = await page.evaluate(() => document.body.innerText);
  console.log("After code submit:\n", body.slice(0, 3000));
  writeFileSync("/tmp/cj-after-code.html", await page.content());

  await context.close();
}
main().catch(console.error);
