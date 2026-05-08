/**
 * もしもアフィリエイト 初回ログイン (headed, auto-detect)
 *
 * 動作:
 *   1. Chromium 開いてログインページ表示
 *   2. ユーザーが ID/PW + reCAPTCHA を解く
 *   3. ダッシュボードに到達したことを自動検知
 *   4. セッション永続化 → 自動終了
 *
 * Usage:
 *   npm run moshimo:login
 *
 * タイムアウト: 5分(300秒)。それまでにダッシュボード到達しないと exit 1。
 */
import { launch } from "./_browser";

const TIMEOUT_SEC = 300;

async function main() {
  const { context, page } = await launch({ headless: false });

  console.log("→ Chromium を開いて もしもログインページへ");
  try {
    await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch (e) {
    console.error("ログインページ到達失敗:", e);
    await context.close();
    process.exit(1);
  }

  console.log("");
  console.log("======================================================");
  console.log("ブラウザで以下を完了してください:");
  console.log("");
  console.log("  1. ID + パスワードでログイン");
  console.log("  2. reCAPTCHA があれば人間として解く");
  console.log("  3. 2FA があればコード入力");
  console.log("  4. ダッシュボード到達まで進む");
  console.log("");
  console.log(`待機中... ダッシュボード到達を自動検知します(最大 ${TIMEOUT_SEC} 秒)`);
  console.log("======================================================");
  console.log("");

  let detected = false;
  for (let i = 0; i < TIMEOUT_SEC; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      // ページが閉じられた等
      console.log("ブラウザが閉じられました");
      break;
    }
    // ログイン後のURLパターン: /af/user/... or /af/dashboard など
    // ログイン画面のままなら /af/user/login
    if (!url.includes("/login") && (url.includes("/af/shop/") || url.includes("/af/dashboard") || url === "https://af.moshimo.com/")) {
      // 二度確認: ダッシュボード固有要素
      try {
        const hasMediaText = (await page.locator("text=メディア").count()) > 0;
        if (hasMediaText) {
          detected = true;
          console.log(`✓ ログイン検出 (経過 ${i + 1} 秒)`);
          console.log(`  URL: ${url}`);
          break;
        }
      } catch {
        // continue polling
      }
    }
    // Progress 表示 (10秒ごと)
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`  待機中... ${i + 1}/${TIMEOUT_SEC} 秒 (現在URL: ${url.slice(0, 60)})\n`);
    }
  }

  if (detected) {
    // 5秒待って、追加クッキーが完全に保存されるのを待つ
    await page.waitForTimeout(5000);
    console.log("✓ セッション保存完了 (~/.cache/pickly-playwright/moshimo/)");
    console.log("  以降の自動スクリプトは headless で実行できます");
  } else {
    console.log("✗ タイムアウト。ログインが完了しませんでした");
    process.exitCode = 1;
  }

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
