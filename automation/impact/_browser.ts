/**
 * Shared browser context for Impact.com automation.
 *
 * Impact は global affiliate network。VPN系 (NordVPN, ExpressVPN) や SaaS が多数。
 * Partner Sign-up は厳しめの審査 (サイト実質性 + 月間PV要件あり)。
 */
import { chromium, type BrowserContext, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/impact");
const CREDS_FILE = path.join(os.homedir(), ".config/pickly/impact.env");

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

export interface ImpactCredentials {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  websiteUrl?: string;
  country?: string;
  phone?: string;
  monthlyVisitors?: string;
  primaryCategory?: string;
}

export function loadCredentials(): ImpactCredentials {
  const out: ImpactCredentials = {};
  if (fsSync.existsSync(CREDS_FILE)) {
    const content = fsSync.readFileSync(CREDS_FILE, "utf8");
    const pick = (key: string) => {
      const m = content.match(new RegExp(`^${key}=["']?([^"'\\n]+)["']?`, "m"));
      return m?.[1];
    };
    out.email = pick("IMPACT_EMAIL");
    out.password = pick("IMPACT_PASSWORD");
    out.firstName = pick("IMPACT_FIRST_NAME");
    out.lastName = pick("IMPACT_LAST_NAME");
    out.companyName = pick("IMPACT_COMPANY_NAME");
    out.websiteUrl = pick("IMPACT_WEBSITE_URL");
    out.country = pick("IMPACT_COUNTRY");
    out.phone = pick("IMPACT_PHONE");
    out.monthlyVisitors = pick("IMPACT_MONTHLY_VISITORS");
    out.primaryCategory = pick("IMPACT_PRIMARY_CATEGORY");
  }
  return out;
}
