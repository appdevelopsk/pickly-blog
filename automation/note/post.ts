/**
 * note.com 記事自動投稿スクリプト
 *
 * site/note-drafts/ のマークダウンファイルを note.com に投稿する。
 * 認証はブラウザセッションを ~/.config/pickly/note-session.json に保存して再利用。
 * 初回はブラウザが開くのでログインして Enter を押す。
 *
 * Usage:
 *   npm run note:post                       # 1件投稿 (デフォルト)
 *   npm run note:post -- --limit 5          # 5件投稿
 *   npm run note:post -- --dry-run          # 投稿せず一覧表示
 *   npm run note:post -- --reset            # 投稿済み状態をリセット
 *
 * State: ~/.config/pickly/note-posted.json
 * Session: ~/.config/pickly/note-session.json
 */
import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import * as readline from "node:readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS_DIR = path.resolve(__dirname, "../../site/note-drafts");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/note-posted.json");
const SESSION_PATH = path.join(os.homedir(), ".config/pickly/note-session.json");
const SLEEP_BETWEEN_MS = 30_000; // 30s between posts (rate limit safety)

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESET = args.includes("--reset");
const getLimitArg = () => { const i = args.indexOf("--limit"); return i >= 0 ? parseInt(args[i + 1], 10) : 1; };
const LIMIT = getLimitArg();

interface State { posted: Record<string, string> } // slug → ISO timestamp

function loadState(): State {
  if (RESET) return { posted: {} };
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")); }
  catch { return { posted: {} }; }
}

function saveState(s: State) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 2));
}

