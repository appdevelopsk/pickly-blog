/**
 * もしも - 認証情報を環境変数から自動入力するログイン。
 *
 * 使い方:
 *   MOSHIMO_LOGIN_ID="xxx" MOSHIMO_LOGIN_PW="xxx" npm run moshimo:auto-login
 *
 * 動作:
 *   1. Chromium 開いてログインページへ
 *   2. ID/PW を自動入力 → ログインボタンクリック
 *   3. reCAPTCHA が出たら headed のまま人間操作待ち
 *   4. ダッシュボード到達を自動検知
 *
 * セキュリティ: 認証情報は環境変数のみで受け取り、ファイル/ログに書き出さない。
 */
import { launch } from "./_browser";

const TIMEOUT_SEC = 300;

async function main() {
  const id = process.env.MOSHIMO_LOGIN_ID;
  const pw = process.env.MOSHIMO_LOGIN_PW;
  if (!id || !pw) {
    console.error("ERROR: MOSHIMO_LOGIN_ID と MOSHIMO_LOGIN_PW を環境変数で渡してください");
    process.exit(2);
  }

  const { context, page } = await launch({ headless: false });
  console.log("→ もしもログインページへ");
  await page.goto("https://af.moshimo.com/af/shop/login", { waitUntil: "domcontentloaded", timeout: 30000 });

  console.log("→ ID/PW 自動入力");
  // 候補セレクタを順に試す
  const idSelectors = [
    "input[name='loginId']",
    "input[name='id']",
    "input[name='email']",
    "input[type='email']",
    "input[type='text']:visible",
    "#loginId",
  ];
  const pwSelectors = [
    "input[name='loginPwd']",
    "input[name='password']",
    "input[type='password']",
    "#loginPwd",
  ];

  let idFilled = false;
  for (const sel of idSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && await loc.isVisible().catch(() => false)) {
      await loc.fill(id);
      idFilled = true;
      break;
    }
  }
  if (!idFilled) {
    console.error("✗ ID 入力欄が見つかりません");
    await context.close();
    process.exit(1);
  }

  let pwFilled = false;
  for (const sel of pwSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && await loc.isVisible().catch(() => false)) {
      await loc.fill(pw);
      pwFilled = true;
      break;
    }
  }
  if (!pwFilled) {
    console.error("✗ パスワード入力欄が見つかりません");
    await context.close();
    process.exit(1);
  }

  // ログインボタンクリック
  console.log("→ ログインボタンクリック");
  const submitSelectors = [
    "button[type='submit']",
    "input[type='submit']",
    "button:has-text('ログイン')",
    "input[value*='ログイン']",
  ];
  let clicked = false;
  for (const sel of submitSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0) {
      await loc.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    console.error("✗ ログインボタンが見つかりません(自動でEnter送信を試行)");
    await page.keyboard.press("Enter");
  }

  console.log("");
  console.log("→ ダッシュボード到達を検知中…(reCAPTCHAが出た場合は手動で解いてください)");

  let detected = false;
  for (let i = 0; i < TIMEOUT_SEC; i++) {
    await page.waitForTimeout(1000);
    let url = "";
    try {
      url = page.url();
    } catch {
      console.log("ブラウザが閉じられました");
      break;
    }
    if (!url.includes("/login")) {
      detected = true;
      console.log(`✓ ログイン成功 (経過 ${i + 1} 秒)`);
      console.log(`  URL: ${url}`);
      break;
    }
    if ((i + 1) % 10 === 0) {
      console.log(`  待機中... ${i + 1}/${TIMEOUT_SEC} 秒 (URL: ${url.slice(0, 70)})`);
    }
  }

  if (detected) {
    await page.waitForTimeout(3000);
    console.log("✓ セッション保存完了");
  } else {
    console.log("✗ タイムアウト");
    process.exitCode = 1;
  }

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
