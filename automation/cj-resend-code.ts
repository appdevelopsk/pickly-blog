/**
 * CJ 確認コード再送信
 */
import { chromium } from "playwright";
import * as path from "path";
import * as os from "os";
import * as fsp from "fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");

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

  // 「確認コードをもう一度送信する」をクリック
  const resend = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll("span.vsx-clickable, a, button"));
    const resendEl = spans.find((e) => e.textContent?.includes("もう一度送信"));
    if (resendEl) {
      (resendEl as HTMLElement).click();
      return "resent: " + resendEl.textContent?.trim();
    }
    return "resend not found";
  });
  console.log(resend);
  await page.waitForTimeout(3000);

  const body = await page.evaluate(() => document.body.innerText);
  console.log("After resend:\n", body.slice(0, 300));

  await context.close();
  console.log("\n✅ 新しい確認コードを app.develop.sk@gmail.com に送信しました");
}
main().catch(console.error);
