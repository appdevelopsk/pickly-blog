/**
 * Awin Dashboard を開いて広告主ディレクトリへ誘導
 *
 * Usage:
 *   npm run awin:open
 *
 * セッションは ~/.cache/pickly-playwright/awin/ に永続化済なので
 * 既ログイン状態で開くはず。未ログインなら手動でログインしてください。
 */
import { launch } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });

  console.log("→ Awin Dashboard へ");
  await page
    .goto("https://ui.awin.com/affiliate/advertisers", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })
    .catch(() => {});

  console.log("");
  console.log("======================================================");
  console.log("広告主 (Advertisers / Programmes) ディレクトリを開きました");
  console.log("");
  console.log("やること:");
  console.log("  1. Sector または keyword で絞り込み (VPN / Beauty / Home etc.)");
  console.log("  2. 興味ある広告主に「Join Programme」を申請");
  console.log("  3. 申請済みの merchant ID を控える (後で bulk スクリプト用)");
  console.log("");
  console.log("ブラウザを閉じるとセッションは保持されます");
  console.log("======================================================");

  // 1時間 keep-alive
  for (let i = 0; i < 3600; i++) {
    await page.waitForTimeout(1000).catch(() => {
      console.log("ブラウザが閉じられました");
      process.exit(0);
    });
  }

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
