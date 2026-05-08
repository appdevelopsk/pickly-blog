/**
 * Shared browser context for もしもアフィリエイト automation.
 *
 * セッション戦略:
 *   - もしもの MsmSession cookie が `expires=-1` でセッションスコープのため、
 *     chromium 終了でログアウトする(persistent context でも復活しない)
 *   - 解決策: 各スクリプトの開始時に ensureLoggedIn() を呼んで、
 *     未ログインなら ~/.config/pickly/moshimo.env または env vars から再ログイン
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/moshimo");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/moshimo.env");

export interface LaunchOptions {
  headless?: boolean;
}

export async function launch(opts: LaunchOptions = {}): Promise<{ context: BrowserContext; page: Page }> {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: opts.headless ?? false,
    viewport: { width: 1280, height: 800 },
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
  await page.goto("https://af.moshimo.com/af/shop/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const url = page.url();
  return !url.includes("/login");
}

/**
 * Read credentials from env vars OR ~/.config/pickly/moshimo.env.
 */
function loadCredentials(): { id?: string; pw?: string } {
  let id = process.env.MOSHIMO_LOGIN_ID;
  let pw = process.env.MOSHIMO_LOGIN_PW;

  if ((!id || !pw) && fsSync.existsSync(CREDS_FILE)) {
    const content = fsSync.readFileSync(CREDS_FILE, "utf8");
    const idMatch = content.match(/MOSHIMO_LOGIN_ID=["']?([^"'\n]+)["']?/);
    const pwMatch = content.match(/MOSHIMO_LOGIN_PW=["']?([^"'\n]+)["']?/);
    if (!id && idMatch) id = idMatch[1];
    if (!pw && pwMatch) pw = pwMatch[1];
  }

  return { id, pw };
}

/**
 * Logged-in state を保証する。未ログインなら自動でログイン処理。
 */
export async function ensureLoggedIn(page: Page): Promise<void> {
  if (await isLoggedIn(page)) return;

  const { id, pw } = loadCredentials();
  if (!id || !pw) {
    throw new Error(
      `認証情報が見つかりません。${CREDS_FILE} に MOSHIMO_LOGIN_ID と MOSHIMO_LOGIN_PW を設定してください`,
    );
  }

  console.log("→ セッション切れ、自動再ログイン");
  await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "domcontentloaded" });

  const idSelectors = [
    "input[name='loginId']",
    "input[name='id']",
    "input[name='email']",
    "input[type='email']",
    "input[type='text']",
    "#loginId",
  ];
  const pwSelectors = [
    "input[name='loginPwd']",
    "input[name='password']",
    "input[type='password']",
    "#loginPwd",
  ];

  for (const sel of idSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
      await loc.fill(id);
      break;
    }
  }
  for (const sel of pwSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
      await loc.fill(pw);
      break;
    }
  }

  const submitSelectors = [
    "button[type='submit']",
    "input[type='submit']",
    "button:has-text('ログイン')",
  ];
  let clicked = false;
  for (const sel of submitSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0) {
      await loc.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) await page.keyboard.press("Enter");

  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    if (!page.url().includes("/login")) {
      console.log("✓ 再ログイン成功");
      return;
    }
  }
  throw new Error("再ログインに失敗(reCAPTCHA かパスワードか確認)");
}
