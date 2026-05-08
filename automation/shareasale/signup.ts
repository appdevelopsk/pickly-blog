/**
 * ShareASale 新規登録 (headed, semi-automated)
 *
 * 重要:
 *   - ShareASale は審査制 (3-7営業日)。コンテンツ実質性・サイト実装完了が必須条件
 *   - フォーム多段 (Step 1: username/site, Step 2: 個人情報, Step 3: 支払い情報)
 *   - reCAPTCHA + メール認証あり
 *
 * Usage:
 *   npm run shareasale:signup
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

  console.log("→ ShareASale Affiliate Sign-up へ");
  await page.goto("https://account.shareasale.com/newsignup.cfm", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  // Step 1: username + website + password
  await safeFill(page, ["input[name='username']", "#username"], creds.username);
  await safeFill(page, ["input[name='password']", "#password"], creds.password);
  await safeFill(
    page,
    ["input[name='password2']", "input[name='confirmPassword']", "#password2"],
    creds.password,
  );
  await safeFill(
    page,
    ["input[name='website']", "input[name='url']", "input[name='websiteurl']"],
    creds.websiteUrl,
  );
  await safeFill(
    page,
    ["select[name='country']", "#country"],
    creds.country ?? "Japan",
  );

  console.log("→ Step 1 自動入力完了 — 「Next/Continue」を人間がクリックしてください");
  console.log("");
  console.log("======================================================");
  console.log("以下を順次完了してください:");
  console.log("");
  console.log("  Step 1: Username/Password/Website  (自動入力済 — Continue)");
  console.log("  Step 2: First/Last Name, Address, Phone  (自動入力試行)");
  console.log("  Step 3: Payment method (Wire/Check/PayPal)");
  console.log("  Step 4: Confirmation + email verification");
  console.log("");
  console.log("審査結果は3-7営業日後にメール通知");
  console.log("======================================================");
  console.log("");

  // Step 2 自動入力 (人間がページ遷移後)
  let prevUrl = page.url();
  let detected = false;
  for (let i = 0; i < TIMEOUT_SEC; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      break;
    }

    if (url !== prevUrl) {
      prevUrl = url;
      // 新ステップに移ったので auto-fill 試行
      console.log(`  → ページ遷移: ${url}`);
      await safeFill(page, ["input[name='firstname']", "input[name='firstName']"], creds.firstName);
      await safeFill(page, ["input[name='lastname']", "input[name='lastName']"], creds.lastName);
      await safeFill(page, ["input[name='address1']", "input[name='address']"], creds.address1);
      await safeFill(page, ["input[name='city']"], creds.city);
      await safeFill(page, ["input[name='state']"], creds.state);
      await safeFill(page, ["input[name='zip']", "input[name='postalcode']"], creds.zip);
      await safeFill(page, ["input[name='phone']", "input[name='phonenumber']"], creds.phone);
      await safeFill(page, ["input[name='email']", "input[type='email']"], creds.email);
    }

    // 完了パターン: signup-thanks や confirmation ページ
    if (
      url.includes("thank") ||
      url.includes("confirmation") ||
      url.includes("signup-complete") ||
      url.includes("/dashboard")
    ) {
      detected = true;
      console.log(`✓ 完了画面検出 (${i + 1}秒): ${url}`);
      break;
    }
    if ((i + 1) % 60 === 0) {
      process.stdout.write(`  待機中 ${i + 1}/${TIMEOUT_SEC} (${url.slice(0, 60)})\n`);
    }
  }

  if (detected) {
    await page.waitForTimeout(3000);
    console.log("✓ セッション保存");
  } else {
    console.log("✗ タイムアウト — ブラウザは閉じましたが、セッションは保存されています");
  }
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
