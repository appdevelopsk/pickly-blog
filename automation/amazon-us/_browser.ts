/**
 * Shared browser context for Amazon Associates US automation.
 *
 * 注意:
 *   - Amazon は bot 検知が厳しい — chrome-devtools の特徴を消す
 *   - Associates US は審査制 (180日以内に3件売上必須、未達ならアカウント剥奪)
 *   - 申請には US tax interview (W-8BEN) 必須
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/amazon-us");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/amazon-us.env");

export interface LaunchOptions {
  headless?: boolean;
}

export async function launch(opts: LaunchOptions = {}): Promise<{ context: BrowserContext; page: Page }> {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: opts.headless ?? false,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
    timezoneId: "America/Los_Angeles",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
  });
  let page = context.pages()[0];
  if (!page) page = await context.newPage();
  return { context, page };
}

export interface AmazonUsCredentials {
  email?: string;
  password?: string;
  payeeName?: string;
  websiteUrl?: string;
  storeId?: string;
  preferredStoreId?: string;
  primaryTopics?: string;
  trafficSources?: string;
  monthlyVisitors?: string;
  phone?: string;
}

export function loadCredentials(): AmazonUsCredentials {
  const out: AmazonUsCredentials = {};
  if (fsSync.existsSync(CREDS_FILE)) {
    const content = fsSync.readFileSync(CREDS_FILE, "utf8");
    const pick = (key: string) => {
      const m = content.match(new RegExp(`^${key}=["']?([^"'\\n]+)["']?`, "m"));
      return m?.[1];
    };
    out.email = pick("AMAZON_US_EMAIL");
    out.password = pick("AMAZON_US_PASSWORD");
    out.payeeName = pick("AMAZON_US_PAYEE_NAME");
    out.websiteUrl = pick("AMAZON_US_WEBSITE_URL");
    out.storeId = pick("AMAZON_US_STORE_ID");
    out.preferredStoreId = pick("AMAZON_US_PREFERRED_STORE_ID");
    out.primaryTopics = pick("AMAZON_US_PRIMARY_TOPICS");
    out.trafficSources = pick("AMAZON_US_TRAFFIC_SOURCES");
    out.monthlyVisitors = pick("AMAZON_US_MONTHLY_VISITORS");
    out.phone = pick("AMAZON_US_PHONE");
  }
  return out;
}
