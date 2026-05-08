/**
 * Shared browser context for ShareASale automation.
 *
 * セッション戦略:
 *   - chromium.launchPersistentContext で ~/.cache/pickly-playwright/shareasale/ にCookie永続化
 *   - 初回 signup.ts で headed 起動 → ShareASale は審査制 (3-7営業日かかる)
 *   - 審査通過後 ~/.config/pickly/shareasale.env に CID/トークンを保存して API も使用可
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/shareasale");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/shareasale.env");

export interface LaunchOptions {
  headless?: boolean;
}

export async function launch(opts: LaunchOptions = {}): Promise<{ context: BrowserContext; page: Page }> {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: opts.headless ?? false,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
    timezoneId: "America/New_York",
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

export interface SACredentials {
  username?: string;
  password?: string;
  email?: string;
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
  // After approval:
  affiliateId?: string;
  apiToken?: string;
  apiSecret?: string;
}

export function loadCredentials(): SACredentials {
  const out: SACredentials = {};
  if (fsSync.existsSync(CREDS_FILE)) {
    const content = fsSync.readFileSync(CREDS_FILE, "utf8");
    const pick = (key: string) => {
      const m = content.match(new RegExp(`^${key}=["']?([^"'\\n]+)["']?`, "m"));
      return m?.[1];
    };
    out.username = pick("SHAREASALE_USERNAME");
    out.password = pick("SHAREASALE_PASSWORD");
    out.email = pick("SHAREASALE_EMAIL");
    out.firstName = pick("SHAREASALE_FIRST_NAME");
    out.lastName = pick("SHAREASALE_LAST_NAME");
    out.phone = pick("SHAREASALE_PHONE");
    out.address1 = pick("SHAREASALE_ADDRESS1");
    out.city = pick("SHAREASALE_CITY");
    out.state = pick("SHAREASALE_STATE");
    out.zip = pick("SHAREASALE_ZIP");
    out.country = pick("SHAREASALE_COUNTRY");
    out.websiteUrl = pick("SHAREASALE_WEBSITE_URL");
    out.websiteName = pick("SHAREASALE_WEBSITE_NAME");
    out.websiteDescription = pick("SHAREASALE_WEBSITE_DESCRIPTION");
    out.affiliateId = pick("SHAREASALE_AFFILIATE_ID");
    out.apiToken = pick("SHAREASALE_API_TOKEN");
    out.apiSecret = pick("SHAREASALE_API_SECRET");
  }
  return out;
}
