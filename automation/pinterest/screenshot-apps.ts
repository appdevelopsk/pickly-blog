import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  await page.goto("https://developers.pinterest.com/apps/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "/tmp/pinterest-apps-list.png", fullPage: true });
  console.log("→ /tmp/pinterest-apps-list.png");
  
  // Also try /apps/<id>/ direct
  await page.goto("https://developers.pinterest.com/apps/1568630/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log(`Final URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/pinterest-app-direct.png", fullPage: true });
  console.log("→ /tmp/pinterest-app-direct.png");
  
  await context.close();
}
main();
