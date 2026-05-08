/**
 * ArabClicks 新規アフィリエイト登録 (MENA / Arabic)
 *
 * - ArabyAds 傘下のArabClicks。MENA 最大手
 * - https://arabclicks.com → "Sign Up"
 *
 * Usage: npm run arabclicks:signup
 */
import { launch } from "../shared/_browser";
import { safeFill, safeSelect, clickGoogleAuth, waitForCompletion, loadEnvFile } from "../shared/_signup-helpers";

const SIGNUP_URL = "https://app.arabclicks.com/affiliate/signup";
const FALLBACK = "https://arabclicks.com/sign-up";

async function main() {
  const env = loadEnvFile("arabclicks.env");
  const { context, page } = await launch({ headless: false, locale: "en-US" });

  console.log("→ ArabClicks signup ページへ");
  await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);

  if (!page.url().includes("arabclicks") && !page.url().includes("arabyads")) {
    await page.goto(FALLBACK, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/arabclicks-signup.png", fullPage: false });

  const usedGoogle = await clickGoogleAuth(page, env.AC_EMAIL || "");
  if (usedGoogle) {
    console.log("✓ Google signup フロー開始");
  } else {
    console.log("→ 通常 form 自動入力");
    await safeFill(page, ["input[name='email']", "input[type='email']"], env.AC_EMAIL);
    await safeFill(page, ["input[name='password']", "input[type='password']:first"], env.AC_PASSWORD);
    await safeFill(page, ["input[name='first_name']", "input[name='firstName']"], env.AC_FIRST_NAME);
    await safeFill(page, ["input[name='last_name']", "input[name='lastName']"], env.AC_LAST_NAME);
    await safeFill(page, ["input[name='phone']", "input[type='tel']"], env.AC_PHONE);
    await safeFill(page, ["input[name='website']", "input[name='url']"], env.AC_WEBSITE_URL);
    await safeFill(page, ["input[name='company']"], env.AC_COMPANY);
    await safeFill(page, ["textarea[name='description']"], env.AC_DESCRIPTION);
    await safeSelect(page, ["select[name='country']"], env.AC_COUNTRY);
  }

  console.log("");
  console.log("======================================================");
  console.log("ArabClicks:");
  console.log("  - MENA 地域のASP — Travel/Beauty/Fashion 強い");
  console.log("  - 日本住所でも登録可能");
  console.log("  - 承認後 Noon, Namshi, AJIO 等のmerchant に申請可能");
  console.log("======================================================");

  await waitForCompletion(page, 600);
  await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
