/**
 * Impact.com アカウント完了 + VPN申請 (手動操作支援)
 * headless:false で開いてユーザーが手動操作できるようにする
 * Cloudflare Turnstile があるため自動化不可
 */
import { chromium } from "playwright";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const EMAIL = process.env.IMPACT_EMAIL!;
const PASSWORD = process.env.IMPACT_PASSWORD!;

async function main() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
    ],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(120000);

  console.log("\n====== Impact.com ログイン ======");
  console.log("メール:", EMAIL);
  console.log("パスワード:", PASSWORD);
  console.log("\nブラウザが開きます。以下を手動で実施してください:");
  console.log("  1. ログイン (必要なら CAPTCHA を解く)");
  console.log("  2. アカウント完了フォームがあれば入力");
  console.log("  3. Marketplace で以下に Apply:");
  console.log("     - NordVPN");
  console.log("     - ExpressVPN");  
  console.log("     - ProtonVPN");
  console.log("\n完了したらこのウィンドウを閉じてください (最大15分待機)");
  console.log("================================================\n");

  await page.goto("https://app.impact.com/login.user", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // メール自動入力を試みる
  const emailField = await page.$('input[type="email"], input[name="email"], input[name="username"], #username');
  if (emailField && await emailField.isVisible()) {
    await emailField.fill(EMAIL);
    console.log("→ メール自動入力済み");
  }

  // パスワード自動入力
  const passField = await page.$('input[type="password"]');
  if (passField && await passField.isVisible()) {
    await passField.fill(PASSWORD);
    console.log("→ パスワード自動入力済み");
    console.log("→ Captchaがあれば手動で解いてください");
  }

  // 最大15分待機
  for (let i = 0; i < 90; i++) {
    await page.waitForTimeout(10000);
    const url = page.url();
    const isClosed = page.isClosed();
    if (isClosed) {
      console.log("\n✓ ブラウザが閉じられました");
      break;
    }
    console.log(`  ${(i + 1) * 10}s / 900s (${url.slice(0, 60)})`);

    if (url.includes("dashboard") || url.includes("partner") || url.includes("secure")) {
      console.log("\n✅ ダッシュボード確認！ Marketplaceで申請してください");
      console.log("Marketplace URL: https://app.impact.com/secure/mediapartner/marketplace/search.ihtml");
    }
  }

  await browser.close();
  console.log("\n完了");
}

main().catch(console.error);
