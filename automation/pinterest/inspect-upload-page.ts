/**
 * Pinterest bulk upload ページの構造を調査する
 */
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { launch, ensureLoggedIn } from "./_browser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_URL = "https://business.pinterest.com/en/create/bulk-upload/";

async function main() {
  const { context, page } = await launch({ headless: false });

  try {
    await ensureLoggedIn(page);

    console.log("→ 一括アップロードページへ移動");
    await page.goto(UPLOAD_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(3000);

    console.log("現在のURL:", page.url());

    // スクリーンショット
    const ss = path.join(__dirname, "inspect-upload.png");
    await page.screenshot({ path: ss, fullPage: true });
    console.log("スクリーンショット:", ss);

    // ページ内の input 要素を全て列挙
    const inputs = await page.evaluate(() => {
      const els = document.querySelectorAll("input");
      return Array.from(els).map((el) => ({
        type: el.type,
        accept: el.accept,
        id: el.id,
        name: el.name,
        className: el.className.slice(0, 60),
        hidden: el.type === "hidden" || el.style.display === "none" || getComputedStyle(el).display === "none",
      }));
    });
    console.log("\ninput 要素:", JSON.stringify(inputs, null, 2));

    // ボタン・リンクの一覧
    const buttons = await page.evaluate(() => {
      const els = document.querySelectorAll("button, a[role='button'], div[role='button']");
      return Array.from(els).slice(0, 30).map((el) => ({
        tag: el.tagName,
        text: (el as HTMLElement).innerText?.slice(0, 60).trim(),
        "data-test-id": el.getAttribute("data-test-id"),
        "aria-label": el.getAttribute("aria-label"),
      }));
    });
    console.log("\nボタン・リンク一覧:", JSON.stringify(buttons, null, 2));

    // ドラッグ&ドロップゾーン
    const dropzones = await page.evaluate(() => {
      const els = document.querySelectorAll("[data-drop-zone], [ondrop], [class*='drop'], [class*='upload'], [class*='drag']");
      return Array.from(els).slice(0, 10).map((el) => ({
        tag: el.tagName,
        className: (el as HTMLElement).className?.slice(0, 80),
        "data-test-id": el.getAttribute("data-test-id"),
      }));
    });
    console.log("\nドロップゾーン:", JSON.stringify(dropzones, null, 2));

    console.log("\nブラウザを開いたまま確認してください。Ctrl+C で終了。");
    await page.waitForTimeout(60_000);

  } finally {
    await context.close();
  }
}

main().catch(console.error);
