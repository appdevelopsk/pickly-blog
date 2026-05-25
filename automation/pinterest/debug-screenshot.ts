import { chromium } from "playwright";
import * as os from "node:os";

async function main() {
  const email = process.env.PINTEREST_LOGIN_EMAIL!;
  const pw = process.env.PINTEREST_LOGIN_PW!;
  const DATA_DIR = `${os.homedir()}/.cache/pickly-playwright/pinterest`;

  const ctx = await chromium.launchPersistentContext(DATA_DIR, {
    headless: false,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  const testUrls = [
    "https://www.pinterest.com/",
    "https://www.pinterest.com/pin/create/button/",
    "https://ads.pinterest.com/",
    "https://business.pinterest.com/",
    "https://www.pinterest.com/create/",
  ];
  for (const url of testUrls) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const finalUrl = page.url();
    const title = await page.title();
    const has404 = (await page.evaluate(() => document.body.innerText)).includes("404");
    console.log(`${url} → ${finalUrl} [${title}] 404=${has404}`);
    if (!has404 && finalUrl !== url) {
      await page.screenshot({ path: `/tmp/pinterest-${Date.now()}.png` });
    }
  }

  await ctx.close();
}

main().catch(console.error);
