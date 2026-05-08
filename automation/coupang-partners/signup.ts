/**
 * Coupang Partners 新規登録 (KR)
 *
 * 注意: Coupang Partners は通常 韓国電話番号必須。日本電話で signup 可能か未確定。
 * Sign in with Google を試して、駄目なら手動。
 *
 * Usage: npm run coupang-partners:signup
 */
import { launch } from "../shared/_browser";
import { safeFill, safeSelect, clickGoogleAuth, waitForCompletion, loadEnvFile } from "../shared/_signup-helpers";

const SIGNUP_URL = "https://partners.coupang.com/#/sign-up";

async function main() {
  const env = loadEnvFile("coupang-partners.env");
  const { context, page } = await launch({
    headless: false,
    locale: "ko-KR",
    timezone: "Asia/Seoul",
  });

  console.log("→ Coupang Partners signup ページへ");
  await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/coupang-signup.png", fullPage: false });

  // Google signup を試行
  const usedGoogle = await clickGoogleAuth(page, env.COUPANG_EMAIL || "");
  if (usedGoogle) {
    console.log("✓ Google signup フロー開始");
  } else {
    console.log("→ 通常 form 自動入力");
    await safeFill(page, ["input[type='email']", "input[name='email']"], env.COUPANG_EMAIL);
    await safeFill(page, ["input[type='password']", "input[name='password']"], env.COUPANG_PASSWORD);
    await safeFill(page, ["input[name='name']", "input[name='fullName']"], env.COUPANG_NAME_KO || env.COUPANG_NAME);
    await safeFill(page, ["input[type='tel']", "input[name='phone']"], env.COUPANG_PHONE);
    await safeFill(page, ["input[name='website']", "input[name='url']"], env.COUPANG_WEBSITE_URL);
  }

  console.log("");
  console.log("======================================================");
  console.log("Coupang Partners (韓国版):");
  console.log("  - 韓国電話番号が必要な場合あり (日本番号で通らない可能性)");
  console.log("  - Google signup で email + 名前 だけ通せる場合もある");
  console.log("  - 通らない場合は SKIP — Korean は別途検討 (Cuelinks KR 等)");
  console.log("======================================================");

  await waitForCompletion(page, 600);
  await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
