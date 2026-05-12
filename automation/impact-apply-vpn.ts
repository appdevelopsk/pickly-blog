/**
 * Impact.com — NordVPN / ExpressVPN / ProtonVPN に参加申し込み
 * Usage: npx tsx impact-apply-vpn.ts
 */
import { chromium, type Page } from "playwright";
import { writeFileSync } from "fs";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const EMAIL = process.env.IMPACT_EMAIL!;
const PASSWORD = process.env.IMPACT_PASSWORD!;

const VPN_PROGRAMS = ["NordVPN", "ExpressVPN", "ProtonVPN"];

async function login(page: Page): Promise<boolean> {
  console.log("Impact.com ログイン中...");
  await page.goto("https://app.impact.com/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());

  // メール入力
  const emailField = await page.$('input[type="email"], input[name="email"], input[name="username"], #username');
  if (emailField) {
    await emailField.fill(EMAIL);
    await page.waitForTimeout(500);
    // Next ボタンがあれば押す
    const nextBtn = await page.$('button:has-text("Next"), button:has-text("Continue"), input[type="submit"]');
    if (nextBtn) { await nextBtn.click(); await page.waitForTimeout(2000); }
  }

  // パスワード入力
  const passField = await page.$('input[type="password"], input[name="password"]');
  if (passField) {
    await passField.fill(PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  }

  const url = page.url();
  console.log("ログイン後URL:", url);
  writeFileSync("/tmp/impact-login.png", await page.screenshot());

  if (url.includes("dashboard") || url.includes("partner") || url.includes("impact.com/secure")) {
    console.log("✅ ログイン成功");
    return true;
  }
  console.log("⚠️ ログイン確認できず:", url);
  return false;
}

async function searchAndApply(page: Page, programName: string): Promise<void> {
  console.log(`\n========== ${programName} ==========`);

  // Marketplace / Find Brands ページ
  await page.goto("https://app.impact.com/secure/mediapartner/marketplace/search.ihtml", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(3000);
  console.log("Marketplace URL:", page.url());
  writeFileSync(`/tmp/impact-marketplace.png`, await page.screenshot());

  // 検索ボックスに入力
  const searchBox = await page.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i], input[name="keyword"], input[name="search"]');
  if (searchBox) {
    await searchBox.fill(programName);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    console.log("検索実行");
  } else {
    // URLパラメータで検索
    await page.goto(
      `https://app.impact.com/secure/mediapartner/marketplace/search.ihtml?keyword=${encodeURIComponent(programName)}`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForTimeout(3000);
  }

  writeFileSync(`/tmp/impact-search-${programName}.png`, await page.screenshot({ fullPage: true }));
  const pageText = await page.innerText("body").catch(() => "");
  console.log(`検索結果テキスト（最初500文字）:`, pageText.slice(0, 500));

  // Apply / Request to Join ボタンを探す
  const applyBtns = await page.$$('button:has-text("Apply"), button:has-text("Join"), a:has-text("Apply"), a:has-text("Request to join")');
  console.log(`申し込みボタン数: ${applyBtns.length}`);

  if (applyBtns.length > 0) {
    await applyBtns[0].click();
    await page.waitForTimeout(3000);
    console.log("申し込みクリック後URL:", page.url());
    writeFileSync(`/tmp/impact-apply-${programName}.png`, await page.screenshot({ fullPage: true }));

    // 確認ダイアログ
    const confirmBtn = await page.$('button:has-text("Submit"), button:has-text("Confirm"), button:has-text("Apply")');
    if (confirmBtn) {
      await confirmBtn.click();
      await page.waitForTimeout(3000);
      const result = await page.innerText("body").catch(() => "");
      console.log(`申し込み完了テキスト:`, result.slice(0, 300));
    }
  } else {
    // リンクを全部列挙
    const links = await page.$$eval("a, button", (els: Element[]) =>
      els.map((e) => e.textContent?.trim().replace(/\s+/g, " ") ?? "").filter((t) => t.length > 0 && t.length < 50)
    );
    console.log("ページのボタン/リンク:", links.slice(0, 20));
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const loggedIn = await login(page);
  if (!loggedIn) {
    // ログイン状態をスクリーンショットで確認
    const pageText = await page.innerText("body").catch(() => "");
    console.log("ページテキスト:", pageText.slice(0, 500));
    await browser.close();
    return;
  }

  for (const program of VPN_PROGRAMS) {
    try {
      await searchAndApply(page, program);
    } catch (err) {
      console.error(`${program} エラー:`, err);
    }
    await page.waitForTimeout(2000);
  }

  await browser.close();
  console.log("\n完了");
}

main().catch(console.error);
