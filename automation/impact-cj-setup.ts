/**
 * Impact アカウント完了 + CJ 新規登録
 * headless:false で表示しながら自動入力、reCAPTCHA など手動操作が必要な箇所は待機
 * Usage: npx tsx impact-cj-setup.ts
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const IMPACT_EMAIL    = process.env.IMPACT_EMAIL!;
const IMPACT_PASSWORD = process.env.IMPACT_PASSWORD!;
const CJ_EMAIL        = process.env.CJ_EMAIL!;
const CJ_PASSWORD     = process.env.CJ_PASSWORD!;

/* ─────────────────── IMPACT ─────────────────── */
async function impactSetup(): Promise<void> {
  console.log("\n====== Impact アカウント完了 ======");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
    ],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);

  // Impact ログイン
  console.log("Impact ログインページへ...");
  await page.goto("https://app.impact.com/login.user", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  console.log("URL:", page.url());
  writeFileSync("/tmp/impact-1.png", await page.screenshot());

  const bodyText = await page.innerText("body").catch(() => "");
  if (bodyText.includes("security verification") || bodyText.includes("Cloudflare")) {
    console.log("⏳ Cloudflare 検証中... 15秒待機");
    await page.waitForTimeout(15000);
  }

  // メール入力
  for (const sel of ['input[name="email"]', 'input[type="email"]', '#email', 'input[name="username"]']) {
    const el = await page.$(sel);
    if (el && await el.isVisible()) {
      await el.fill(IMPACT_EMAIL);
      console.log("メール入力完了");
      break;
    }
  }

  // パスワード（同一画面 or Next 後）
  let passEl = await page.$('input[type="password"]');
  if (!passEl) {
    const nextBtn = await page.$('button[type="submit"], button:has-text("Next"), button:has-text("Continue")');
    if (nextBtn) { await nextBtn.click(); await page.waitForTimeout(2000); }
    passEl = await page.$('input[type="password"]');
  }
  if (passEl) {
    await passEl.fill(IMPACT_PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);
  }

  console.log("ログイン後 URL:", page.url());
  writeFileSync("/tmp/impact-2-post-login.png", await page.screenshot());
  const afterText = await page.innerText("body").catch(() => "");
  console.log("ログイン後テキスト（500文字）:", afterText.slice(0, 500));

  // ダッシュボードチェック
  if (page.url().includes("dashboard") || page.url().includes("partner") || page.url().includes("secure")) {
    console.log("✅ Impact ログイン成功");

    // Marketplace で申し込み
    for (const kw of ["NordVPN", "ExpressVPN", "ProtonVPN"]) {
      console.log(`\n--- ${kw} ---`);
      await page.goto(
        `https://app.impact.com/secure/mediapartner/marketplace/search.ihtml?keyword=${encodeURIComponent(kw)}`,
        { waitUntil: "domcontentloaded" }
      );
      await page.waitForTimeout(3000);
      writeFileSync(`/tmp/impact-search-${kw}.png`, await page.screenshot({ fullPage: true }));

      const applyBtn = await page.$('button:has-text("Apply"), button:has-text("Request to join"), a:has-text("Apply")');
      if (applyBtn) {
        console.log(`✅ Apply ボタン発見`);
        await applyBtn.click();
        await page.waitForTimeout(3000);
        const confirmBtn = await page.$('button:has-text("Submit"), button:has-text("Confirm")');
        if (confirmBtn) { await confirmBtn.click(); await page.waitForTimeout(3000); }
        writeFileSync(`/tmp/impact-applied-${kw}.png`, await page.screenshot());
        const result = await page.innerText("body").catch(() => "");
        console.log(`申し込み結果:`, result.slice(0, 200));
      } else {
        const pageText2 = await page.innerText("body").catch(() => "");
        console.log(`Apply ボタンなし。テキスト:`, pageText2.slice(0, 300));
      }
    }
  } else {
    console.log("⚠️ ログイン失敗。URL:", page.url());
    // アカウント完了ページの可能性
    if (page.url().includes("onboard") || page.url().includes("setup") || page.url().includes("complete")) {
      console.log("アカウント完了ページ検出 — 30秒間手動操作をお待ちします");
      await page.waitForTimeout(30000);
    }
  }

  await browser.close();
}

