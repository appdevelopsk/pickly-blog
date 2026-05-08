/**
 * Pinterest Business 登録ページを Chromium で開く(headed)。
 * ユーザーが手動で signup → 完了したらブラウザを閉じてください。
 *
 * Usage: npx tsx pinterest/signup-open.ts
 */
import { chromium } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/pinterest");

async function main() {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });

  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 850 },
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = ctx.pages()[0] ?? (await ctx.newPage());
  console.log("→ Pinterest Business 登録ページを開きます");
  console.log("  https://business.pinterest.com/business/create/");
  console.log("");
  console.log("ブラウザで以下を完了してください:");
  console.log("  1. Email: App.develop.sk@gmail.com を入力");
  console.log("  2. パスワード入力 (Pinterest 用、覚えやすいもの)");
  console.log("  3. 生年月日入力 (18歳以上であれば何でもOK)");
  console.log("  4. ビジネス情報:");
  console.log("     - ビジネス名: Pickly");
  console.log("     - ビジネスタイプ: Blog または Other / 個人");
  console.log("     - Webサイト: https://pickly.blog");
  console.log("     - 国: Japan");
  console.log("  5. 興味カテゴリは Home decor / Tech / Lifestyle 等を選択");
  console.log("");
  console.log("セッションは ~/.cache/pickly-playwright/pinterest/ に永続化されます");
  console.log("登録完了したらブラウザを閉じるか Ctrl+C で終了");

  await page.goto("https://business.pinterest.com/business/create/", { waitUntil: "domcontentloaded" });

  // 永続: ブラウザが閉じるまで待つ
  await new Promise<void>((resolve) => {
    ctx.on("close", () => resolve());
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
