/**
 * Submit 後の状態確認 + 必要なら再Submit
 */
import { chromium } from "playwright";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const PINTEREST_EMAIL = process.env.PINTEREST_EMAIL!;
const PINTEREST_PASSWORD = process.env.PINTEREST_PASSWORD!;

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // Pinterest ログイン
  await page.goto("https://www.pinterest.com/login/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.fill('input[name="id"]', PINTEREST_EMAIL);
  await page.fill('input[name="password"]', PINTEREST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // アップグレードページへ
  await page.goto("https://developers.pinterest.com/apps/1568630/upgrade", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());

  const bodyText = await page.innerText("body").catch(() => "");
  console.log("ページテキスト（最初1000文字）:", bodyText.slice(0, 1000));
  await page.screenshot({ path: "/tmp/upgrade-status.png", fullPage: true });
  console.log("スクリーンショット: /tmp/upgrade-status.png");

  // 申請済みかどうか確認
  if (
    bodyText.includes("submitted") ||
    bodyText.includes("申請") ||
    bodyText.includes("review") ||
    bodyText.includes("pending") ||
    bodyText.includes("受付")
  ) {
    console.log("✅ 申請済みの可能性があります");
  } else if (bodyText.includes("Submit")) {
    console.log("フォームがまだあります。Submit ボタンを探します...");
    const submitBtn = await page.$("button:has-text('Submit')");
    if (submitBtn) {
      console.log("Submit をクリック（networkidle なしで待機）...");
      await submitBtn.click();
      // 5秒待ってスクリーンショット
      await page.waitForTimeout(5000);
      await page.screenshot({ path: "/tmp/upgrade-after-submit.png", fullPage: true });
      console.log("送信後スクリーンショット: /tmp/upgrade-after-submit.png");
      const afterText = await page.innerText("body").catch(() => "");
      console.log("送信後テキスト:", afterText.slice(0, 500));
    }
  }

  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch(console.error);
