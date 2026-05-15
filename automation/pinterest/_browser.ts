/**
 * Pinterest Playwright 共通ブラウザ context.
 * セッション永続化 + 必要時に自動ログイン。
 * account オプションでジャンル別アカウントに切り替え可能。
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

const DEFAULT_SESSION_DIR = path.join(os.homedir(), ".cache/pickly-playwright/pinterest");
const DEFAULT_CREDS_FILE  = path.join(os.homedir(), ".config/pickly/pinterest.env");

export interface LaunchOptions {
  headless?: boolean;
  /** ジャンル別アカウント名（例: "fitness", "food"）。省略時はデフォルトアカウント */
  account?: { sessionDir: string; envFile: string };
}

export async function launch(opts: LaunchOptions = {}): Promise<{ context: BrowserContext; page: Page }> {
  const sessionDir = opts.account?.sessionDir ?? DEFAULT_SESSION_DIR;
  await fs.mkdir(sessionDir, { recursive: true });

  const context = await chromium.launchPersistentContext(sessionDir, {
    headless: opts.headless ?? false,
    viewport: { width: 1280, height: 850 },
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  let page = context.pages()[0];
  if (!page) page = await context.newPage();
  return { context, page };
}

export async function isLoggedIn(page: Page): Promise<boolean> {
  await page.goto("https://www.pinterest.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const url = page.url();
  return !url.includes("/login") && !url.includes("/business/create");
}

function loadCredentials(credsFile?: string): { email?: string; pw?: string } {
  let email = process.env.PINTEREST_LOGIN_EMAIL;
  let pw = process.env.PINTEREST_LOGIN_PW;

  const envFile = credsFile ?? DEFAULT_CREDS_FILE;
  if ((!email || !pw) && fsSync.existsSync(envFile)) {
    const content = fsSync.readFileSync(envFile, "utf8");
    const e = content.match(/PINTEREST_LOGIN_EMAIL=["']?([^"'\n]+)["']?/);
    const p = content.match(/PINTEREST_LOGIN_PW=["']?([^"'\n]+)["']?/);
    if (!email && e) email = e[1];
    if (!pw && p) pw = p[1];
  }

  return { email, pw };
}

export async function ensureLoggedIn(page: Page, opts: LaunchOptions = {}): Promise<void> {
  if (await isLoggedIn(page)) {
    console.log("✓ Pinterest ログイン済");
    return;
  }

  const { email, pw } = loadCredentials(opts.account?.envFile);
  if (!email || !pw) {
    throw new Error(`認証情報が見つかりません。${CREDS_FILE} に PINTEREST_LOGIN_EMAIL と PINTEREST_LOGIN_PW を設定してください`);
  }

  console.log("→ セッション切れ、自動再ログイン");
  await page.goto("https://www.pinterest.com/login/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const emailField = page.locator("input[type='email'], input[name='id'], input#email").first();
  if ((await emailField.count()) > 0) {
    await emailField.fill(email);
  }
  const pwField = page.locator("input[type='password']").first();
  if ((await pwField.count()) > 0) {
    await pwField.fill(pw);
  }

  // Login button
  const loginBtn = page
    .locator("button:has-text('ログイン'), button:has-text('Log in'), button:has-text('Sign in')")
    .first();
  if ((await loginBtn.count()) > 0) {
    await loginBtn.click();
  } else {
    await page.keyboard.press("Enter");
  }

  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    if (!page.url().includes("/login")) {
      console.log("✓ 再ログイン成功");
      return;
    }
  }
  throw new Error("Pinterest 再ログイン失敗(reCAPTCHA かパスワードか確認)");
}
