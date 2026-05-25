/**
 * Pinterest bulk upload URL finder
 * Tries known URL patterns and follows the Create button flow to find bulk upload.
 *
 * Usage: npx tsx find-bulk-upload-url.ts
 * Screenshots saved to /tmp/pinterest-probe-*.png
 */
import { chromium } from "playwright";
import * as os from "node:os";

const DATA_DIR = `${os.homedir()}/.cache/pickly-playwright/pinterest`;

async function probe(label: string, url: string, page: Awaited<ReturnType<typeof import("playwright").chromium.launch>>["contexts"][0]["pages"][0]) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 }).catch((e: Error) => console.log(`  GOTO error: ${e.message.slice(0, 60)}`));
  await page.waitForTimeout(3000);
  const finalUrl = page.url();
  const title = await page.title();
  const bodyText = (await page.evaluate(() => document.body.innerText)).slice(0, 200);
  const has404 = bodyText.includes("404") || bodyText.includes("エラー") || bodyText.includes("error");
  const hasFileInput = await page.locator("input[type='file']").count() > 0;
  const hasUpload = bodyText.toLowerCase().includes("upload") || bodyText.includes("アップロード");
  await page.screenshot({ path: `/tmp/pinterest-probe-${label.replace(/[^a-z0-9]/gi, "-")}.png`, fullPage: true }).catch(() => {});
  console.log(`[${label}]`);
  console.log(`  URL: ${finalUrl}`);
  console.log(`  Title: ${title}`);
  console.log(`  404=${has404} fileInput=${hasFileInput} upload=${hasUpload}`);
  console.log(`  Body: ${bodyText.replace(/\n/g, " ").slice(0, 150)}`);
  return { finalUrl, has404, hasFileInput };
}

async function main() {
  const ctx = await chromium.launchPersistentContext(DATA_DIR, {
    headless: false,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
    viewport: { width: 1280, height: 900 },
  });
  const page = ctx.pages()[0] ?? await ctx.newPage();

  const candidates = [
    // Direct bulk upload candidates
    ["bulk-1", "https://business.pinterest.com/en/create/bulk/"],
    ["bulk-2", "https://business.pinterest.com/en/create/bulk-upload/"],
    ["bulk-3", "https://business.pinterest.com/create/bulk/"],
    ["bulk-4", "https://business.pinterest.com/create/bulk-upload/"],
    ["bulk-5", "https://ads.pinterest.com/bulk_pins/"],
    ["bulk-6", "https://ads.pinterest.com/pin-builder/bulk/"],
    // New UI paths
    ["create-1", "https://www.pinterest.com/pin-builder/"],
    ["create-2", "https://www.pinterest.com/idea-pin-builder/"],
    // Business hub
    ["biz-1", "https://business.pinterest.com/en/"],
    ["biz-2", "https://business.pinterest.com/"],
    // Ads manager
    ["ads-1", "https://ads.pinterest.com/"],
  ] as [string, string][];

  for (const [label, url] of candidates) {
    const result = await probe(label, url, page);
    if (result.hasFileInput) {
      console.log(`\n✓ FILE INPUT FOUND at ${result.finalUrl}`);
      break;
    }
  }

  // Try the homepage Create button flow
  console.log("\n--- Following Create button from homepage ---");
  await page.goto("https://www.pinterest.com/", { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Extract all links that mention create/upload/bulk
  const relevantLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href]"));
    return links
      .filter((a) => {
        const href = (a as HTMLAnchorElement).href;
        const text = a.textContent ?? "";
        return href.includes("create") || href.includes("bulk") || href.includes("upload") || href.includes("pin-builder")
          || text.toLowerCase().includes("create") || text.toLowerCase().includes("upload") || text.toLowerCase().includes("bulk");
      })
      .map((a) => ({ href: (a as HTMLAnchorElement).href, text: (a.textContent ?? "").trim().slice(0, 50) }))
      .slice(0, 20);
  });
  console.log("Create/upload links found:", JSON.stringify(relevantLinks, null, 2));

  // Try clicking the Create button
  const createBtn = page.locator("a[href*='/create'], button:has-text('Create'), [aria-label*='Create']").first();
  if (await createBtn.count() > 0) {
    console.log("\nClicking Create button...");
    await createBtn.click().catch(() => {});
    await page.waitForTimeout(3000);
    console.log("After click URL:", page.url());
    await page.screenshot({ path: "/tmp/pinterest-probe-after-create.png", fullPage: true }).catch(() => {});

    // Look for bulk/CSV option
    const bulkLinks = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll("a, button"));
      return all
        .filter((el) => {
          const text = (el.textContent ?? "").toLowerCase();
          const href = (el as HTMLAnchorElement).href ?? "";
          return text.includes("bulk") || text.includes("csv") || text.includes("multiple") || href.includes("bulk");
        })
        .map((el) => ({ tag: el.tagName, text: (el.textContent ?? "").trim().slice(0, 50), href: (el as HTMLAnchorElement).href ?? "" }))
        .slice(0, 10);
    });
    console.log("Bulk/CSV links after Create:", JSON.stringify(bulkLinks, null, 2));
  }

  await ctx.close();
}

main().catch(console.error);
