/**
 * Pinterest ジャンル別アカウントセットアップ支援スクリプト。
 *
 * 各ジャンルアカウントの:
 *   1. サインアップ (メール確認のみ手動)
 *   2. ビジネスアカウント化
 *   3. ボード作成
 *   4. ボードID取得 → 設定ファイルへ自動保存
 *
 * Usage:
 *   npx tsx setup-accounts.ts --status          # 設定状況確認
 *   npx tsx setup-accounts.ts --genre fitness   # fitness アカウントをセットアップ
 *   npx tsx setup-accounts.ts --genre food
 *   npx tsx setup-accounts.ts --board-only      # ボードID取得のみ（ログイン済み前提）
 *
 * 前提: ~/.config/pickly/pinterest-{genre}.env に
 *       PINTEREST_LOGIN_EMAIL と PINTEREST_LOGIN_PW を先に設定すること
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { chromium } from "playwright";
import { ACCOUNTS, loadAccountCreds, printAccountStatus, type PinterestAccount } from "./accounts.js";

// ── Browser helper (accounts 用の独立版) ────────────────────────────────────

async function launchForAccount(account: PinterestAccount) {
  await fs.promises.mkdir(account.sessionDir, { recursive: true });
  const context = await chromium.launchPersistentContext(account.sessionDir, {
    headless: false,
    viewport: { width: 1280, height: 850 },
    locale: "en-US",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  let page = context.pages()[0];
  if (!page) page = await context.newPage();
  return { context, page };
}

async function waitForEnter(prompt: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<void>((resolve) => {
    rl.question(prompt, () => { rl.close(); resolve(); });
  });
}

// ── Setup steps ───────────────────────────────────────────────────────────────

async function checkLoggedIn(page: import("playwright").Page): Promise<boolean> {
  await page.goto("https://www.pinterest.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  return !page.url().includes("/login") && !page.url().includes("/business/create");
}

async function doLogin(page: import("playwright").Page, email: string, pw: string) {
  await page.goto("https://www.pinterest.com/login/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.locator("input[type='email'], input[name='id'], input#email").first().fill(email);
  await page.locator("input[type='password']").first().fill(pw);
  await page.keyboard.press("Enter");
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    if (!page.url().includes("/login")) return;
  }
  throw new Error("ログイン失敗 (30秒タイムアウト)");
}

async function convertToBusiness(page: import("playwright").Page) {
  // すでにビジネスかチェック
  await page.goto("https://business.pinterest.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  if (page.url().includes("business.pinterest.com") && !page.url().includes("/create")) {
    console.log("  → すでにビジネスアカウント");
    return;
  }
  // ビジネス変換ページ
  await page.goto("https://www.pinterest.com/business/convert/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const convertBtn = page.locator("button:has-text('Convert'), button:has-text('ビジネス')").first();
  if (await convertBtn.count() > 0) {
    await convertBtn.click();
    await page.waitForTimeout(3000);
    console.log("  → ビジネスアカウントに変換完了");
  } else {
    console.log("  → ビジネス変換ボタンが見つかりません（手動確認を）");
    await waitForEnter("  ブラウザで手動変換後、Enterを押してください: ");
  }
}

async function createBoardAndGetId(page: import("playwright").Page, boardName: string): Promise<string | null> {
  // ボード一覧ページへ
  await page.goto("https://www.pinterest.com/me/boards/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // ボード名が既にあるか確認
  const existing = page.locator(`[aria-label*='${boardName}'], a:has-text('${boardName}')`).first();
  if (await existing.count() > 0) {
    console.log(`  → ボード「${boardName}」は既に存在`);
  } else {
    // ボード作成
    const createBtn = page.locator("button:has-text('Create board'), button:has-text('ボードを作成'), [data-test-id='create-board']").first();
    if (await createBtn.count() > 0) {
      await createBtn.click();
      await page.waitForTimeout(1000);
      const nameInput = page.locator("input[placeholder*='Name'], input[id*='board'], input[placeholder*='ボード名']").first();
      if (await nameInput.count() > 0) {
        await nameInput.fill(boardName);
        await page.waitForTimeout(500);
        const submitBtn = page.locator("button:has-text('Create'), button:has-text('作成'), button[type='submit']").first();
        if (await submitBtn.count() > 0) await submitBtn.click();
        await page.waitForTimeout(2000);
        console.log(`  → ボード「${boardName}」作成完了`);
      }
    } else {
      console.log("  → ボード作成ボタンが見つかりません（手動作成を）");
      await waitForEnter(`  「${boardName}」ボードを手動作成後、Enterを押してください: `);
    }
  }

  // ボードIDを取得（URL から）
  await page.goto("https://www.pinterest.com/me/boards/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const boardLink = page.locator(`a[href*='/board/'], a[href*='/_/boards/']`).filter({ hasText: boardName }).first();
  if (await boardLink.count() > 0) {
    const href = await boardLink.getAttribute("href");
    const idMatch = href?.match(/\/(\d+)\//);
    if (idMatch) return idMatch[1];
  }

  // Pinterest API でボードIDを取得（フォールバック）
  const userUrl = page.url();
  console.log("  → ボードIDを URL から取得できませんでした。Pinterest API で確認してください。");
  return null;
}

function saveEnvValue(envFile: string, key: string, value: string) {
  let content = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
  const regex = new RegExp(`^(?:export\\s+)?${key}=.*$`, "m");
  const newLine = `${key}=${value}`;
  if (regex.test(content)) {
    content = content.replace(regex, newLine);
  } else {
    content = content.trimEnd() + "\n" + newLine + "\n";
  }
  fs.mkdirSync(path.dirname(envFile), { recursive: true });
  fs.writeFileSync(envFile, content);
  console.log(`  → ${envFile} に ${key} を保存`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function setupAccount(account: PinterestAccount) {
  const creds = loadAccountCreds(account);

  console.log(`\n${"─".repeat(50)}`);
  console.log(`▶ ${account.genre} アカウントセットアップ`);
  console.log(`  表示名: ${account.displayName}`);
  console.log(`  ボード: ${account.boardName}`);
  console.log(`  設定ファイル: ${account.envFile}`);

  if (!creds.email || !creds.pw) {
    console.log(`\n  ⚠ 認証情報未設定。${account.envFile} を作成してください:`);
    console.log(`    PINTEREST_LOGIN_EMAIL=pickly.${account.genre}@gmail.com`);
    console.log(`    PINTEREST_LOGIN_PW=<パスワード>`);
    console.log("\n  Google Workspace や Proton Mail で専用メールを作成することを推奨。");
    return;
  }

  const { context, page } = await launchForAccount(account);

  try {
    // 1. ログイン確認
    const loggedIn = await checkLoggedIn(page);
    if (!loggedIn) {
      console.log("  → ログイン中...");
      await doLogin(page, creds.email, creds.pw);
      await page.waitForTimeout(2000);
      console.log("  ✓ ログイン完了");
    } else {
      console.log("  ✓ ログイン済み");
    }

    // 2. ビジネスアカウント化
    await convertToBusiness(page);

    // 3. ボード作成 & ID取得
    const boardId = await createBoardAndGetId(page, account.boardName);
    if (boardId) {
      console.log(`  ✓ ボードID: ${boardId}`);
      saveEnvValue(account.envFile, "PINTEREST_BOARD_ID", boardId);
      saveEnvValue(account.envFile, "PINTEREST_BOARD_NAME", account.boardName);
    } else {
      console.log("  ⚠ ボードIDが取得できませんでした。手動でPinterestのボードURLから確認してください。");
    }

    await page.waitForTimeout(2000);
    console.log(`\n  ✓ ${account.genre} セットアップ完了`);

  } finally {
    await context.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const genreFilter = args.find((_, i) => args[i - 1] === "--genre");
  const statusOnly  = args.includes("--status");
  const boardOnly   = args.includes("--board-only");

  printAccountStatus();
  if (statusOnly) return;

  const targets = genreFilter
    ? ACCOUNTS.filter((a) => a.genre === genreFilter)
    : ACCOUNTS.filter((a) => a.genre !== "default"); // default は既存アカウントなのでスキップ

  if (targets.length === 0) {
    console.error(`ジャンル「${genreFilter}」が見つかりません。`);
    console.error("利用可能: " + ACCOUNTS.map((a) => a.genre).join(", "));
    process.exit(1);
  }

  if (!boardOnly) {
    console.log("新しい Pinterest アカウントの作成が必要な場合は:");
    console.log("  1. https://www.pinterest.com/business/create/ でサインアップ");
    console.log("  2. 各ジャンルに専用メールを用意（例: pickly.fitness@gmail.com）");
    console.log("  3. ~/.config/pickly/pinterest-{genre}.env に EMAIL と PW を設定");
    console.log("  4. このスクリプトを再実行\n");
  }

  for (const account of targets) {
    await setupAccount(account);
  }

  console.log("\n全アカウントセットアップ完了。");
  console.log("次: npm run pinterest:pin でジャンル別に投稿開始。");
}

main().catch((e) => { console.error(e); process.exit(1); });
