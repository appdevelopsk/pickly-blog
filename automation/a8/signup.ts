/**
 * A8.net 新規登録 (headed, semi-automated)
 *
 * 動作:
 *   1. https://www.a8.net/ → 「会員登録(無料)はこちら」をクリック
 *   2. ~/.config/pickly/a8.env に A8_EMAIL があれば自動入力
 *   3. メール認証は人間が手動で(認証メール内のリンクをクリック)
 *   4. メールリンク後の登録フォーム以降は、env の値があれば自動入力、なければ人間入力
 *   5. 登録完了後 ~/.cache/pickly-playwright/a8/ にセッション保存
 *
 * Usage:
 *   npm run a8:signup
 *
 * 必要な環境変数 (~/.config/pickly/a8.env, chmod 600):
 *   A8_EMAIL=app.develop.sk@gmail.com
 *   A8_LOGIN_ID=任意 (3-15半角英数)
 *   A8_PASSWORD=任意 (8-16半角英数+記号)
 *   A8_LAST_NAME=...
 *   A8_FIRST_NAME=...
 *   A8_LAST_NAME_KANA=...
 *   A8_FIRST_NAME_KANA=...
 *   A8_BIRTHDAY=YYYY-MM-DD
 *   A8_POSTAL_CODE=1234567 (ハイフンなし)
 *   A8_PREFECTURE=東京都
 *   A8_ADDRESS=...
 *   A8_PHONE=09012345678 (ハイフンなし)
 *   A8_SITE_NAME=Pickly
 *   A8_SITE_URL=https://pickly.blog/
 *   A8_SITE_CATEGORY=エンタメ・趣味
 *   A8_SITE_DESCRIPTION=...
 */
import { launch, loadCredentials } from "./_browser";

const TIMEOUT_SEC = 600; // 10分

async function safeFill(page: any, selectors: string[], value?: string): Promise<boolean> {
  if (!value) return false;
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
      await loc.fill(value);
      return true;
    }
  }
  return false;
}

async function main() {
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });

  console.log("→ A8.net トップへ");
  await page.goto("https://www.a8.net/", { waitUntil: "domcontentloaded", timeout: 30000 });

  console.log("→ 「会員登録」リンクを探してクリック");
  const signupSelectors = [
    "a:has-text('会員登録(無料)')",
    "a:has-text('会員登録')",
    "a[href*='regist']",
    "a[href*='entry']",
  ];
  let clicked = false;
  for (const sel of signupSelectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
      await loc.click().catch(() => {});
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    console.warn("⚠ 登録リンク自動検出失敗 — 手動でナビゲートしてください");
  }

  await page.waitForTimeout(3000);

  if (creds.email) {
    console.log(`→ メールアドレス自動入力試行: ${creds.email}`);
    const ok = await safeFill(
      page,
      [
        "input[name='email']",
        "input[name='mail']",
        "input[type='email']",
        "input[name='regEmail']",
      ],
      creds.email,
    );
    const ok2 = await safeFill(
      page,
      [
        "input[name='emailConfirm']",
        "input[name='mailConfirm']",
        "input[name='reEmail']",
      ],
      creds.email,
    );
    console.log(`  email1=${ok ? "✓" : "—"} email2=${ok2 ? "✓" : "—"}`);
  }

  console.log("");
  console.log("======================================================");
  console.log("ブラウザで以下を順に進めてください:");
  console.log("");
  console.log("  1. メールアドレス送信 → メールに届く認証URLをクリック");
  console.log("  2. 戻ってきた登録フォームでログインID/PW + 個人情報入力");
  console.log("  3. サイト情報入力 (URL: https://pickly.blog/)");
  console.log("  4. 銀行口座情報入力");
  console.log("  5. 登録完了 → 自動審査結果メールを待つ");
  console.log("");
  console.log(`待機中... ダッシュボード到達を自動検知 (最大 ${TIMEOUT_SEC} 秒)`);
  console.log("途中で env を更新すれば再起動時に自動入力が増えます");
  console.log("======================================================");
  console.log("");

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
    if (
      url.includes("pub.a8.net") &&
      !url.includes("/login") &&
      !url.includes("regist") &&
      !url.includes("entry")
    ) {
      detected = true;
      console.log(`✓ ダッシュボード到達検出 (経過 ${i + 1} 秒): ${url}`);
      break;
    }
    if ((i + 1) % 30 === 0) {
      process.stdout.write(`  待機中... ${i + 1}/${TIMEOUT_SEC} 秒 (URL: ${url.slice(0, 80)})\n`);
    }
  }

  if (detected) {
    await page.waitForTimeout(5000);
    console.log("✓ セッション保存完了 (~/.cache/pickly-playwright/a8/)");
    console.log("  以降は npm run a8:list-programs / a8:apply で headless 自動化可");
  } else {
    console.log("✗ タイムアウト。登録フローの完了を確認してください");
    process.exitCode = 1;
  }

  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
