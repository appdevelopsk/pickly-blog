/**
 * Google サインインを共有プロファイルに焼く (1回だけ実行)
 *
 * フロー:
 *   1. Chromium 起動 → accounts.google.com/signin
 *   2. email を自動入力 → Next クリック
 *   3. password + 2FA は **人間が手動入力** (5分以内)
 *   4. myaccount.google.com に到達したら成功 → cookie がprofileに保存
 *
 * Usage: npm run google:signin
 */
import { launch, isSignedIn, GOOGLE_EMAIL } from "./_browser";
import type { Page } from "playwright";

const TIMEOUT_SEC = 600; // 10分

async function fillFirst(page: Page, sels: string[], val: string): Promise<boolean> {
  for (const s of sels) {
    const loc = page.locator(s).first();
    try {
      if ((await loc.count()) > 0 && (await loc.isVisible({ timeout: 1500 }).catch(() => false))) {
        await loc.fill(val);
        return true;
      }
    } catch {}
  }
  return false;
}

async function clickFirst(page: Page, sels: string[]): Promise<boolean> {
  for (const s of sels) {
    const loc = page.locator(s).first();
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
  const { context, page } = await launch({ headless: false });

  console.log("→ サインイン状態チェック");
  if (await isSignedIn(page)) {
    console.log(`✓ 既に Google サインイン済 (${GOOGLE_EMAIL})`);
    console.log("プロファイル: ~/.cache/pickly-playwright/shared-google/");
    await page.waitForTimeout(2000);
    await context.close();
    return;
  }

  console.log("→ accounts.google.com/signin へ");
  await page.goto("https://accounts.google.com/signin", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  // email 自動入力
  console.log(`→ email 自動入力: ${GOOGLE_EMAIL}`);
  const emailOk = await fillFirst(
    page,
    [
      "input[type='email']",
      "input[name='identifier']",
      "input[name='Email']",
      "input[id='identifierId']",
    ],
    GOOGLE_EMAIL,
  );
  console.log(`  email: ${emailOk ? "✓" : "✗"}`);

  await page.waitForTimeout(500);
  const nextOk = await clickFirst(page, [
    "button:has-text('Next')",
    "button:has-text('次へ')",
    "#identifierNext",
    "button[type='submit']",
  ]);
  console.log(`  Next click: ${nextOk ? "✓" : "✗"}`);

  console.log("");
  console.log("======================================================");
  console.log("ブラウザで以下を完了してください (10分以内):");
  console.log("");
  console.log("  1. パスワードを手動入力 → Next");
  console.log("  2. 2FA (SMS/Authenticator) があれば対応");
  console.log("  3. \"Welcome\" / myaccount.google.com に到達したら完了");
  console.log("");
  console.log("ブラウザを閉じないこと — 完了を自動検出します");
  console.log("======================================================");

  // myaccount.google.com に到達するまで polling
  for (let i = 0; i < TIMEOUT_SEC; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      console.log("ブラウザが閉じられました");
      return;
    }
    if (url.includes("myaccount.google.com") || url.includes("accounts.google.com/CheckCookie")) {
      console.log(`\n✓ サインイン完了検出 (${i + 1}秒): ${url}`);
      break;
    }
    if ((i + 1) % 30 === 0) {
      process.stdout.write(`  待機中 ${i + 1}/${TIMEOUT_SEC}秒 (${url.slice(0, 60)})\n`);
    }
  }

  // 念のため myaccount に navigate して cookie を焼く
  await page.goto("https://myaccount.google.com/", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(3000);

  if (await isSignedIn(page)) {
    console.log("✓ プロファイルに Google サインイン状態を保存");
    console.log(`  パス: ~/.cache/pickly-playwright/shared-google/`);
    console.log(`  以降のスクリプトは shared/_browser.ts の launch() でこのプロファイルを使用`);
  } else {
    console.log("✗ サインイン未完了 — もう一度実行してください");
    process.exitCode = 1;
  }

  await page.waitForTimeout(3000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
