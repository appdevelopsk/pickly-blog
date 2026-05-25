/**
 * Opens Pinterest in a headed browser, waits for login, then finds the bulk upload path.
 * Usage: npx tsx login-and-find-upload.ts
 *
 * 1. Browser opens at pinterest.com
 * 2. Log in manually
 * 3. Script detects login and probes the Create flow for bulk/CSV upload
 */
import { chromium } from "playwright";
import * as os from "node:os";

const DATA_DIR = `${os.homedir()}/.cache/pickly-playwright/pinterest`;
const TIMEOUT_MS = 300_000; // 5 min to log in

async function main() {
  const ctx = await chromium.launchPersistentContext(DATA_DIR, {
    headless: false,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
    viewport: { width: 1280, height: 900 },
  });
  const page = ctx.pages()[0] ?? await ctx.newPage();

  console.log("Navigating to Pinterest...");
  await page.goto("https://www.pinterest.com/", { waitUntil: "domcontentloaded", timeout: 15000 });

  // Check if already logged in by looking for the home feed
  const isLoggedIn = async () => {
    const url = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => "");
    // Logged in: URL stays at / with feed content (not marketing page)
    return url.includes("pinterest.com") && (
      bodyText.includes("今日のおすすめ") || bodyText.includes("Today's picks") ||
      bodyText.includes("ホームフィード") || bodyText.includes("Home feed") ||
      await page.locator("[data-test-id='homefeed-feed']").count() > 0 ||
      await page.locator("[data-test-id='header-avatar']").count() > 0 ||
      await page.locator("a[href*='/settings/']").count() > 0
    );
  };

  if (!await isLoggedIn()) {
    console.log("\n⚠ Not logged in. Please log in to Pinterest in the browser window.");
    console.log("Waiting up to 2 minutes...\n");
    const deadline = Date.now() + TIMEOUT_MS;
    while (Date.now() < deadline) {
      await page.waitForTimeout(2000);
      if (await isLoggedIn()) break;
    }
    if (!await isLoggedIn()) {
      console.error("Timed out waiting for login.");
      await ctx.close();
      return;
    }
  }

  console.log("✓ Logged in! Current URL:", page.url());
  await page.screenshot({ path: "/tmp/pinterest-logged-in.png" }).catch(() => {});

  // Probe pin creation URL directly
  console.log("\n--- Probing pin creation URLs ---");
  const createCandidates = [
    ["pin-create", "https://www.pinterest.com/pin-builder/"],
    ["pin-create-jp", "https://jp.pinterest.com/pin-builder/"],
    ["idea-pin", "https://www.pinterest.com/idea-pin-builder/"],
    ["create-pin", "https://www.pinterest.com/create/"],
    ["biz-create", "https://business.pinterest.com/create/"],
    ["ads-creative", "https://ads.pinterest.com/advertiser/"],
  ];

  for (const [label, url] of createCandidates) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 }).catch((e: Error) =>
      console.log(`  GOTO error (${label}): ${e.message.slice(0, 60)}`)
    );
    await page.waitForTimeout(2500);
    const finalUrl = page.url();
    const hasFileInput = await page.locator("input[type='file']").count() > 0;
    const bodySnippet = (await page.evaluate(() => document.body.innerText)).slice(0, 200).replace(/\n/g, " ");
    console.log(`[${label}] → ${finalUrl}`);
    console.log(`  fileInput=${hasFileInput}  body: ${bodySnippet.slice(0, 120)}`);
    await page.screenshot({ path: `/tmp/pinterest-${label}.png`, fullPage: false }).catch(() => {});
    if (hasFileInput) {
      console.log(`\n✓ FILE INPUT FOUND at ${finalUrl}`);
    }
  }

  // Try clicking the Create button in the top nav
  console.log("\n--- Trying top-nav Create button ---");
  await page.goto("https://www.pinterest.com/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);

  const createSelectors = [
    "[data-test-id='header-create-button']",
    "a[data-test-id*='create']",
    "button[aria-label*='Create']",
    "a[href*='/pin-builder']",
    "[aria-label='Create']",
    "button:has-text('作成')",
    "button:has-text('Create')",
  ];
  let clicked = false;
  for (const sel of createSelectors) {
    const el = page.locator(sel).first();
    if (await el.count() > 0) {
      console.log(`Clicking: ${sel}`);
      await el.click().catch(() => {});
      await page.waitForTimeout(2500);
      console.log("After click URL:", page.url());
      await page.screenshot({ path: "/tmp/pinterest-after-create-click.png" }).catch(() => {});
      clicked = true;
      break;
    }
  }
  if (!clicked) console.log("No Create button found in nav.");

  // Extract all links from current page
  const allLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]"))
      .map((a) => ({ href: (a as HTMLAnchorElement).href, text: (a.textContent ?? "").trim().slice(0, 60) }))
      .filter(({ href, text }) =>
        href.includes("bulk") || href.includes("csv") || href.includes("pin-builder") ||
        href.includes("create") || text.toLowerCase().includes("bulk") ||
        text.toLowerCase().includes("csv") || text.toLowerCase().includes("multiple")
      )
      .slice(0, 20)
  );
  console.log("\nRelevant links:", JSON.stringify(allLinks, null, 2));

  console.log("\nDone. Screenshots at /tmp/pinterest-*.png");
  console.log("Press Ctrl-C or close the browser to exit.");
  // Keep browser open so user can explore manually
  await page.waitForTimeout(30000);
  await ctx.close();
}

main().catch(console.error);
