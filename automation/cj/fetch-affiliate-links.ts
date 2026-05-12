/**
 * CJ Affiliate でSurfsharkプログラムの状態を確認する
 * Usage: npx tsx cj/fetch-affiliate-links.ts
 */
import { chromium } from "playwright";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");

function loadEnv(): Record<string, string> {
  const file = path.join(os.homedir(), ".config/pickly/cj.env");
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8").split("\n")
      .filter(l => l.includes("="))
      .map(l => l.split("=", 2) as [string, string])
  );
}

const env = loadEnv();
const EMAIL    = env.CJ_EMAIL    ?? "";
const PASSWORD = env.CJ_PASSWORD ?? "";
const TARGETS  = ["Surfshark", "NordVPN", "ExpressVPN"];

async function main() {
  await fs.mkdir(USER_DATA_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);

  // セッション確認
  console.log("CJダッシュボード確認...");
  await page.goto("https://members.cj.com/member/publisher/home.do", {
    waitUntil: "domcontentloaded", timeout: 30000,
  });
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());

  if (page.url().includes("login") || page.url().includes("auth")) {
    console.log("→ ログイン中...");
    await page.goto("https://members.cj.com/member/login.do", {
      waitUntil: "domcontentloaded", timeout: 30000,
    });
    await page.waitForTimeout(3000);

    // Step 1: username
    await page.fill("input[name='username']", EMAIL);
    console.log("✓ username入力");

    // Next ボタン or Enter
    const nextBtn = page.locator("button[type='submit'], input[type='submit'], button:has-text('Continue'), button:has-text('Next'), button:has-text('Sign In')").first();
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
      console.log("✓ Next クリック");
    } else {
      await page.keyboard.press("Enter");
    }
    await page.waitForTimeout(3000);
    console.log("Step2 URL:", page.url());

    // Step 2: password（表示されるまで待つ）
    await page.waitForSelector("input[type='password']:visible", { timeout: 10000 }).catch(() => {});
    const pwdVisible = await page.locator("input[type='password']:visible").count();
    console.log("password表示:", pwdVisible > 0 ? "あり" : "なし");

    if (pwdVisible > 0) {
      await page.fill("input[type='password']:visible", PASSWORD);
      console.log("✓ password入力");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(5000);
    } else {
      await page.screenshot({ path: "/tmp/cj-step2.png" });
      console.log("パスワードフィールド未発見。スクリーンショット: /tmp/cj-step2.png");
    }

    console.log("ログイン後URL:", page.url());
  }

  await page.screenshot({ path: "/tmp/cj-dashboard.png" });
  writeFileSync("/tmp/cj-dashboard.html", await page.content());

  const bodyText = await page.innerText("body").catch(() => "");
  console.log("\nページテキスト先頭800:", bodyText.slice(0, 800));

  for (const t of TARGETS) {
    console.log(`${t}: ${bodyText.includes(t) ? "✓ 発見" : "✗ 未発見"}`);
  }

  // Advertiser一覧ページも確認
  console.log("\n参加中広告主ページ確認...");
  for (const url of [
    "https://members.cj.com/member/publisher/advertisers/my.do",
    "https://members.cj.com/member/publisher/home.do",
  ]) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);
    const t = await page.innerText("body").catch(() => "");
    const found = TARGETS.filter(k => t.includes(k));
    if (found.length > 0 || !page.url().includes("login")) {
      console.log(`✓ ${page.url()} → ${found.join(", ") || "テキスト取得"}`);
      writeFileSync(`/tmp/cj-advertisers.html`, await page.content());
      console.log("Surfshark:", t.includes("Surfshark") ? "参加中" : "未参加");
      break;
    }
  }

  await context.close();
}

main().catch(console.error);
