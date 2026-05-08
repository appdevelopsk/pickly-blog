/**
 * Shared Playwright profile signed into Google as app.develop.sk@gmail.com
 *
 * 使い方:
 *   - 初回: npm run google:signin で Google ログイン (手動 password+2FA)
 *   - 以降: 全 ASP signup スクリプトがこの profile を import して使用
 *     → 「Sign in with Google」ボタンが即時通る
 *
 * Profile path: ~/.cache/pickly-playwright/shared-google/
 *
 * 重要: locale/timezone は ASP の region に応じて切り替えるため、
 * `launch({ locale, timezone })` で上書き可能にする。
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";

export const PROFILE_DIR = path.join(os.homedir(), ".cache/pickly-playwright/shared-google");
export const GOOGLE_EMAIL = "app.develop.sk@gmail.com";

export interface LaunchOptions {
  headless?: boolean;
  locale?: string;
  timezone?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export async function launch(opts: LaunchOptions = {}): Promise<{ context: BrowserContext; page: Page }> {
  await fs.mkdir(PROFILE_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: opts.headless ?? false,
    viewport: opts.viewport ?? { width: 1280, height: 900 },
    locale: opts.locale ?? "en-US",
    timezoneId: opts.timezone ?? "America/Los_Angeles",
    userAgent: opts.userAgent ??
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

/**
 * Google にサインイン済みかチェック
 */
export async function isSignedIn(page: Page): Promise<boolean> {
  await page.goto("https://myaccount.google.com/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  }).catch(() => {});
  await page.waitForTimeout(2500);
  const url = page.url();
  if (url.includes("accounts.google.com/signin")) return false;
  if (url.includes("myaccount.google.com")) {
    // 念のためメール表示を確認
    const text = await page.evaluate(() => document.body.innerText.slice(0, 1500)).catch(() => "");
    return text.includes(GOOGLE_EMAIL) || text.includes("app.develop.sk");
  }
  return false;
}
