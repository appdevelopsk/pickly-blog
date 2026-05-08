/**
 * Wise を開いて USD account details (ABA routing + account number) を探す
 *
 * 専用 profile (~/.cache/pickly-playwright/wise/) — 初回のみ手動ログイン要
 *
 * Usage: npm run wise:explore
 */
import { chromium, type Page } from "playwright";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";

const PROFILE_DIR = path.join(os.homedir(), ".cache/pickly-playwright/wise");

async function main() {
  await fs.mkdir(PROFILE_DIR, { recursive: true });

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = context.pages()[0] ?? (await context.newPage());

  console.log("→ Wise home");
  await page.goto("https://wise.com/home", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);

  // ログイン待機 (最大10分)
  console.log("→ Chromium ウィンドウで Wise にログインしてください (最大10分待機)");
  let loggedIn = false;
  for (let i = 0; i < 600; i++) {
    const url = page.url();
    if (!url.includes("/login") && !url.includes("/register")) {
      // dashboard 到達を確認
      const text = await page.evaluate(() => document.body.innerText.slice(0, 2000)).catch(() => "");
      if (/balance|transfer|send money|account details|recipients/i.test(text)) {
        console.log(`✓ ログイン済 (${i + 1}秒): ${url}`);
        loggedIn = true;
        break;
      }
    }
    if (i % 30 === 0) console.log(`  待機中... ${i}/600秒  URL=${url.slice(0, 80)}`);
    await page.waitForTimeout(1000);
  }
  if (!loggedIn) {
    console.log("✗ ログイン未完了 — ブラウザ放置して終了");
    await page.waitForTimeout(60000);
    await context.close();
    return;
  }

  await dumpPage(page, "wise-home-after-login");

  // Home ページのリンク全部 dump
  console.log("\n→ Home の全リンク/ボタン (USD/balance/account/receive 関連)");
  const links = await page.evaluate(() => {
    const out: { tag: string; text: string; href: string; testid: string }[] = [];
    document.querySelectorAll("a[href], button, [role='button']").forEach((el) => {
      const text = (el.textContent || "").trim().slice(0, 80);
      const href = (el as HTMLAnchorElement).getAttribute?.("href") || "";
      const testid = el.getAttribute("data-testid") || el.getAttribute("data-test-id") || "";
      out.push({ tag: el.tagName, text, href, testid });
    });
    return out;
  });
  const filtered = links.filter((l) =>
    /usd|balance|account details|receive|open|add.*currency|currency|routing|aba/i.test(l.text + " " + l.href + " " + l.testid)
  );
  console.log(`関連 ${filtered.length}/${links.length} 件:`);
  for (const l of filtered.slice(0, 30)) {
    console.log(`  [${l.tag}] "${l.text}" href=${l.href.slice(0, 60)} testid=${l.testid}`);
  }

  // USD らしきカード/ボタンをクリック試行
  console.log("\n→ USD バランスカード/「Open a balance」を click 試行");
  const usdClick = await page.evaluate(() => {
    // パターン1: USDテキストを含むカード
    const cards = Array.from(document.querySelectorAll("a, button, [role='button']"));
    const usd = cards.find((c) => /USD/.test((c.textContent || "").slice(0, 40)));
    if (usd) {
      (usd as HTMLElement).click();
      return { found: "USD card", text: (usd.textContent || "").slice(0, 60) };
    }
    // パターン2: "Open a balance" / "Add" buttons
    const open = cards.find((c) => /open.*balance|add.*balance|add.*currency/i.test(c.textContent || ""));
    if (open) {
      (open as HTMLElement).click();
      return { found: "Open balance button", text: (open.textContent || "").slice(0, 60) };
    }
    return null;
  });
  console.log(`  click result: ${JSON.stringify(usdClick)}`);
  await page.waitForTimeout(4000);
  console.log(`  click 後 URL: ${page.url()}`);
  await dumpPage(page, "wise-after-usd-click");

  // ページ内容に ABA routing 9桁が含まれるか
  const fullText = await page.evaluate(() => document.body.innerText).catch(() => "");
  const aba = fullText.match(/\b(0\d{8})\b/g);
  const acct = fullText.match(/account number[\s\S]{1,40}?(\d{8,16})/i);
  if (aba) console.log(`\n💡 ABA candidates: ${aba.slice(0, 5).join(", ")}`);
  if (acct) console.log(`💡 Account Number candidate: ${acct[1]}`);

  console.log("\n→ 5分間ブラウザ放置 (人間が USD details 画面に移動して内容を確認可能)");
  console.log("   USD 詳細画面に到達したら、画面の Routing Number / Account Number を貼ってください");
  await page.waitForTimeout(300000);
  await context.close();
}

async function dumpPage(page: Page, label: string) {
  const screenshotPath = `/tmp/${label}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  console.log(`  📸 ${screenshotPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
