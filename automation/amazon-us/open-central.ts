/**
 * Amazon Associates Central を再オープン (signup 後の continue 用)
 *
 * Usage:
 *   npm run amazon-us:open
 */
import { launch } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  console.log("→ Amazon Associates Central へ");
  await page.goto("https://affiliate-program.amazon.com/home", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  console.log("");
  console.log("ブラウザを開いたまま自由に操作してください。");
  console.log("Ctrl+C で終了 (セッションは ~/.cache/pickly-playwright/amazon-us/ に保持)");

  // 永続待機 (1時間 = 3600秒)
  for (let i = 0; i < 3600; i++) {
    await page.waitForTimeout(1000);
    try {
      page.url();
    } catch {
      console.log("ブラウザが閉じられました");
      break;
    }
  }
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
