/**
 * vCommission 新規アフィリエイト登録 (IN / Hindi)
 *
 * - https://www.vcommission.com → "Become a Publisher"
 * - インド最大手のASP。Flipkart/Myntra/MakeMyTrip など主要ブランド
 *
 * Usage: npm run vcommission:signup
 */
import { launch } from "../shared/_browser";
import { safeFill, safeSelect, clickGoogleAuth, waitForCompletion, loadEnvFile } from "../shared/_signup-helpers";

const SIGNUP_URL = "https://www.vcommission.com/become-an-affiliate/";
const FALLBACK = "https://app.vcommission.com/affiliate/signup";

async function main() {
  const env = loadEnvFile("vcommission.env");
  const { context, page } = await launch({ headless: false, locale: "en-IN" });

  console.log("→ vCommission signup ページへ");
  await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);

  // ページに「Sign Up」ボタンがあれば click
  const startBtn = page.locator("a:has-text('Sign Up'), a:has-text('Join Now'), a:has-text('Become an Affiliate'), button:has-text('Apply Now')").first();
  if ((await startBtn.count()) > 0) {
    await startBtn.click().catch(() => {});
    await page.waitForTimeout(3000);
  }

  // フォールバック
  if (!page.url().includes("signup") && !page.url().includes("affiliate")) {
    await page.goto(FALLBACK, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/vcommission-signup.png", fullPage: false });

  const usedGoogle = await clickGoogleAuth(page, env.VC_EMAIL || "");
  if (usedGoogle) {
    console.log("✓ Google signup フロー開始");
  } else {
    console.log("→ 通常 form 自動入力");
    await safeFill(page, ["input[name='email']", "input[type='email']"], env.VC_EMAIL);
    await safeFill(page, ["input[name='password']", "input[type='password']:first"], env.VC_PASSWORD);
    await safeFill(page, ["input[name='first_name']", "input[name='firstName']", "input[name='fname']"], env.VC_FIRST_NAME);
    await safeFill(page, ["input[name='last_name']", "input[name='lastName']", "input[name='lname']"], env.VC_LAST_NAME);
    await safeFill(page, ["input[name='phone']", "input[type='tel']", "input[name='mobile']"], env.VC_PHONE);
    await safeFill(page, ["input[name='website']", "input[name='url']"], env.VC_WEBSITE_URL);
    await safeFill(page, ["input[name='company']"], env.VC_COMPANY);
    await safeFill(page, ["textarea[name='description']", "textarea[name='about']"], env.VC_DESCRIPTION);
    await safeSelect(page, ["select[name='country']"], env.VC_COUNTRY);
    await safeSelect(page, ["select[name='promotion_method']", "select[name='traffic_source']"], env.VC_PROMOTION_METHOD);
  }

  console.log("");
  console.log("======================================================");
  console.log("vCommission:");
  console.log("  - インドの ASP — 日本住所で登録可能、PAN等は不要");
  console.log("  - Sign Up → メール認証 → 審査待ち (3-7日)");
  console.log("======================================================");

  await waitForCompletion(page, 600);
  await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
