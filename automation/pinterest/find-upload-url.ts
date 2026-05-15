/**
 * Pinterest の一括アップロード画面を探す
 */
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { launch, ensureLoggedIn } from "./_browser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CANDIDATES = [
  "https://www.pinterest.com/pin-builder/",
  "https://business.pinterest.com/en/pin-builder/",
  "https://business.pinterest.com/create/pin/",
  "https://business.pinterest.com/create/pins/bulk/",
  "https://ads.pinterest.com/advertiser/bulk-editor/",
  "https://business.pinterest.com/create/",
];

async function main() {
  const { context, page } = await launch({ headless: false });

  try {
    await ensureLoggedIn(page);

    // まず Business Hub のホームから "Create content" を探す
    console.log("→ Business Hub ホームを確認");
    await page.goto("https://business.pinterest.com/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const ss0 = path.join(__dirname, "find-upload-0-home.png");
    await page.screenshot({ path: ss0, fullPage: false });
    console.log("スクリーンショット:", ss0);

    // "Create content" メニューをクリック
    const createMenu = page.locator("a:has-text('Create content'), button:has-text('Create content'), a:has-text('Create'), nav a:has-text('Create')").first();
    if (await createMenu.count() > 0) {
      console.log("'Create content' メニュー発見 → クリック");
      await createMenu.click();
      await page.waitForTimeout(2000);
      const ss1 = path.join(__dirname, "find-upload-1-menu.png");
      await page.screenshot({ path: ss1 });
      console.log("スクリーンショット:", ss1);
    }

    // 各候補 URL を試す
    for (const url of CANDIDATES) {
      console.log(`\n→ 試行: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(2000);

      const finalUrl = page.url();
      const title = await page.title();
      const hasFile = await page.locator("input[type='file']").count();
      const hasUpload = (await page.evaluate(() => document.body.innerText)).toLowerCase().includes("upload");
      const hasBulk = (await page.evaluate(() => document.body.innerText)).toLowerCase().includes("bulk");

      console.log(`  URL: ${finalUrl}`);
      console.log(`  title: ${title}`);
      console.log(`  input[file]: ${hasFile}, mentions 'upload': ${hasUpload}, 'bulk': ${hasBulk}`);

      const ssName = path.join(__dirname, `find-upload-${url.replace(/[^a-z0-9]/gi, "-").slice(-40)}.png`);
      await page.screenshot({ path: ssName });
      console.log(`  スクリーンショット: ${ssName}`);
    }

    // pinterest.com の標準 pin builder を確認
    console.log("\n→ pin-builder を詳細確認");
    await page.goto("https://www.pinterest.com/pin-builder/", { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(3000);
    const pbSs = path.join(__dirname, "find-upload-pin-builder.png");
    await page.screenshot({ path: pbSs, fullPage: true });
    console.log("スクリーンショット:", pbSs);

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a, button")).slice(0, 50).map((el) => ({
        tag: el.tagName,
        text: (el as HTMLElement).innerText?.slice(0, 60).trim(),
        href: (el as HTMLAnchorElement).href,
        "data-test": el.getAttribute("data-test-id"),
      }))
    );
    console.log("pin-builder 要素:", JSON.stringify(links.filter((l) => l.text), null, 2));

    console.log("\n60秒待機（ブラウザを手動確認してください）");
    await page.waitForTimeout(60_000);

  } finally {
    await context.close();
  }
}

main().catch(console.error);
