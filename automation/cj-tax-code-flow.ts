/**
 * CJ 確認コード再送信 → コード入力 → 提出（一連の流れ）
 * Usage: CODE=123456 npx tsx cj-tax-code-flow.ts
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import * as path from "path";
import * as os from "os";
import * as fsp from "fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");
const CONFIRM_CODE = process.env.CODE ?? "";

async function main() {
  if (!CONFIRM_CODE) {
    // コードなし → 再送信のみ
    console.log("CODE env not set → resending code only");
  }

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
  await page.waitForTimeout(2000);

  // 「編集」クリック
  await page.locator("text=編集").first().click({ force: true });
  await page.waitForTimeout(2000);

  const bodyAfterEdit = await page.evaluate(() => document.body.innerText);
  const hasCodeInput = bodyAfterEdit.includes("確認コード");
  console.log("Confirmation code screen:", hasCodeInput);

  if (!CONFIRM_CODE) {
    // コードなしモード: 再送信してブラウザを閉じる
    const resend = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll("span, a, button"));
      const el = spans.find((e) => e.textContent?.includes("もう一度送信"));
      if (el) { (el as HTMLElement).click(); return "resent: " + el.textContent?.trim(); }
      return "resend not found";
    });
    console.log(resend);
    await page.waitForTimeout(2000);
    await context.close();
    console.log("\n✅ 新しい確認コードを app.develop.sk@gmail.com に送信しました");
    console.log("次のコマンドでコードを入力してください:");
    console.log("  CODE=<6桁> npx tsx automation/cj-tax-code-flow.ts");
    return;
  }

  // コードありモード: 直接入力
  console.log("Entering code:", CONFIRM_CODE);
  const inputLocator = page.locator('[data-testid="verification-code-input"]');
  await inputLocator.click({ force: true });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(CONFIRM_CODE, { delay: 80 });
  await page.waitForTimeout(500);

  const currentVal = await inputLocator.inputValue().catch(() => "n/a");
  console.log("Input value:", currentVal);

  // 「提出」クリック
  const submitResult = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent?.trim() === "提出");
    if (btn) { btn.click(); return "submitted"; }
    return "submit not found, buttons: " + btns.map((b) => b.textContent?.trim()).join(" | ");
  });
  console.log("Submit:", submitResult);
  await page.waitForTimeout(6000);

  const body = await page.evaluate(() => document.body.innerText);
  console.log("After submit:\n", body.slice(0, 3000));
  writeFileSync("/tmp/cj-tax-after-code.html", await page.content());

  await context.close();
}
main().catch(console.error);
