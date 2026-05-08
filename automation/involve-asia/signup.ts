/**
 * Involve Asia 新規アフィリエイト登録 (semi-automated)
 *
 * 共有 Google profile を使う:
 *   - npm run google:signin で1度サインイン済 (~/.cache/pickly-playwright/shared-google/)
 *   - 「Sign up with Google」が表示されれば即時通る
 *   - 通常 form の場合は credential 自動入力
 *
 * Usage: npm run involve-asia:signup
 */
import { launch } from "../shared/_browser";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { Page } from "playwright";

const SIGNUP_URL = "https://invl.io/affiliate-signup";
const FALLBACK_URL = "https://involve.asia/sign-up";

interface Creds {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  websiteUrl?: string;
  websiteName?: string;
  country?: string;
  description?: string;
  trafficSource?: string;
}

function loadCreds(): Creds {
  const file = path.join(os.homedir(), ".config/pickly/involve-asia.env");
  if (!fs.existsSync(file)) return {};
  const c = fs.readFileSync(file, "utf8");
  const pick = (k: string) => c.match(new RegExp(`^${k}=["']?([^"'\\n]+)["']?`, "m"))?.[1];
  return {
    email: pick("INVOLVE_EMAIL"),
    password: pick("INVOLVE_PASSWORD"),
    firstName: pick("INVOLVE_FIRST_NAME"),
    lastName: pick("INVOLVE_LAST_NAME"),
    company: pick("INVOLVE_COMPANY"),
    phone: pick("INVOLVE_PHONE"),
    websiteUrl: pick("INVOLVE_WEBSITE_URL"),
    websiteName: pick("INVOLVE_WEBSITE_NAME"),
    country: pick("INVOLVE_COUNTRY"),
    description: pick("INVOLVE_DESCRIPTION"),
    trafficSource: pick("INVOLVE_TRAFFIC_SOURCE"),
  };
}

async function safeFill(page: Page, sels: string[], val?: string): Promise<boolean> {
  if (!val) return false;
  for (const s of sels) {
    const loc = page.locator(s).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible({ timeout: 1500 }).catch(() => false))) {
        await loc.fill(val);
        return true;
      }
    } catch {}
  }
  return false;
}

async function safeSelect(page: Page, sels: string[], val?: string): Promise<boolean> {
  if (!val) return false;
  for (const s of sels) {
    const loc = page.locator(s).first();
    try {
      if ((await loc.count()) > 0) {
        await loc.selectOption({ label: val }).catch(() => loc.selectOption(val));
        return true;
      }
    } catch {}
  }
  return false;
}

async function main() {
  const creds = loadCreds();
  const { context, page } = await launch({ headless: false, locale: "en-US" });

  console.log("→ Involve Asia signup ページへ");
  await page.goto(SIGNUP_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // フォールバック URL
  if (!page.url().includes("involve.asia") && !page.url().includes("invl.io")) {
    await page.goto(FALLBACK_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  console.log(`現在URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/involve-signup.png", fullPage: false });

  // 「Sign up with Google」ボタンがあれば click → 共有プロファイルが自動的に通す
  const googleSignupBtn = page
    .locator("button:has-text('Sign up with Google'), a:has-text('Sign up with Google'), button:has-text('Continue with Google'), a:has-text('Continue with Google'), [class*='google'], iframe[title*='Google']")
    .first();
  const hasGoogleBtn = (await googleSignupBtn.count().catch(() => 0)) > 0;
  console.log(`Google signup button: ${hasGoogleBtn ? "✓ あり" : "✗ 無し"}`);

  if (hasGoogleBtn) {
    console.log("→ Sign up with Google をクリック");
    await googleSignupBtn.click().catch(() => {});
    await page.waitForTimeout(5000);

    // Google OAuth popup が出るか、リダイレクトで遷移するか
    // 共有profileなのでpassword不要 → "Choose account" で app.develop.sk@gmail.com クリック
    const accountBtn = page
      .locator(`div[data-email='${creds.email}'], div:has-text('${creds.email}'), li:has-text('${creds.email}')`)
      .first();
    if ((await accountBtn.count()) > 0) {
      console.log("→ アカウント選択");
      await accountBtn.click().catch(() => {});
      await page.waitForTimeout(4000);
    }
  } else {
    // 通常 form
    console.log("→ 通常 form 自動入力");
    await safeFill(page, ["input[name='email']", "input[type='email']", "input[id*='email']"], creds.email);
    await safeFill(page, ["input[name='password']", "input[type='password']:not([name='confirm_password']):not([id*='confirm'])"], creds.password);
    await safeFill(page, ["input[name='confirm_password']", "input[id*='confirm']", "input[name='password_confirmation']"], creds.password);
    await safeFill(page, ["input[name='first_name']", "input[name='firstName']"], creds.firstName);
    await safeFill(page, ["input[name='last_name']", "input[name='lastName']"], creds.lastName);
    await safeFill(page, ["input[name='full_name']", "input[name='name']"], `${creds.firstName} ${creds.lastName}`);
    await safeFill(page, ["input[name='company']", "input[name='company_name']"], creds.company);
    await safeFill(page, ["input[name='phone']", "input[name='phone_number']", "input[type='tel']"], creds.phone);
    await safeFill(page, ["input[name='website']", "input[name='website_url']", "input[name='url']"], creds.websiteUrl);
    await safeFill(page, ["input[name='website_name']", "input[name='site_name']"], creds.websiteName);
    await safeFill(page, ["textarea[name='description']", "textarea[name='website_description']"], creds.description);
    await safeSelect(page, ["select[name='country']", "select[name='country_code']"], creds.country);
  }

  console.log("");
  console.log("======================================================");
  console.log("以降のフローを手動完了してください:");
  console.log("");
  console.log("  - reCAPTCHA");
  console.log("  - 同意 checkbox");
  console.log("  - submit");
  console.log("  - メール認証 (app.develop.sk@gmail.com で受信)");
  console.log("");
  console.log("審査結果は1-3営業日後にメール通知");
  console.log("======================================================");

  // 完了待機
  for (let i = 0; i < 600; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      console.log("ブラウザ閉じられました");
      return;
    }
    if (url.includes("dashboard") || url.includes("thanks") || url.includes("confirm") || url.includes("success") || url.includes("welcome")) {
      console.log(`✓ 完了画面検出 (${i + 1}秒): ${url}`);
      break;
    }
    if ((i + 1) % 60 === 0) {
      process.stdout.write(`  待機 ${i + 1}/600秒 (${url.slice(0, 60)})\n`);
    }
  }

  await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
