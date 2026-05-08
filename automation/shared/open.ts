/**
 * 共有 Google profile でブラウザを開いて URL に navigate
 *
 * Usage: npm run open <url>
 *   例: npm run open https://app.impact.com
 */
import { launch } from "./_browser";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("usage: npm run open <url>");
    process.exit(1);
  }

  const { context, page } = await launch({ headless: false, locale: "en-US" });
  console.log(`→ ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  console.log(`現在URL: ${page.url()}`);
  console.log("");
  console.log("ブラウザを開いています — 自由に操作してください");
  console.log("Sign in with Google で app.develop.sk@gmail.com が自動選択されるはず");
  console.log("Ctrl+C で終了 (セッションは保存されます)");

  // 30分 keep-alive
  for (let i = 0; i < 1800; i++) {
    try {
      await page.waitForTimeout(1000);
    } catch {
      console.log("ブラウザが閉じられました");
      return;
    }
  }
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
