/**
 * Amazon Associates US sign-up (headed, semi-automated)
 *
 * フロー:
 *   1. https://affiliate-program.amazon.com/ → "Sign up"
 *   2. Amazon.com アカウントログイン (既存 or 新規)
 *   3. Payee info → Website info → Profile (preferred store, topics, traffic, drives)
 *   4. CAPTCHA → Submit → Tracking ID 表示
 *   5. (後日) Tax interview (W-8BEN) を別途完了
 *
 * 重要: 180日以内に3件売上達成しないとアカウント剥奪。
 *       Pickly のように pinterest 流入があるなら現実的。
 *
 * Usage:
 *   npm run amazon-us:signup
 */
import { launch, loadCredentials } from "./_browser";

const TIMEOUT_SEC = 900;

async function safeFill(page: any, selectors: string[], value?: string): Promise<boolean> {
  if (!value) return false;
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
      await loc.fill(value);
      return true;
    }
  }
  return false;
}

async function main() {
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ Amazon Associates US 登録ページへ");
  await page.goto("https://affiliate-program.amazon.com/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  // Sign up ボタン
  for (const sel of [
    "a:has-text('Sign up')",
    "a:has-text('Join Now')",
    "a[href*='/home']",
  ]) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
      await loc.click().catch(() => {});
      console.log(`✓ Sign up クリック (${sel})`);
      break;
    }
  }
  await page.waitForTimeout(3000);

  await safeFill(page, ["input[name='email']", "input[type='email']", "#ap_email"], creds.email);
  await safeFill(page, ["input[name='password']", "#ap_password"], creds.password);

  console.log("");
  console.log("======================================================");
  console.log("ブラウザで以下を完了してください:");
  console.log("");
  console.log("  1. Amazon.com アカウントでログイン (新規ならアカウント作成)");
  console.log("  2. Payee info: 名前 + 住所 + 電話 (US形式 or international)");
  console.log("  3. Website info: pickly.blog + サイト説明");
  console.log("  4. Profile: preferred store / topics / traffic source / monthly UV");
  console.log("  5. CAPTCHA を解く");
  console.log("  6. Submit → Tracking ID (pickly-20 等) 表示");
  console.log("");
  console.log("⚠ 180日以内に3件売上達成必須 (pinterest 流入で達成可能)");
  console.log("⚠ Tax interview (W-8BEN) は登録後 Account → Tax から完了");
  console.log("======================================================");

  let detected = false;
  for (let i = 0; i < TIMEOUT_SEC; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      break;
    }
    if (
      (url.includes("affiliate-program.amazon.com") &&
        (url.includes("/home") || url.includes("/welcome") || url.includes("/dashboard"))) ||
      url.includes("storeId=")
    ) {
      detected = true;
      console.log(`✓ 完了 (${i + 1}秒): ${url}`);
      break;
    }
    if ((i + 1) % 60 === 0) {
      process.stdout.write(`  ${i + 1}/${TIMEOUT_SEC} (${url.slice(0, 60)})\n`);
    }
  }

  if (detected) await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
