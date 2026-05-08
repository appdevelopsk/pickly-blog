/**
 * CJ Affiliate (Commission Junction) 新規登録 (US/UK/EU)
 *
 * - https://www.cj.com → "Become a Publisher"
 * - 米系大手の老舗 ASP。NordVPN/Norton/McAfee/Booking.com 等の大手と提携
 * - 厳格な審査 (3-7日)。サイトが英語コンテンツで実質性が必要
 *
 * Usage: npm run cj:signup
 */
import { launch } from "../shared/_browser";
import { safeFill, safeSelect, clickGoogleAuth, waitForCompletion, loadEnvFile } from "../shared/_signup-helpers";

const SIGNUP_URL = "https://signup.cj.com/member/signup/publisher/";
const FALLBACK = "https://www.cj.com/publisher-sign-up";

async function main() {
  const env = loadEnvFile("cj.env");
  const { context, page } = await launch({ headless: false, locale: "en-US" });

  console.log("→ CJ Affiliate signup ページへ");
  await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);

  if (!page.url().includes("cj.com")) {
    await page.goto(FALLBACK, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/cj-signup.png", fullPage: false });

  const usedGoogle = await clickGoogleAuth(page, env.CJ_EMAIL || "");
  if (usedGoogle) {
    console.log("✓ Google signup フロー開始");
  } else {
    console.log("→ 通常 form 自動入力");
    await safeFill(page, ["input[name='email']", "input[type='email']", "input[name='username']"], env.CJ_EMAIL);
    await safeFill(page, ["input[name='password']", "input[type='password']:first"], env.CJ_PASSWORD);
    await safeFill(page, ["input[name='firstName']", "input[name='first_name']"], env.CJ_FIRST_NAME);
    await safeFill(page, ["input[name='lastName']", "input[name='last_name']"], env.CJ_LAST_NAME);
    await safeFill(page, ["input[name='phone']", "input[type='tel']"], env.CJ_PHONE);
    await safeFill(page, ["input[name='companyName']", "input[name='company']"], env.CJ_COMPANY);
    await safeFill(page, ["input[name='url']", "input[name='website']", "input[name='websiteUrl']"], env.CJ_WEBSITE_URL);
    await safeFill(page, ["textarea[name='description']", "textarea[name='siteDescription']"], env.CJ_DESCRIPTION);
    await safeSelect(page, ["select[name='country']"], env.CJ_COUNTRY);
  }

  console.log("");
  console.log("======================================================");
  console.log("CJ Affiliate:");
  console.log("  - 米国大手ASP — 厳格な審査");
  console.log("  - サイトが英語で実質的なコンテンツがあること必須");
  console.log("  - Tax info (W-8BEN) Amazon US で通したのと同じものを使う");
  console.log("  - 承認まで 3-7 営業日");
  console.log("======================================================");

  await waitForCompletion(page, 600);
  await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
