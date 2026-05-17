/**
 * Bing Webmaster Tools — サイト追加 + 検証ヘルパー。
 *
 * Usage:
 *   npx tsx bing-webmaster-setup.ts
 *
 * 手順:
 *   1. ブラウザが開く → Microsoft/Google アカウントでログイン
 *   2. 「サイトを追加」→ https://pickly.blog を入力
 *   3. XML ファイル検証を選択 → ファイル名を確認
 *   4. このスクリプトがファイル名を検出して自動デプロイ
 *   5. Bing 検証ボタンをクリック
 */
import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../site/public");
const SITE_URL = "https://pickly.blog";

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log("\n=== Bing Webmaster Tools セットアップ ===\n");
  console.log("1. ブラウザでログイン後、以下の手順を実行してください:");
  console.log(`   - 「サイトを追加」→ ${SITE_URL} を入力`);
  console.log("   - 検証方法: 「XML ファイル」を選択");
  console.log("   - 生成されたファイル名をコピー（例: BingSiteAuth.xml）");
  console.log("\n2. このターミナルに XML ファイル名を貼り付けてください\n");

  await page.goto("https://www.bing.com/webmasters/home", { waitUntil: "domcontentloaded" });

  // Bing Webmaster Tools が完全に読み込まれるまで待機
  console.log("ブラウザが開きました。ログインしてサイト追加手順を進めてください。");
  console.log("（このウィンドウは手動操作用のブラウザです）\n");

  // ユーザー入力を待つ
  const readline = await import("readline");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const xmlFileName = await new Promise<string>((resolve) => {
    rl.question("Bing から生成された XML ファイル名を入力してください (例: BingSiteAuth.xml): ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!xmlFileName || !xmlFileName.endsWith(".xml")) {
    console.log("キャンセルまたは無効な入力です。");
    await browser.close();
    return;
  }

  // XML ファイルを public/ に作成（Bing の検証用）
  const xmlContent = `<?xml version="1.0"?>
<users>
  <user>${xmlFileName.replace(".xml", "")}</user>
</users>`;

  const xmlPath = path.join(PUBLIC_DIR, xmlFileName);
  fs.writeFileSync(xmlPath, xmlContent);
  console.log(`\n✓ ${xmlPath} を作成しました`);

  // git commit & push
  console.log("→ デプロイ中...");
  try {
    execSync(`git -C "${path.resolve(__dirname, "..")}" add "${xmlPath}"`, { stdio: "pipe" });
    execSync(
      `git -C "${path.resolve(__dirname, "..")}" commit -m "chore: add Bing Webmaster Tools verification file"`,
      { stdio: "pipe" }
    );
    execSync(`git -C "${path.resolve(__dirname, "..")}" push origin main`, { stdio: "pipe" });
    console.log("✓ GitHub にプッシュ完了 → Cloudflare Pages が自動デプロイ中");
  } catch (e) {
    console.error("git push に失敗しました:", e);
  }

  console.log(`\nデプロイ完了後 (1〜2分後) に Bing の「検証」ボタンをクリックしてください。`);
  console.log(`確認 URL: ${SITE_URL}/${xmlFileName}\n`);

  // デプロイ完了を確認
  console.log("ファイルが公開されたか確認中...");
  let live = false;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 15_000));
    try {
      const res = await fetch(`${SITE_URL}/${xmlFileName}`);
      if (res.ok) { live = true; break; }
    } catch {}
    process.stdout.write(".");
  }

  if (live) {
    console.log(`\n✓ ${SITE_URL}/${xmlFileName} が公開されました！`);
    console.log("Bing Webmaster Tools で「検証」ボタンをクリックしてください。");
  } else {
    console.log("\n⚠ ファイル確認タイムアウト。手動で確認してください。");
  }

  await new Promise((r) => setTimeout(r, 60_000)); // ユーザー操作のため待機
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
