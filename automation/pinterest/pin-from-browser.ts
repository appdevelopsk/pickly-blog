/**
 * Playwright-based Pinterest pin poster — organic pins via pin-builder UI.
 *
 * pins.yaml の board フィールドでジャンル別アカウントに自動振り分け。
 * 各アカウントのセッションは独立して管理される。
 *
 * Usage:
 *   npx tsx pin-from-browser.ts                  # 全ジャンル、未投稿を 5 件ずつ
 *   npx tsx pin-from-browser.ts --limit 10
 *   npx tsx pin-from-browser.ts --genre fitness  # fitnesアカウントのみ
 *   npx tsx pin-from-browser.ts --locale ja
 *   npx tsx pin-from-browser.ts --dry-run
 *
 * State: ~/.config/pickly/pinterest-browser-posted.json
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
import { launch, ensureLoggedIn } from "./_browser.js";
import { resolveAccount, loadAccountCreds, ACCOUNTS } from "./accounts.js";
import type { Page } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PINS_PATH = path.resolve(__dirname, "pins.yaml");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/pinterest-browser-posted.json");
const SITE_URL = "https://pickly.blog";
const SLEEP_BETWEEN_PINS_MS = 15_000;

interface Pin {
  pin_id: string;
  article_slug?: string;
  locale: string;
  variant: string;
  title: string;
  description: string;
  link: string;
  image_alt?: string;
  hashtags?: string[];
  board?: string;
}

interface PinsYaml { pins: Pin[] }

// ── State ────────────────────────────────────────────────────────────────────

function loadPosted(): Set<string> {
  try { return new Set((JSON.parse(fs.readFileSync(STATE_PATH, "utf8")).posted ?? [])); }
  catch { return new Set(); }
}

function markPosted(pinId: string) {
  const posted = loadPosted();
  posted.add(pinId);
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify({ posted: [...posted] }, null, 2));
}

// ── Pinterest UI helpers ──────────────────────────────────────────────────────

async function dismissOnboarding(page: Page) {
  // まず Escape で一括クローズを試みる
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // 残っていれば × ボタン or Next でスキップ
  for (let i = 0; i < 6; i++) {
    const modal = page.locator("[role='dialog'], [data-test-id*='modal'], [class*='Modal']").first();
    if (await modal.count() === 0) break;

    // × / Close ボタン優先
    const closeBtn = page.locator(
      "button[aria-label='Close'], button[aria-label='閉じる'], " +
      "button[data-test-id='close-button'], button:has(svg[aria-label='Close']), " +
      "div[role='dialog'] button:last-child"
    ).first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(600);
      continue;
    }

    // Next / Get started / Take Tour で進める
    const nextBtn = page.locator(
      "button:has-text('Next'), button:has-text('Get started'), " +
      "button:has-text('Take Tour'), button:has-text('Done'), " +
      "button:has-text('Start'), button:has-text('Skip')"
    ).first();
    if (await nextBtn.count() > 0) {
      await nextBtn.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(700);
    } else {
      break;
    }
  }
}

async function selectBoard(page: Page, boardName: string): Promise<boolean> {
  // ボードドロップダウン/検索の複数パターン
  const triggers = [
    "button[data-test-id='board-dropdown-select-button']",
    "[data-test-id='board-selector']",
    "div[data-test-id*='board']",
    "button:has-text('Choose a board')",
    "button:has-text('ボードを選択')",
    "button:has-text('Select a board')",
    "[class*='boardDropdown'] button",
    "[class*='BoardSelector'] button",
  ];

  for (const sel of triggers) {
    const el = page.locator(sel).first();
    if (await el.count() > 0) {
      const clicked = await el.click({ timeout: 4000 }).then(() => true).catch(() => false);
      if (clicked) { await page.waitForTimeout(800); break; }
    }
  }

  // ボード名で検索
  const searchInput = page.locator("input[placeholder*='Search' i], input[placeholder*='検索' i], input[placeholder*='board' i]").first();
  if (await searchInput.count() > 0) {
    await searchInput.fill(boardName);
    await page.waitForTimeout(600);
  }

  // リストからボードを選択
  const boardOption = page.locator(`[role='option']:has-text('${boardName}'), li:has-text('${boardName}'), div:has-text('${boardName}')`).first();
  if (await boardOption.count() > 0) {
    await boardOption.click();
    return true;
  }

  return false;
}

// ── Single pin creation ───────────────────────────────────────────────────────

async function postPin(page: Page, pin: Pin, boardName: string): Promise<boolean> {
  const slug = pin.article_slug ?? ((pin.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? pin.pin_id;
  const imageUrl = `${SITE_URL}/og/${slug}-${pin.locale}.png`;
  const articleUrl = pin.link.startsWith("http") ? pin.link : `${SITE_URL}${pin.link}`;

  // pin-builder に URL + image パラメータを渡して遷移
  const builderUrl =
    `https://www.pinterest.com/pin-builder/` +
    `?url=${encodeURIComponent(articleUrl)}` +
    `&media=${encodeURIComponent(imageUrl)}` +
    `&description=${encodeURIComponent(pin.description.slice(0, 500))}`;

  await page.goto(builderUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(3000);

  // オンボーディングモーダルを閉じる
  await dismissOnboarding(page);
  await page.waitForTimeout(1000);

  // スクリーンショット (デバッグ用)
  const ss = path.join(__dirname, `pin-debug-${Date.now()}.png`);
  await page.screenshot({ path: ss });

  // タイトル入力
  const titleInput = page.locator("input[placeholder*='Title' i], input[placeholder*='タイトル' i], textarea[placeholder*='Title' i]").first();
  if (await titleInput.count() > 0) {
    await titleInput.clear();
    await titleInput.fill(pin.title.slice(0, 100));
  }

  // 説明入力（既に URL パラメータで入力済みの場合もある）
  const descInput = page.locator("textarea[placeholder*='Description' i], textarea[placeholder*='説明' i], div[contenteditable][data-test-id*='description']").first();
  if (await descInput.count() > 0) {
    const existing = await descInput.inputValue().catch(() => "");
    if (!existing) {
      await descInput.fill(pin.description.slice(0, 500));
    }
  }

  // リンク入力
  const linkInput = page.locator("input[placeholder*='link' i], input[placeholder*='URL' i], input[placeholder*='リンク' i]").first();
  if (await linkInput.count() > 0) {
    await linkInput.clear();
    await linkInput.fill(articleUrl);
  }

  // ボード選択
  await selectBoard(page, boardName);
  await page.waitForTimeout(800);

  // 公開ボタン
  const publishBtn = page.locator(
    "button:has-text('Publish'), button:has-text('公開'), button:has-text('Save'), " +
    "button:has-text('保存'), [data-test-id='pin-draft-save-button']"
  ).first();
  if (await publishBtn.count() === 0) {
    console.log(`  ⚠ 公開ボタンが見つからない。スクリーンショット: ${ss}`);
    return false;
  }
  await publishBtn.click();

  // 公開完了を待機
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      return text.includes("saved") || text.includes("Saved") || text.includes("保存") ||
             text.includes("published") || text.includes("Published");
    },
    { timeout: 30_000 }
  ).catch(() => {
    console.log("  ⚠ 完了テキスト検出タイムアウト");
  });

  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const limit = parseInt(get("--limit") ?? "5", 10);
  const localeFilter = get("--locale");
  const genreFilter = get("--genre");
  const dryRun = args.includes("--dry-run");

  const raw = fs.readFileSync(PINS_PATH, "utf8");
  const data = yaml.load(raw) as PinsYaml;
  let pins = data.pins ?? [];

  if (localeFilter) pins = pins.filter((p) => p.locale === localeFilter);

  const posted = loadPosted();
  pins = pins.filter((p) => !posted.has(p.pin_id));

  // ジャンル別にピンをグループ化
  const accountPins = new Map<string, Pin[]>();
  for (const pin of pins) {
    const account = resolveAccount(pin.board);
    if (genreFilter && account.genre !== genreFilter) continue;
    const key = account.genre;
    if (!accountPins.has(key)) accountPins.set(key, []);
    accountPins.get(key)!.push(pin);
  }

  if (dryRun) {
    let total = 0;
    for (const [genre, gPins] of accountPins) {
      const account = ACCOUNTS.find((a) => a.genre === genre)!;
      const creds = loadAccountCreds(account);
      console.log(`\n[${genre}] → ボード: ${creds.boardName} (${gPins.length} 件)`);
      for (const p of gPins.slice(0, limit)) {
        const slug = p.article_slug ?? ((p.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? p.pin_id;
        console.log(`  [${p.pin_id}] ${p.title.slice(0, 60)}`);
        console.log(`    image: ${SITE_URL}/og/${slug}-${p.locale}.png`);
        total++;
      }
    }
    console.log(`\n合計 dry-run: ${total} 件`);
    return;
  }

  let totalOk = 0, totalFail = 0;

  for (const [genre, gPins] of accountPins) {
    const account = ACCOUNTS.find((a) => a.genre === genre)!;
    const creds = loadAccountCreds(account);

    if (!creds.email || !creds.pw) {
      console.log(`\n⚠ [${genre}] 認証情報未設定、スキップ (${account.envFile})`);
      continue;
    }

    const targets = gPins.slice(0, limit);
    console.log(`\n${"═".repeat(55)}`);
    console.log(`▶ [${genre}] ${creds.email} → ボード: ${creds.boardName}`);
    console.log(`  対象: ${targets.length} 件 (残り ${gPins.length} 件)`);

    const { context, page } = await launch({
      headless: false,
      account: { sessionDir: account.sessionDir, envFile: account.envFile },
    });

    let ok = 0, fail = 0;

    try {
      await ensureLoggedIn(page, { account: { sessionDir: account.sessionDir, envFile: account.envFile } });

      for (const pin of targets) {
        console.log(`\n  ▷ [${pin.pin_id}] ${pin.title.slice(0, 50)}`);
        try {
          const success = await postPin(page, pin, creds.boardName);
          if (success) {
            markPosted(pin.pin_id);
            console.log(`    ✓ 完了`);
            ok++;
          } else {
            console.log(`    ✗ 失敗`);
            fail++;
          }
        } catch (err) {
          console.error(`    ✗ エラー:`, (err as Error).message?.slice(0, 100));
          await page.screenshot({ path: path.join(__dirname, `pin-error-${Date.now()}.png`) }).catch(() => {});
          fail++;
        }

        if (targets.indexOf(pin) < targets.length - 1) {
          console.log(`    ⏱ ${SLEEP_BETWEEN_PINS_MS / 1000}s 待機...`);
          await page.waitForTimeout(SLEEP_BETWEEN_PINS_MS);
        }
      }

      console.log(`  [${genre}] 完了: ✓${ok} ✗${fail}`);
      totalOk += ok;
      totalFail += fail;

    } finally {
      await context.close();
      fs.readdirSync(__dirname)
        .filter((f) => f.startsWith("pin-debug-"))
        .forEach((f) => fs.unlinkSync(path.join(__dirname, f)));
    }
  }

  console.log(`\n${"═".repeat(55)}`);
  console.log(`全体完了: ✓${totalOk} ✗${totalFail} | 累計: ${loadPosted().size} 件投稿済`);
}

main().catch((e) => { console.error(e); process.exit(1); });
