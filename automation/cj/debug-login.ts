import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");
const EMAIL    = process.env.CJ_EMAIL!;
const PASSWORD = process.env.CJ_PASSWORD!;

async function main() {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,   // headed で確認
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
  });

  const page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);

  await page.goto("https://members.cj.com/member/login.do", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // Step1: username
  await page.fill("input[name='username']", EMAIL).catch(() => {});
  await page.waitForTimeout(500);

  const nextBtn = page.locator("button[type='submit'], input[type='submit']").first();
  await nextBtn.click().catch(() => page.keyboard.press("Enter"));
  await page.waitForTimeout(3000);

  // Step2: password
  await page.waitForSelector("input[type='password']:visible", { timeout: 8000 }).catch(() => {});
  await page.fill("input[type='password']:visible", PASSWORD).catch(() => {});
  await page.waitForTimeout(500);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(8000);

  const url = page.url();
  const text = await page.innerText("body").catch(() => "");
  console.log("URL:", url);
  console.log("テキスト:", text.slice(0, 500));
  await page.screenshot({ path: "/tmp/cj-result.png" });
  writeFileSync("/tmp/cj-result.html", await page.content());

  if (url.includes("login") || text.includes("Something went wrong") || text.includes("wrong")) {
    console.log("\n✗ ログイン失敗 — パスワードが違うか、メール認証が必要な可能性があります");
    console.log("スクリーンショット: /tmp/cj-result.png");
  } else {
    console.log("\n✓ ログイン成功");
    // Surfshark 参加状況確認
    await page.goto("https://members.cj.com/member/publisher/advertisers/my.do", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    const t2 = await page.innerText("body").catch(() => "");
    console.log("Surfshark:", t2.includes("Surfshark") ? "✓ 参加中" : "✗ 未参加");
    writeFileSync("/tmp/cj-advertisers.html", await page.content());
    await page.screenshot({ path: "/tmp/cj-advertisers.png" });
  }

  // 15秒待機してブラウザを見られるようにする
  await page.waitForTimeout(15000);
  await context.close();
}

main().catch(console.error);