function parseDraft(content: string): { title: string; body: string } {
  const lines = content.split("\n");
  // First line is "# タイトル"
  const titleLine = lines[0] ?? "";
  const title = titleLine.replace(/^#+\s*/, "").trim();
  // Body is everything after the title line (skip blank line)
  const body = lines.slice(2).join("\n").trim();
  return { title, body };
}

function listDrafts(): string[] {
  return fs.readdirSync(DRAFTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
}

async function waitForEnter(message: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((resolve) => {
    rl.question(message, () => { rl.close(); resolve(); });
  });
}

async function ensureLoggedIn(page: import("playwright").Page): Promise<boolean> {
  await page.goto("https://note.com", { waitUntil: "domcontentloaded", timeout: 30_000 });
  // Check if already logged in by looking for the user icon / 投稿する button
  const isLoggedIn = await page.locator('a[href*="/notes/new"], a[href*="login"]').first().isVisible({ timeout: 5_000 }).catch(() => false);
  const hasLoginLink = await page.locator('a[href*="login"]').isVisible({ timeout: 3_000 }).catch(() => false);
  if (hasLoginLink) {
    console.log("⚠ note.com にログインしていません。ブラウザでログインしてください。");
    await page.goto("https://note.com/login", { waitUntil: "domcontentloaded" });
    await waitForEnter("  ログイン完了後、Enter キーを押してください: ");
    // Save session after login
    const ctx = page.context();
    const cookies = await ctx.cookies();
    const storage = await ctx.storageState();
    fs.mkdirSync(path.dirname(SESSION_PATH), { recursive: true });
    fs.writeFileSync(SESSION_PATH, JSON.stringify(storage, null, 2));
    console.log("✓ セッションを保存しました。次回から自動ログインします。");
    return true;
  }
  return true;
}

async function postArticle(
  page: import("playwright").Page,
  title: string,
  body: string
): Promise<boolean> {
  // Navigate to new article page
  await page.goto("https://note.com/notes/new", { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(2_000);

  // Select "テキスト" type if prompted (sometimes shows article type selector)
  const textBtn = page.locator('button:has-text("テキスト"), [data-type="text"]').first();
  if (await textBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await textBtn.click();
    await page.waitForTimeout(1_000);
  }

  // Fill title
  const titleInput = page.locator('textarea[placeholder*="タイトル"], input[placeholder*="タイトル"], [data-placeholder*="タイトル"]').first();
  await titleInput.waitFor({ timeout: 15_000 });
  await titleInput.click();
  await page.keyboard.type(title, { delay: 20 });
  await page.waitForTimeout(500);

  // Move to body and fill
  await page.keyboard.press("Tab");
  await page.waitForTimeout(300);

  // Try to find the body editor (contenteditable div)
  const bodyEditor = page.locator('div[contenteditable="true"]').first();
  await bodyEditor.waitFor({ timeout: 10_000 });
  await bodyEditor.click();
  await page.waitForTimeout(300);

  // Paste body text (faster than keyboard.type for long text)
  await page.evaluate((text: string) => {
    const el = document.querySelector('div[contenteditable="true"]') as HTMLElement;
    if (el) {
      el.focus();
      // Use execCommand for compatibility
      document.execCommand("insertText", false, text);
    }
  }, body);
  await page.waitForTimeout(1_000);

  // Click publish button
  const publishBtn = page.locator('button:has-text("公開"), button:has-text("投稿")').first();
  if (!await publishBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    console.error("  ✗ 公開ボタンが見つかりません");
    return false;
  }
  await publishBtn.click();
  await page.waitForTimeout(2_000);

  // Confirm publish dialog if it appears
  const confirmBtn = page.locator('button:has-text("公開する"), button:has-text("投稿する")').last();
  if (await confirmBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await confirmBtn.click();
    await page.waitForTimeout(3_000);
  }

  // Check success (URL changed to the published article)
  const url = page.url();
  if (url.includes("/notes/n") || url.includes("note.com") && !url.includes("/new")) {
    return true;
  }

  // Screenshot for debugging
  const ssPath = path.join(os.tmpdir(), `note-post-${Date.now()}.png`);
  await page.screenshot({ path: ssPath, timeout: 5_000 }).catch(() => {});
  console.error(`  ✗ 投稿確認に失敗 (screenshot: ${ssPath})`);
  return false;
}

async function main() {
  const allDrafts = listDrafts();
  const state = loadState();
  const pending = allDrafts.filter((f) => !state.posted[f.replace(".md", "")]);
  const targets = pending.slice(0, LIMIT);

  console.log(`📝 note.com 投稿スクリプト`);
  console.log(`  下書き: ${allDrafts.length} 件 | 投稿済み: ${Object.keys(state.posted).length} 件 | 残り: ${pending.length} 件`);
  console.log(`  今回投稿: ${targets.length} 件\n`);

  if (DRY_RUN) {
    console.log("Dry-run — 投稿予定:");
    for (const f of targets) {
      const content = fs.readFileSync(path.join(DRAFTS_DIR, f), "utf8");
      const { title } = parseDraft(content);
      console.log(`  ${f}: ${title}`);
    }
    return;
  }

  if (targets.length === 0) {
    console.log("投稿する記事がありません。");
    return;
  }

  // Launch browser with saved session if available
  const contextOptions: Parameters<typeof chromium.launchPersistentContext>[1] = {
    headless: false,
    viewport: { width: 1280, height: 900 },
    slowMo: 50,
  };

  let storageState: object | undefined;
  if (fs.existsSync(SESSION_PATH)) {
    try {
      storageState = JSON.parse(fs.readFileSync(SESSION_PATH, "utf8"));
    } catch {}
  }

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ...(storageState ? { storageState: SESSION_PATH } : {}),
  });
  const page = await ctx.newPage();

  try {
    await ensureLoggedIn(page);

    let ok = 0, fail = 0;

    for (let i = 0; i < targets.length; i++) {
      const filename = targets[i];
      const slug = filename.replace(".md", "");
      const content = fs.readFileSync(path.join(DRAFTS_DIR, filename), "utf8");
      const { title, body } = parseDraft(content);

      console.log(`[${i + 1}/${targets.length}] ${slug}`);
      console.log(`  タイトル: ${title}`);

      const success = await postArticle(page, title, body);
      if (success) {
        state.posted[slug] = new Date().toISOString();
        saveState(state);
        console.log(`  ✓ 投稿完了`);
        ok++;
      } else {
        fail++;
        console.error(`  ✗ 投稿失敗`);
      }

      if (i < targets.length - 1) {
        console.log(`  ⏱ ${SLEEP_BETWEEN_MS / 1000}s 待機...\n`);
        await new Promise((r) => setTimeout(r, SLEEP_BETWEEN_MS));
      }
    }

    // Save updated session
    const finalStorage = await ctx.storageState();
    fs.writeFileSync(SESSION_PATH, JSON.stringify(finalStorage, null, 2));

    console.log(`\n完了: ✓${ok} ✗${fail} | 累計: ${Object.keys(state.posted).length} / ${allDrafts.length}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
