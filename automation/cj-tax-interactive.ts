/**
 * CJ 税務情報: 同一セッションで再送信 → コード入力 → 提出
 * 再送信後に /tmp/cj-code.txt にコードを書き込むと続行する
 * Usage:
 *   npx tsx cj-tax-interactive.ts   # ターミナル1で実行
 *   echo "123456" > /tmp/cj-code.txt  # コードが届いたらターミナル2で実行
 */
import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync, unlinkSync } from "fs";
import * as path from "path";
import * as os from "os";
import * as fsp from "fs/promises";

const USER_DATA_DIR = path.join(os.homedir(), ".cache/pickly-playwright/cj");
const CODE_FILE = "/tmp/cj-code.txt";

async function waitForCodeFile(timeoutMs = 300000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (existsSync(CODE_FILE)) {
      const code = readFileSync(CODE_FILE, "utf-8").trim();
      unlinkSync(CODE_FILE);
      return code;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("タイムアウト: コードファイルが見つかりません");
}

async function main() {
  await fsp.mkdir(USER_DATA_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true, viewport: { width: 1280, height: 900 }, locale: "en-US",
  });
  const page = context.pages()[0] ?? await context.newPage();
  page.setDefaultTimeout(30000);

  await page.goto(
    "https://members.cj.com/member/app/publisher/account/settings/tax-information",
    { waitUntil: "domcontentloaded" }
  );
  try { await page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 15000 }); } catch {}
  await page.waitForTimeout(2000);

  // 「編集」クリック
  await page.locator("text=編集").first().click({ force: true });
  await page.waitForTimeout(2000);

  const body1 = await page.evaluate(() => document.body.innerText);
  if (!body1.includes("確認コード")) {
    console.log("確認コード画面なし:", body1.slice(0, 300));
    await context.close();
    return;
  }
  console.log("✅ 確認コード画面確認");

  // 再送信
  const resend = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("span, a, button"));
    const el = els.find((e) => e.textContent?.includes("もう一度送信"));
    if (el) { (el as HTMLElement).click(); return "resent"; }
    return "resend not found";
  });
  console.log("再送信:", resend);
  await page.waitForTimeout(2000);

  console.log("\n📧 新しいコードを app.develop.sk@gmail.com に送信しました");
  console.log("コードが届いたら: echo '<コード>' > /tmp/cj-code.txt\n");
  writeFileSync("/tmp/cj-waiting.txt", "waiting");

  // コードファイル待機（最大5分）
  const code = await waitForCodeFile();
  console.log("コード受信:", code);

  // 同一セッションでコード入力
  const inputLocator = page.locator('[data-testid="verification-code-input"]');
  await inputLocator.click({ force: true });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(code, { delay: 80 });
  await page.waitForTimeout(300);

  const val = await inputLocator.inputValue().catch(() => "n/a");
  console.log("フィールド値:", val);

  // 提出
  await page.locator("button:has-text('提出')").first().click({ force: true });
  console.log("提出クリック");
  await page.waitForTimeout(6000);

  const body2 = await page.evaluate(() => document.body.innerText);
  console.log("提出後:\n", body2.slice(0, 3000));
  writeFileSync("/tmp/cj-tax-result.html", await page.content());

  await context.close();
}
main().catch(console.error);
