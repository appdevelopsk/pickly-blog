/**
 * Impact.com Partner Sign-up (headed, semi-automated)
 *
 * Impact は招待制 + 自由登録両対応。サイトURLは https://app.impact.com/secure/signup/partner
 * 審査は1-3営業日 (場合により1週間+)
 *
 * Usage:
 *   npm run impact:signup
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

  console.log("→ Impact Partner Sign-up へ");
  await page.goto("https://app.impact.com/secure/signup/partner.ihtml", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(2000);

  await safeFill(page, ["input[name='email']", "input[type='email']", "#email"], creds.email);
  await safeFill(page, ["input[name='password']", "input[type='password']", "#password"], creds.password);
  await safeFill(page, ["input[name='firstName']", "#firstName"], creds.firstName);
  await safeFill(page, ["input[name='lastName']", "#lastName"], creds.lastName);
  await safeFill(
    page,
    ["input[name='companyName']", "input[name='company']", "#companyName"],
    creds.companyName,
  );
  await safeFill(
    page,
    ["input[name='websiteUrl']", "input[name='website']", "#websiteUrl"],
    creds.websiteUrl,
  );
  await safeFill(page, ["input[name='phone']", "#phone"], creds.phone);

  console.log("");
  console.log("======================================================");
  console.log("ブラウザで以下を完了してください:");
  console.log("  1. CAPTCHA / 利用規約同意");
  console.log("  2. メール認証");
  console.log("  3. プロフィール詳細 (月間訪問者数 / 主要カテゴリ)");
  console.log("");
  console.log("Impact 審査: 1-3営業日");
  console.log(`待機 ${TIMEOUT_SEC}秒...`);
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
    if (url.includes("/dashboard") || url.includes("/mediapartner") || url.includes("welcome")) {
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
