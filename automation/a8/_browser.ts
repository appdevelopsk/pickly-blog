/**
 * Shared browser context for A8.net automation.
 *
 * セッション戦略:
 *   - chromium.launchPersistentContext で ~/.cache/pickly-playwright/a8/ にCookie/LSを永続化
 *   - 初回 signup/login.ts で headed 起動して人間が認証 → 以降は cookie 残存で再利用可
 *   - reCAPTCHA や 2FA は人間が解く前提
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/a8");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/a8.env");

export interface LaunchOptions {
  headless?: boolean;
}

export async function launch(opts: LaunchOptions = {}): Promise<{ context: BrowserContext; page: Page }> {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: opts.headless ?? false,
    viewport: { width: 1280, height: 900 },
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

/**
 * 簡易ログイン状態判定: ダッシュボードURL or "メディアID" 文字列。
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  await page.goto("https://pub.a8.net/a8v2/asMemberAction.do", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  }).catch(() => {});
  await page.waitForTimeout(1500);
  const url = page.url();
  if (url.includes("/login") || url.includes("login.do")) return false;
  return /asMember|asPgmSearch|asProgram/.test(url);
}

export interface A8Credentials {
  loginId?: string;
  password?: string;
  // signup-only fields (省略可)
  email?: string;
  lastName?: string;
  firstName?: string;
  lastNameKana?: string;
  firstNameKana?: string;
  birthday?: string; // YYYY-MM-DD
  postalCode?: string;
  prefecture?: string;
  address?: string;
  phone?: string;
  siteName?: string;
  siteUrl?: string;
  siteCategory?: string;
  siteDescription?: string;
}

export function loadCredentials(): A8Credentials {
  const out: A8Credentials = {};

  const env = process.env;
  if (env.A8_LOGIN_ID) out.loginId = env.A8_LOGIN_ID;
  if (env.A8_PASSWORD) out.password = env.A8_PASSWORD;

  if (fsSync.existsSync(CREDS_FILE)) {
    const content = fsSync.readFileSync(CREDS_FILE, "utf8");
    const pick = (key: string) => {
      const m = content.match(new RegExp(`^${key}=["']?([^"'\\n]+)["']?`, "m"));
      return m?.[1];
    };
    out.loginId ??= pick("A8_LOGIN_ID");
    out.password ??= pick("A8_PASSWORD");
    out.email ??= pick("A8_EMAIL");
    out.lastName ??= pick("A8_LAST_NAME");
    out.firstName ??= pick("A8_FIRST_NAME");
    out.lastNameKana ??= pick("A8_LAST_NAME_KANA");
    out.firstNameKana ??= pick("A8_FIRST_NAME_KANA");
    out.birthday ??= pick("A8_BIRTHDAY");
    out.postalCode ??= pick("A8_POSTAL_CODE");
    out.prefecture ??= pick("A8_PREFECTURE");
    out.address ??= pick("A8_ADDRESS");
    out.phone ??= pick("A8_PHONE");
    out.siteName ??= pick("A8_SITE_NAME");
    out.siteUrl ??= pick("A8_SITE_URL");
    out.siteCategory ??= pick("A8_SITE_CATEGORY");
    out.siteDescription ??= pick("A8_SITE_DESCRIPTION");
  }

  return out;
}
