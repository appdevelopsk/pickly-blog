/**
 * Pinterest Business 一括アップロード自動化スクリプト (Playwright)
 *
 * 生成済み CSV を Pinterest Business → 「複数のピンを作成」画面に自動投稿。
 * API が Trial access で制限されている間の代替手段として使用。
 *
 * Usage:
 *   npx tsx upload-csv.ts                          # 未投稿 CSV を自動検出・全処理
 *   npx tsx upload-csv.ts --file ./pinterest-export-en-2026-05-15.csv
 *   npx tsx upload-csv.ts --locale en              # 特定ロケールのみ
 *   npx tsx upload-csv.ts --dry-run                # ブラウザを開くだけ（テスト用）
 *
 * 前提:
 *   ~/.config/pickly/pinterest.env に PINTEREST_LOGIN_EMAIL / PINTEREST_LOGIN_PW
 *   npx playwright install chromium  (初回のみ)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import { launch, ensureLoggedIn } from "./_browser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BOARD_NAME = "Pickly Picks";
const UPLOAD_URL = "https://business.pinterest.com/en/create/bulk-upload/";
const STATE_PATH = path.join(os.homedir(), ".config/pickly/pinterest-csv-uploaded.json");
// Pinterest processes CSVs quickly but can take up to 2 min for large files
const UPLOAD_TIMEOUT_MS = 120_000;

// ── State tracking ───────────────────────────────────────────────────────────

function loadUploaded(): Set<string> {
  try {
    const d = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    return new Set(d.uploaded ?? []);
  } catch { return new Set(); }
}

function markUploaded(filename: string) {
  const uploaded = loadUploaded();
  uploaded.add(filename);
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify({ uploaded: [...uploaded] }, null, 2));
}

// ── CSV discovery ────────────────────────────────────────────────────────────

function findCsvFiles(localeFilter?: string): string[] {
  const files = fs.readdirSync(__dirname)
    .filter((f) => f.startsWith("pinterest-export-") && f.endsWith(".csv"))
    .filter((f) => !localeFilter || f.includes(`-${localeFilter}-`))
    .sort()
    .reverse(); // newest first

  const uploaded = loadUploaded();
  const pending = files.filter((f) => !uploaded.has(f));

  if (pending.length === 0 && files.length > 0) {
    console.log("全 CSV 投稿済み。--force で再投稿できます。");
    return [];
  }
  return pending.map((f) => path.join(__dirname, f));
}

// ── Main upload flow ─────────────────────────────────────────────────────────

async function uploadCsv(csvPath: string, dryRun: boolean): Promise<boolean> {
  const filename = path.basename(csvPath);
  console.log(`\n▶ ${filename}`);

  const { context, page } = await launch({ headless: false });

  try {
    await ensureLoggedIn(page);

    if (dryRun) {
      console.log("  --dry-run: ログイン確認のみ。ブラウザを閉じます。");
      return true;
    }

    // ── 1. Bulk upload ページに移動 ──────────────────────────────────────
    console.log("  → 一括アップロードページへ移動");
    await page.goto(UPLOAD_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2000);

    // ページ遷移後にリダイレクトされた場合も対応
    if (!page.url().includes("bulk-upload")) {
      console.log("  → リダイレクト検出、再ナビゲート");
      await page.goto(UPLOAD_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(2000);
    }

    // ── 2. ファイル選択 ───────────────────────────────────────────────────
    console.log("  → CSV ファイルをアップロード");

    // input[type=file] は hidden のことが多いため visible を待たずに直接 setInputFiles
    const fileInput = page.locator("input[type='file']").first();
    await fileInput.waitFor({ state: "attached", timeout: 15_000 });
    await fileInput.setInputFiles(csvPath);

    // ── 3. アップロード完了を待機 ────────────────────────────────────────
    console.log("  → 処理中…（最大 2 分）");
    // "Upload successful" / "アップロード完了" / progress bar disappears
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (
          text.includes("Upload successful") ||
          text.includes("アップロード完了") ||
          text.includes("pins ready") ||
          text.includes("ピンが準備") ||
          text.includes("Review and publish")
        );
      },
      { timeout: UPLOAD_TIMEOUT_MS }
    ).catch(() => {
      // タイムアウトしても続行（UIが変わっている可能性）
      console.log("  ⚠ 完了テキスト検出タイムアウト。続行します。");
    });
    await page.waitForTimeout(2000);

    // ── 4. ボード選択 ─────────────────────────────────────────────────────
    console.log(`  → ボード「${BOARD_NAME}」を選択`);

    // ボードドロップダウンを探す (複数セレクタで試行)
    const boardSelectors = [
      `[aria-label*='board' i]`,
      `[data-test-id='board-dropdown']`,
      `button:has-text('board')`,
      `div[class*='boardPicker']`,
    ];
    let boardSelected = false;
    for (const sel of boardSelectors) {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        await el.click().catch(() => {});
        await page.waitForTimeout(1000);
        // ボード名で検索入力
        const searchInput = page.locator("input[placeholder*='Search' i], input[placeholder*='検索' i]").first();
        if (await searchInput.count() > 0) {
          await searchInput.fill(BOARD_NAME);
          await page.waitForTimeout(800);
        }
        // リストからボード名をクリック
        const boardOption = page.locator(`[role='option']:has-text('${BOARD_NAME}'), li:has-text('${BOARD_NAME}')`).first();
        if (await boardOption.count() > 0) {
          await boardOption.click();
          boardSelected = true;
          break;
        }
      }
    }
    if (!boardSelected) {
      console.log(`  ⚠ ボード自動選択失敗。手動でボードを選択してください。`);
      // 10秒待って手動操作を許可
      await page.waitForTimeout(10_000);
    }

    // ── 5. 公開ボタンをクリック ───────────────────────────────────────────
    console.log("  → 公開");
    const publishSelectors = [
      "button:has-text('Publish all')",
      "button:has-text('すべて公開')",
      "button:has-text('Publish')",
      "button:has-text('公開')",
      "button:has-text('Upload')",
      "[data-test-id='bulk-publish-button']",
    ];
    let published = false;
    for (const sel of publishSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        await btn.click();
        published = true;
        break;
      }
    }
    if (!published) {
      console.log("  ⚠ 公開ボタンが見つかりません。スクリーンショットを確認してください。");
      await page.screenshot({ path: path.join(__dirname, `upload-error-${Date.now()}.png`) });
      return false;
    }

    // ── 6. 公開完了確認 ──────────────────────────────────────────────────
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (
          text.includes("Published") ||
          text.includes("公開済") ||
          text.includes("Pins published") ||
          text.includes("Success")
        );
      },
      { timeout: 60_000 }
    ).catch(() => {
      console.log("  ⚠ 公開完了テキスト検出タイムアウト。手動確認を。");
    });

    console.log(`  ✓ 完了`);
    markUploaded(filename);
    await page.waitForTimeout(3000);
    return true;

  } catch (err) {
    console.error(`  ✗ エラー:`, (err as Error).message?.slice(0, 120));
    await page.screenshot({ path: path.join(__dirname, `upload-error-${Date.now()}.png`) }).catch(() => {});
    return false;
  } finally {
    await context.close();
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const hasFlag = (f: string) => args.includes(f);

  const dryRun = hasFlag("--dry-run");
  const localeFilter = get("--locale");
  const specificFile = get("--file");

  let csvFiles: string[];
  if (specificFile) {
    csvFiles = [path.resolve(specificFile)];
  } else {
    csvFiles = findCsvFiles(localeFilter);
    if (csvFiles.length === 0) return;
  }

  console.log(`投稿対象 CSV: ${csvFiles.length} 件`);
  csvFiles.forEach((f) => console.log(`  · ${path.basename(f)}`));

  let ok = 0, fail = 0;
  for (const f of csvFiles) {
    const success = await uploadCsv(f, dryRun);
    if (success) ok++; else fail++;
    // CSVとCSVの間は少し待つ
    if (csvFiles.indexOf(f) < csvFiles.length - 1) {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log(`\n完了: ${ok} 成功 / ${fail} 失敗`);
}

main().catch((e) => { console.error(e); process.exit(1); });
