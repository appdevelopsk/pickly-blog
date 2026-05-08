/**
 * Pinterest Developer Console を開く(headed)。
 * App 作成 + API キー取得用。
 *
 * ユーザータスク:
 *   1. 「Create app」ボタンクリック
 *   2. App name: Pickly Pinterest Bot
 *      App description: Auto-pinning for Pickly affiliate articles
 *   3. Use case: Marketing
 *   4. URL: https://pickly.blog
 *   5. Tos 同意 → Create app
 *   6. 作成された App ID と App Secret を控える
 *   7. 「Add redirect URIs」 で http://localhost:8080/callback を追加
 *   8. 「Standard access」 を申請(自動承認のことが多い)
 *
 * 完了後、ターミナルでブラウザを閉じてください。
 */
import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);

  console.log("→ Pinterest Developer Console を開きます");
  await page.goto("https://developers.pinterest.com/apps/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  console.log("");
  console.log("=========================================================");
  console.log("ブラウザで以下を完了してください:");
  console.log("");
  console.log("  1. 「Create app」または「+ New app」ボタンをクリック");
  console.log("  2. フォーム入力:");
  console.log("     App name: Pickly Pinterest Bot");
  console.log("     App description: Auto-pinning for Pickly affiliate articles");
  console.log("     Use case: Marketing or Content publishing");
  console.log("     Website URL: https://pickly.blog");
  console.log("  3. 同意 → Create app");
  console.log("  4. アプリ詳細画面で:");
  console.log("     - 「App ID」 と 「App secret key」 をコピー");
  console.log("     - 「Redirect URIs」 で http://localhost:8080/callback 追加");
  console.log("     - 「Standard access」 申請(あれば)");
  console.log("");
  console.log("コピーした App ID + App Secret を Claude に貼り付けてください。");
  console.log("=========================================================");
  console.log("");
  console.log("作業中はブラウザを開いたまま、Ctrl+C でも閉じてOK");

  // Wait until browser closed
  await new Promise<void>((resolve) => {
    context.on("close", () => resolve());
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