/* ─────────────────── CJ ─────────────────── */
async function cjSetup(): Promise<void> {
  console.log("\n====== CJ Affiliate 登録 ======");

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);

  // まずログイン試行
  console.log("CJ ログイン試行...");
  await page.goto("https://signin.cj.com/u/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const emailInput = await page.$('input[name="username"], input[type="email"]');
  if (emailInput) {
    await emailInput.fill(CJ_EMAIL);
    const cont = await page.$('button[type="submit"], button:has-text("Continue")');
    if (cont) { await cont.click(); await page.waitForTimeout(2000); }
  }

  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.fill(CJ_PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(4000);
  }

  console.log("ログイン後 URL:", page.url());
  writeFileSync("/tmp/cj-post-login.png", await page.screenshot());

  if (!page.url().includes("login") && !page.url().includes("signin") && page.url().includes("cj.com")) {
    console.log("✅ CJ ログイン成功");

    // Surfshark 検索・申し込み
    await page.goto("https://app.cj.com/member/publisher/advertisers?keywords=Surfshark", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    writeFileSync("/tmp/cj-search-surfshark.png", await page.screenshot({ fullPage: true }));
    const searchText = await page.innerText("body").catch(() => "");
    console.log("Surfshark 検索結果（400文字）:", searchText.slice(0, 400));

    const applyBtn = await page.$('a:has-text("Apply"), button:has-text("Apply"), input[value*="Apply"]');
    if (applyBtn) {
      await applyBtn.click();
      await page.waitForTimeout(3000);
      console.log("✅ Surfshark Apply 完了");
      writeFileSync("/tmp/cj-apply-done.png", await page.screenshot());
    }
  } else {
    // 新規登録
    console.log("ログイン失敗 → 新規登録");
    await page.goto("https://public.cj.com/signup/publisher", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Country を Japan に設定（カスタムドロップダウン）
    const countryEl = await page.$('[class*="country"] input, select[name*="ountry"]');
    if (countryEl) {
      await countryEl.click();
      await page.waitForTimeout(500);
      await countryEl.fill("Japan");
      await page.waitForTimeout(500);
      const japanOpt = await page.$('li:has-text("Japan"), option[value="JP"]');
      if (japanOpt) { await japanOpt.click(); }
    } else {
      // セレクトボックス
      const sel = await page.$('select');
      if (sel) { await sel.selectOption({ label: "Japan" }); }
    }

    await page.$eval('input[name="email"], input[type="email"]', (el: HTMLInputElement, v: string) => el.value = v, CJ_EMAIL).catch(() => {});
    const emailEl = await page.$('input[name="email"], input[type="email"]');
    if (emailEl) { await emailEl.fill(CJ_EMAIL); }
    const pass1 = await page.$('input[type="password"]:first-of-type, input[name="password"]');
    if (pass1) { await pass1.fill(CJ_PASSWORD); }
    const pass2Els = await page.$$('input[type="password"]');
    if (pass2Els.length >= 2) { await pass2Els[1].fill(CJ_PASSWORD); }

    writeFileSync("/tmp/cj-signup-filled.png", await page.screenshot({ fullPage: true }));
    console.log("⏳ reCAPTCHA を手動でチェックして Submit を押してください（90秒待機）...");
    await page.waitForTimeout(90000);

    writeFileSync("/tmp/cj-signup-result.png", await page.screenshot());
    const result = await page.innerText("body").catch(() => "");
    console.log("登録結果（500文字）:", result.slice(0, 500));

    if (!result.includes("SUBMIT") && (result.includes("email") || result.includes("verify") || result.includes("success"))) {
      console.log("✅ CJ 登録送信完了（メール確認が必要な場合あり）");
    }
  }

  await browser.close();
}

async function main() {
  await impactSetup().catch((e) => console.error("Impact エラー:", e.message));
  await cjSetup().catch((e) => console.error("CJ エラー:", e.message));
  console.log("\n全処理完了");
}

main().catch(console.error);
