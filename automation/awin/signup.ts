/**
 * Awin Publisher Sign-up (旧 ShareASale も含む)
 *
 * 重要:
 *   - $5 (or local equivalent) のデポジット必須。Refundable: 申請通過 or 初回$20commission到達時
 *   - W-8BEN (海外publisher) — Account → Tax Info で登録
 *   - 審査: 1-3営業日が一般的
 *
 * Usage:
 *   npm run awin:signup
 */
import { launch, loadCredentials } from "./_browser";

const TIMEOUT_SEC = 1200;

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

  console.log("→ Awin Publisher Sign-up へ");
  await page.goto("https://www.awin.com/us/getting-started-sas", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  // Awinはセッションごとに登録ボタン経由でフォームへ
  for (const sel of [
    "a:has-text('Sign up')",
    "a:has-text('Get started')",
    "a:has-text('Become a publisher')",
    "a[href*='signup']",
    "a[href*='register']",
  ]) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
      await loc.click().catch(() => {});
      console.log(`✓ Sign up クリック (${sel})`);
      break;
    }
  }
  await page.waitForTimeout(3000);

  // 各入力欄を試行
  await safeFill(page, ["input[name='email']", "input[type='email']", "#email"], creds.email);
  await safeFill(
    page,
    ["input[name='password']", "input[type='password']", "#password"],
    creds.password,
  );
  await safeFill(page, ["input[name='firstName']", "input[name='first_name']", "#firstName"], creds.firstName);
  await safeFill(page, ["input[name='lastName']", "input[name='last_name']", "#lastName"], creds.lastName);
  await safeFill(
    page,
    ["input[name='phoneNumber']", "input[name='phone']", "input[type='tel']", "#phone"],
    creds.phone,
  );
  await safeFill(
    page,
    ["input[name='websiteUrl']", "input[name='website']", "input[name='url']", "#website"],
    creds.websiteUrl,
  );
  await safeFill(page, ["input[name='websiteName']", "input[name='siteName']"], creds.websiteName);
  await safeFill(
    page,
    ["textarea[name='description']", "textarea[name='websiteDescription']"],
    creds.websiteDescription,
  );

  console.log("");
  console.log("======================================================");
  console.log("Awin signup フロー (まだ手動が必要):");
  console.log("");
  console.log("  1. 自動入力されていない欄を埋める (Country, Promotion methods等)");
  console.log("  2. 利用規約同意 + reCAPTCHA");
  console.log("  3. Email verification (受信ボックス確認)");
  console.log("  4. $5 deposit (クレジットカード or 一部地域はPayPal)");
  console.log("  5. W-8BEN (Tax Info) — Account → Tax から登録");
  console.log("  6. 審査結果メール待ち (1-3営業日)");
  console.log("");
  console.log("⚠ \\$5 デポジットは初回$20commission到達 or 申請通過時に払戻");
  console.log("⚠ Promotion methods のチェック例: Content Site / Comparison / Review");
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
    // 完了検出は厳しめ: 真のダッシュボード(/dashboard or /publisher with logged session)のみ。
    // 中間ページの ui.awin.com 等では止めない (誤検出回避)
    if (url.includes("ui.awin.com/dashboard") || url.includes("publisher.awin.com/main")) {
      detected = true;
      console.log(`✓ ダッシュボード到達 (${i + 1}秒): ${url}`);
      break;
    }
    if ((i + 1) % 60 === 0) {
      process.stdout.write(`  ${i + 1}/${TIMEOUT_SEC} (${url.slice(0, 80)})\n`);
    }
  }

  if (detected) await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
