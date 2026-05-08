/**
 * Shared browser context for Awin (旧 ShareASale含む) automation.
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/awin");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/awin.env");
const SHAREASALE_FILE = path.join(os.homedir(), ".config/pickly/shareasale.env");

export const PUBLISHER_ID = "2887303";

/**
 * Auth0 universal login を1ターゲットURLに対して通す
 * - 既にログイン済みならuser操作不要 (Auth0 SSO で即 redirect)
 * - 未認証ならusername/password を入力
 */
async function passAuth0(page: Page, creds: AwinCredentials, targetUrl: string): Promise<void> {
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

  let lastAction = "";
  let lastUrl = "";
  for (let attempt = 0; attempt < 120; attempt++) {
    await page.waitForTimeout(1000);
    const url = page.url();

    // 完了判定: ui.awin.com で login/idp ではない
    if (url.includes("ui.awin.com") && !url.includes("/login") && !url.includes("/idp/")) {
      return;
    }

    // URL が変わったら lastAction reset (新ステップに来た = 前回のaction は完了とみなす)
    if (url !== lastUrl) {
      lastAction = "";
      lastUrl = url;
    }

    // Authorize/Consent 画面 (Auth0 は時々これを挟む)
    const consentBtn = await page.locator("button:has-text('Accept'):visible, button:has-text('Authorize'):visible, button:has-text('Allow'):visible").count().catch(() => 0);
    if (consentBtn > 0) {
      console.log("  → Authorize/Accept 画面検出 — クリック");
      await page.locator("button:has-text('Accept'):visible, button:has-text('Authorize'):visible, button:has-text('Allow'):visible").first().click().catch(() => {});
      await page.waitForTimeout(2000);
      continue;
    }

    // 現在のページ状態を検査 (visibleなものだけ — Auth0 は hidden honeypot 入力を持つ)
    const visiblePassword = page.locator("input[type='password']:visible").first();
    const visibleUsername = page.locator("input[name='username']:visible, input[autocomplete='username']:visible").first();
    const visibleOtp = page.locator("input[autocomplete='one-time-code']:visible, input[name*='otp']:visible").first();

    const hasUsername = await visibleUsername.count().catch(() => 0);
    const hasPassword = await visiblePassword.count().catch(() => 0);
    const hasOtp = await visibleOtp.count().catch(() => 0);

    if (hasOtp > 0) {
      console.log("⚠ 2FA入力欄検出 — 90秒待機 (手動でコード入力)");
      await page.waitForTimeout(90000);
      continue;
    }

    // password ページが優先
    if (hasPassword > 0 && lastAction !== "password") {
      await visiblePassword.fill(creds.password!);
      await page.waitForTimeout(500);
      await page.locator("button[type='submit']:visible, button:has-text('Continue'):visible, button:has-text('Log in'):visible").first().click().catch(() => {});
      lastAction = "password";
      await page.waitForTimeout(2500);
      continue;
    }

    if (hasUsername > 0 && lastAction !== "username") {
      await visibleUsername.fill(creds.email!);
      await page.waitForTimeout(500);
      await page.locator("button[type='submit']:visible, button:has-text('Continue'):visible").first().click().catch(() => {});
      lastAction = "username";
      await page.waitForTimeout(2500);
      continue;
    }

    // 何も無し = redirect 待機中
    lastAction = "wait";
  }
  throw new Error(`Auth0 完了せず (target=${targetUrl}): ${page.url()}`);
}

/**
 * Awinダッシュボード(新)とレガシーアプリ(旧)、両方のセッションを確立する。
 * - 新: /dashboard/awin/publisher/{id}
 * - 旧: /awin/affiliate/{id}/profile
 * Auth0 universal login は1度パスワード入力すれば、その後は同セッション内で
 * passive SSO (Continue だけ or 即redirect) で通る。
 */
export async function ensureLoggedIn(
  page: Page,
  creds: AwinCredentials,
  targetUrl?: string,
): Promise<void> {
  if (!creds.email || !creds.password) {
    throw new Error("AWIN_EMAIL / AWIN_PASSWORD missing in ~/.config/pickly/awin.env");
  }

  // 1段階目: 新ダッシュボード (Auth0 cookieを焼く)
  await passAuth0(page, creds, `https://ui.awin.com/dashboard/awin/publisher/${PUBLISHER_ID}`);

  // 2段階目: target が指定されていれば、そこへ navigate して legacy app cookie も焼く
  if (targetUrl) {
    await passAuth0(page, creds, targetUrl);
  }
}

export interface LaunchOptions {
  headless?: boolean;
}

export async function launch(opts: LaunchOptions = {}): Promise<{ context: BrowserContext; page: Page }> {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: opts.headless ?? false,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
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

export interface AwinCredentials {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  websiteUrl?: string;
  websiteName?: string;
  websiteDescription?: string;
}

export function loadCredentials(): AwinCredentials {
  const out: AwinCredentials = {};

  // Awin専用 envがあればそちら優先、無ければShareASaleのenvをfallback
  const file = fsSync.existsSync(CREDS_FILE) ? CREDS_FILE : SHAREASALE_FILE;
  if (!fsSync.existsSync(file)) return out;

  const content = fsSync.readFileSync(file, "utf8");
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const m = content.match(new RegExp(`^${k}=["']?([^"'\\n]+)["']?`, "m"));
      if (m) return m[1];
    }
    return undefined;
  };
  out.email = pick("AWIN_EMAIL", "SHAREASALE_EMAIL");
  out.password = pick("AWIN_PASSWORD", "SHAREASALE_PASSWORD");
  out.firstName = pick("AWIN_FIRST_NAME", "SHAREASALE_FIRST_NAME");
  out.lastName = pick("AWIN_LAST_NAME", "SHAREASALE_LAST_NAME");
  out.phone = pick("AWIN_PHONE", "SHAREASALE_PHONE");
  out.address1 = pick("AWIN_ADDRESS1", "SHAREASALE_ADDRESS1");
  out.city = pick("AWIN_CITY", "SHAREASALE_CITY");
  out.state = pick("AWIN_STATE", "SHAREASALE_STATE");
  out.zip = pick("AWIN_ZIP", "SHAREASALE_ZIP");
  out.country = pick("AWIN_COUNTRY", "SHAREASALE_COUNTRY");
  out.websiteUrl = pick("AWIN_WEBSITE_URL", "SHAREASALE_WEBSITE_URL");
  out.websiteName = pick("AWIN_WEBSITE_NAME", "SHAREASALE_WEBSITE_NAME");
  out.websiteDescription = pick("AWIN_WEBSITE_DESCRIPTION", "SHAREASALE_WEBSITE_DESCRIPTION");
  return out;
}
