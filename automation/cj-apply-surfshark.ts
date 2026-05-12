/**
 * CJ Affiliate — Surfshark に参加申し込み（新規登録 or ログイン後申し込み）
 * Usage: npx tsx cj-apply-surfshark.ts
 */
import { chromium, type Page } from "playwright";
import { writeFileSync } from "fs";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const EMAIL = process.env.CJ_EMAIL!;
const PASSWORD = process.env.CJ_PASSWORD!;

async function tryLogin(page: Page): Promise<boolean> {
  console.log("CJ ログイン試行...");
  await page.goto("https://members.cj.com/member/login.do", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());
  writeFileSync("/tmp/cj-login.png", await page.screenshot());

  const emailField = await page.$('input[name="j_username"], input[type="email"], input[name="email"], #login');
  const passField = await page.$('input[name="j_password"], input[type="password"], input[name="password"]');

  if (emailField && passField) {
    await emailField.fill(EMAIL);
    await passField.fill(PASSWORD);
    const submitBtn = await page.$('input[type="submit"], button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")');
    if (submitBtn) { await submitBtn.click(); }
    else { await page.keyboard.press("Enter"); }
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    console.log("ログイン後URL:", page.url());
    writeFileSync("/tmp/cj-after-login.png", await page.screenshot());
    if (!page.url().includes("login") && !page.url().includes("signin")) {
      console.log("✅ ログイン成功");
      return true;
    }
  }
  return false;
}

async function signUp(page: Page): Promise<void> {
  console.log("CJ 新規登録中...");
  await page.goto("https://signup.cj.com/member/signup/publisher/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("登録ページURL:", page.url());
  writeFileSync("/tmp/cj-signup.png", await page.screenshot({ fullPage: true }));

  const pageText = await page.innerText("body").catch(() => "");
  console.log("登録ページテキスト（最初500文字）:", pageText.slice(0, 500));

  // フォームフィールドを埋める
  const fields: [string[], string][] = [
    [['input[name="email"]', 'input[type="email"]'], EMAIL],
    [['input[name="password"]', 'input[type="password"]'], PASSWORD],
    [['input[name="firstName"]', 'input[name="first-name"]'], "Kenichiro"],
    [['input[name="lastName"]', 'input[name="last-name"]'], "Sakamoto"],
    [['input[name="companyName"]', 'input[name="company"]'], "Pickly"],
    [['input[name="websiteUrl"]', 'input[name="website"]'], "https://pickly.blog/"],
  ];

  for (const [selectors, value] of fields) {
    for (const sel of selectors) {
      const el = await page.$(sel);
      if (el) { await el.fill(value); break; }
    }
  }

  await page.waitForTimeout(1000);
  writeFileSync("/tmp/cj-signup-filled.png", await page.screenshot({ fullPage: true }));

  const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Sign Up"), button:has-text("Create Account")');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    console.log("登録後URL:", page.url());
    writeFileSync("/tmp/cj-signup-result.png", await page.screenshot());
  }
}

async function searchAndApply(page: Page): Promise<void> {
  console.log("\n===== Surfshark 申し込み =====");

  // CJ のパブリッシャーダッシュボードで広告主検索
  const searchUrls = [
    "https://members.cj.com/member/publisher/home.do",
    "https://app.cj.com/member/publisher/advertisers",
  ];

  for (const url of searchUrls) {
    await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => {});
    await page.waitForTimeout(2000);
    if (!page.url().includes("login")) break;
  }

  console.log("ダッシュボードURL:", page.url());
  writeFileSync("/tmp/cj-dashboard.png", await page.screenshot());

  // 広告主検索
  await page.goto(
    "https://members.cj.com/member/publisher/advertisers.do?searchByApp=Search+Advertisers&keywords=Surfshark",
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForTimeout(3000);
  writeFileSync("/tmp/cj-search-surfshark.png", await page.screenshot({ fullPage: true }));

  const pageText = await page.innerText("body").catch(() => "");
  console.log("検索結果（最初600文字）:", pageText.slice(0, 600));

  // Apply ボタン
  const applyBtn = await page.$('a:has-text("Apply"), button:has-text("Apply"), a:has-text("Join"), input[value*="Apply"]');
  if (applyBtn) {
    console.log("✅ Applyボタン発見");
    await applyBtn.click();
    await page.waitForTimeout(3000);
    writeFileSync("/tmp/cj-apply-result.png", await page.screenshot({ fullPage: true }));
    const result = await page.innerText("body").catch(() => "");
    console.log("申し込み結果:", result.slice(0, 500));
  } else {
    const links = await page.$$eval("a, button", (els: Element[]) =>
      els.map((e) => e.textContent?.trim().replace(/\s+/g, " ") ?? "").filter((t) => t.length > 0 && t.length < 60)
    );
    console.log("ページのリンク:", links.slice(0, 20));
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const loggedIn = await tryLogin(page);
  if (!loggedIn) {
    console.log("ログイン失敗 → 新規登録を試みます");
    await signUp(page);
    // 登録後に再ログイン試行
    await tryLogin(page);
  }

  await searchAndApply(page);

  await browser.close();
  console.log("\n完了");
}

main().catch(console.error);
