/**
 * Hotmart 新規アフィリエイト登録 (PT-BR / Brazil)
 *
 * Hotmart は ブラジル発のデジタルプロダクト ASP。
 * - https://hotmart.com → "Tornar-se afiliado" (Become an affiliate)
 * - PT/EN/ES の言語切替あり
 *
 * Usage: npm run hotmart:signup
 */
import { launch } from "../shared/_browser";
import { safeFill, safeSelect, safeClick, clickGoogleAuth, waitForCompletion, loadEnvFile } from "../shared/_signup-helpers";

const SIGNUP_URL = "https://hotmart.com/en/signup-affiliate";
const FALLBACK = "https://app-vlc.hotmart.com/signup?lang=en";
const FALLBACK2 = "https://app.hotmart.com/signup";

async function main() {
  const env = loadEnvFile("hotmart.env");
  const { context, page } = await launch({ headless: false, locale: "en-US" });

  console.log("→ Hotmart signup ページへ");
  await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);

  // Page not found チェック: 404 ページなら fallback
  let bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => "");
  if (bodyText.includes("Page not found") || bodyText.includes("404")) {
    console.log("→ 404 — fallback 1 試行");
    await page.goto(FALLBACK, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
    bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => "");
  }
  if (bodyText.includes("Page not found") || bodyText.includes("404")) {
    console.log("→ 404 — fallback 2 試行");
    await page.goto(FALLBACK2, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/hotmart-signup.png", fullPage: false });

  // Google signup を試行 (Hotmart は Google OAuth 対応)
  const usedGoogle = await clickGoogleAuth(page, env.HOTMART_EMAIL || "");
  if (usedGoogle) {
    console.log("✓ Google signup フロー開始");
  } else {
    console.log("→ 通常 form 自動入力");
    await safeFill(page, ["input[name='email']", "input[type='email']"], env.HOTMART_EMAIL);
    await safeFill(page, ["input[name='password']", "input[type='password']:first"], env.HOTMART_PASSWORD);
    await safeFill(page, ["input[name='firstName']", "input[name='first_name']", "input[name='name']"], env.HOTMART_FIRST_NAME);
    await safeFill(page, ["input[name='lastName']", "input[name='last_name']", "input[name='surname']"], env.HOTMART_LAST_NAME);
    await safeFill(page, ["input[name='phone']", "input[type='tel']"], env.HOTMART_PHONE);
    await safeSelect(page, ["select[name='country']", "select[name='country_code']"], env.HOTMART_COUNTRY);
  }

  console.log("");
  console.log("======================================================");
  console.log("Hotmart の残りステップを手動で完了してください:");
  console.log("  - パスワード入力 (Google使用時は不要)");
  console.log("  - 同意 + reCAPTCHA");
  console.log("  - メール認証 (app.develop.sk@gmail.com 受信)");
  console.log("======================================================");

  await waitForCompletion(page, 600);
  await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
