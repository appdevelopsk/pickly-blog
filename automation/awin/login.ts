/**
 * Awin auto-login (Auth0 universal login flow)
 *
 * Auth0 のフロー:
 *   Step 1: identifier (username) + Continue
 *   Step 2: password + Continue
 *   (任意) 2FA / consent → 手動補完
 *
 * Usage: npm run awin:login
 */
import { launch, loadCredentials } from "./_browser";
import type { Page } from "playwright";

const AFFILIATE_ID = "2887303";

async function fillFirstVisible(page: Page, selectors: string[], value: string): Promise<boolean> {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible({ timeout: 1500 }).catch(() => false))) {
        await loc.fill(value);
        return true;
      }
    } catch {}
  }
  return false;
}

async function clickFirstVisible(page: Page, selectors: string[]): Promise<boolean> {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible({ timeout: 1500 }).catch(() => false))) {
        await loc.click();
        return true;
      }
    } catch {}
  }
  return false;
}

async function main() {
  const creds = loadCredentials();
  if (!creds.email || !creds.password) {
    console.error("✗ AWIN_EMAIL / AWIN_PASSWORD が ~/.config/pickly/awin.env に必要");
    process.exit(1);
  }

  const { context, page } = await launch({ headless: false });

  console.log("→ Awin Affiliate Dashboard へ");
  await page.goto(`https://ui.awin.com/awin/affiliate/${AFFILIATE_ID}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3500);

  let url = page.url();
  console.log(`現在URL: ${url}`);

  // Auth0 ログイン (id.awin.com に飛ばされた場合)
  if (url.includes("id.awin.com") || url.includes("login")) {
    console.log("→ Auth0 ログイン (Step 1: username)");

    const usernameOk = await fillFirstVisible(
      page,
      [
        "input[name='username']",
        "input[type='email']",
        "input[autocomplete='username']",
        "input[id*='username']",
      ],
      creds.email,
    );
    console.log(`  username: ${usernameOk ? "✓" : "✗"}`);

    await page.waitForTimeout(400);
    await clickFirstVisible(page, [
      "button[type='submit']",
      "button:has-text('Continue')",
      "button[name='action']",
    ]);

    // Step 2: password ページが出るのを待つ
    console.log("→ Step 2: password (パスワード入力欄出現を待機)");
    let passwordVisible = false;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      const cnt = await page.locator("input[type='password']").count().catch(() => 0);
      if (cnt > 0) {
        passwordVisible = true;
        break;
      }
      // 飛ばされて元のサイトに戻るパターンもある
      if (!page.url().includes("login") && !page.url().includes("id.awin.com")) {
        console.log(`  ⓘ 既に dashboard に戻った: ${page.url()}`);
        break;
      }
    }

    if (passwordVisible) {
      const pwOk = await fillFirstVisible(
        page,
        [
          "input[type='password']",
          "input[name='password']",
          "input[autocomplete='current-password']",
        ],
        creds.password,
      );
      console.log(`  password: ${pwOk ? "✓" : "✗"}`);

      await page.waitForTimeout(400);
      await clickFirstVisible(page, [
        "button[type='submit']",
        "button:has-text('Continue')",
        "button:has-text('Log in')",
      ]);
    }

    // 認証完了 → ui.awin.com に戻るのを待つ
    console.log("→ 認証完了待機 (最大45秒)");
    for (let i = 0; i < 45; i++) {
      await page.waitForTimeout(1000);
      url = page.url();
      if (url.includes("ui.awin.com") && !url.includes("login")) {
        console.log(`✓ ログイン成功 (${i + 1}秒): ${url}`);
        break;
      }
      // 2FA 検出
      const otp = await page.locator("input[name*='code'], input[autocomplete='one-time-code']").count().catch(() => 0);
      if (otp > 0) {
        console.log("⚠ 2FAコード入力欄を検出 — 手動でコード入力 (90秒待機)");
        await page.waitForTimeout(90000);
      }
    }
  }

  await page.waitForTimeout(3000);
  console.log(`\n最終URL: ${page.url()}`);
  await page.screenshot({ path: "/tmp/awin-loggedin.png", fullPage: false });
  console.log(`✓ Screenshot: /tmp/awin-loggedin.png`);

  // ナビゲーション要素を取得
  const nav = await page.evaluate(() => {
    const links: Array<{ text: string; href: string }> = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const text = (a.textContent || "").trim().slice(0, 50);
      const href = (a as HTMLAnchorElement).getAttribute("href") || "";
      if (text && href && !href.startsWith("#") && !href.startsWith("mailto") && href.length > 1) {
        links.push({ text, href });
      }
    });
    return links;
  });

  console.log("\n=== ナビ全リンク ===");
  console.log(JSON.stringify(nav, null, 2));

  console.log("\n10秒後にブラウザを閉じます。");
  await page.waitForTimeout(10000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
