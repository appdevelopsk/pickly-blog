import { chromium } from "playwright";
import * as path from "node:path";
import * as os from "node:os";

async function main() {
  const ctx = await chromium.launchPersistentContext(path.join(os.homedir(), ".cache/pickly-playwright/moshimo"), {
    headless: false,
    viewport: { width: 1280, height: 800 },
  });
  const page = ctx.pages()[0] ?? await ctx.newPage();

  await page.goto("https://af.moshimo.com/af/shop/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("After /af/shop/ →", page.url());

  await page.goto("https://af.moshimo.com/af/shop/media/index", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("After /af/shop/media/index →", page.url());

  const cookies = await ctx.cookies("https://af.moshimo.com");
  console.log(`\n${cookies.length} cookies for af.moshimo.com:`);
  for (const c of cookies) {
    console.log(`  ${c.name} = ${c.value.slice(0, 30)}... (httpOnly=${c.httpOnly}, expires=${c.expires})`);
  }

  await ctx.close();
}
main();
