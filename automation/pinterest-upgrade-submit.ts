/**
 * Pinterest Standard Access 申請を自動化
 * Usage: npx tsx pinterest-upgrade-submit.ts
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import * as path from "path";
import * as os from "os";

process.loadEnvFile(new URL(".env", import.meta.url).pathname);
const PINTEREST_EMAIL = process.env.PINTEREST_EMAIL!;
const PINTEREST_PASSWORD = process.env.PINTEREST_PASSWORD!;

const VIDEO_DIR = path.join(os.tmpdir(), "pickly-demo-video");
const VIDEO_OUT = path.join(os.tmpdir(), "pickly-demo.mp4");

async function recordDemoVideo(): Promise<string> {
  // 既に録画済みなら再利用
  if (existsSync(VIDEO_OUT)) {
    console.log("既存の動画を再利用:", VIDEO_OUT);
    return VIDEO_OUT;
  }

  console.log("デモ動画を録画中...");
  if (!existsSync(VIDEO_DIR)) mkdirSync(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  await page.goto("https://pickly.blog/en/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.goto("https://pickly.blog/en/articles/best-vpn-2026/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(2000);
  await page.goto("https://pickly.blog/ja/articles/best-vpn-2026/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();

  const files = execSync(`ls -t "${VIDEO_DIR}"/*.webm 2>/dev/null || echo ""`)
    .toString().trim().split("\n").filter(Boolean);
  if (files.length === 0) throw new Error("動画ファイル未生成");

  execSync(`ffmpeg -y -i "${files[0]}" -c:v libx264 -preset fast "${VIDEO_OUT}" 2>/dev/null`);
  console.log("動画準備完了:", VIDEO_OUT);
  return VIDEO_OUT;
}

async function loginPinterest(page: ReturnType<import("playwright").Browser["newPage"]> extends Promise<infer T> ? T : never): Promise<void> {
  console.log("Pinterest にログイン中...");
  await page.goto("https://www.pinterest.com/login/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // メールアドレス入力
  await page.fill('input[name="id"]', PINTEREST_EMAIL);
  await page.waitForTimeout(500);
  await page.fill('input[name="password"]', PINTEREST_PASSWORD);
  await page.waitForTimeout(500);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
  console.log("ログイン後URL:", page.url());
}

async function submitUpgradeForm(videoPath: string): Promise<void> {
  console.log("\n申請フォームを送信中...");
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // Pinterest にログイン
  await loginPinterest(page);

  // Developer Portal のアプリページへ
  console.log("アプリページへ移動...");
  await page.goto("https://developers.pinterest.com/apps/1568630", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  console.log("URL:", page.url());

  await page.screenshot({ path: "/tmp/dev-portal-app.png" });

  // "Upgrade access" リンクをクリック
  const upgradeLink = await page.$("a:has-text('Upgrade access'), a:has-text('Upgrade'), button:has-text('Upgrade')");
  if (!upgradeLink) {
    console.log("Upgrade リンクが見つかりません。ページ内リンク一覧:");
    const links = await page.$$eval("a", (els: HTMLAnchorElement[]) =>
      els.map((e) => ({ text: e.textContent?.trim(), href: e.href })).filter((l) => l.text)
    );
    console.log(JSON.stringify(links.slice(0, 20), null, 2));
    await browser.close();
    return;
  }

  console.log("Upgrade access をクリック...");
  await upgradeLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
  console.log("フォームURL:", page.url());
  await page.screenshot({ path: "/tmp/upgrade-form-before.png" });

  // 動画アップロード
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    console.log("動画をアップロード中...");
    await fileInput.setInputFiles(videoPath);
    // アップロード完了を待つ（プログレスバーが消えるまで）
    await page.waitForTimeout(8000);
    console.log("動画アップロード完了");
  } else {
    console.log("⚠️ file input が見つかりません");
  }

  // Use cases チェックボックス
  // "Pin creation & scheduling" を探す
  for (const label of ["Pin creation", "pin_creation", "scheduling"]) {
    const cb = await page.$(`input[type="checkbox"][value*="${label}"], label:has-text("Pin creation") input[type="checkbox"]`);
    if (cb && !(await cb.isChecked())) {
      await cb.click();
      console.log(`✅ Pin creation チェック`);
      break;
    }
  }
  // ラベルテキストで探す
  const pinLabel = await page.$("label:has-text('Pin creation')");
  if (pinLabel) {
    await pinLabel.click();
    console.log("✅ Pin creation ラベルをクリック");
  }

  // Audience: Creators
  const creatorLabel = await page.$("label:has-text('Creator')");
  if (creatorLabel) {
    await creatorLabel.click();
    console.log("✅ Creators ラベルをクリック");
  }

  await page.screenshot({ path: "/tmp/upgrade-form-filled.png", fullPage: true });
  console.log("フォーム記入後のスクリーンショット: /tmp/upgrade-form-filled.png");

  // Submit
  const submitBtn = await page.$("button[type='submit']:has-text('Submit'), button:has-text('Submit')");
  if (submitBtn) {
    console.log("Submit をクリック...");
    await submitBtn.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);
    console.log("送信後URL:", page.url());
    const resultText = await page.innerText("body").catch(() => "");
    console.log("結果:", resultText.slice(0, 500));
    await page.screenshot({ path: "/tmp/upgrade-result.png" });
    console.log("結果スクリーンショット: /tmp/upgrade-result.png");
  } else {
    console.log("⚠️ Submit ボタンが見つかりません");
    await page.waitForTimeout(20000);
  }

  await browser.close();
}

async function main() {
  const videoPath = await recordDemoVideo();
  await submitUpgradeForm(videoPath);
  console.log("\n完了");
}

main().catch(console.error);
