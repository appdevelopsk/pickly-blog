/**
 * Awin Not Applied 全件に一括 Join 申請
 *
 * 戦略:
 *   1. /merchant-directory/index/tab/notJoined/page/1 に navigate
 *   2. ページ上の全 span.partnership-button.join-button から data-merchantid を抽出
 *   3. 各 merchant に対して順次:
 *      a. span#action{id} click → #membershipModal 展開
 *      b. .termsContent を段階的スクロール
 *      c. #accepted を native click で check (jQuery handler 発火)
 *      d. #membershipModal button.modal_save click → form submit
 *      e. モーダル閉じるのを待つ + 次のページ再読込
 *   4. ページが空になる or "Not Applied (0)" になるまで繰り返す
 *   5. ログを ~/.config/pickly/awin-applied.json に記録
 *
 * Usage: npm run awin:bulk-apply
 */
import { launch, loadCredentials, ensureLoggedIn, PUBLISHER_ID } from "./_browser";
import type { Page } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const LOG_FILE = path.join(os.homedir(), ".config/pickly/awin-applied.json");
const DIRECTORY_URL = `https://ui.awin.com/awin/affiliate/${PUBLISHER_ID}/merchant-directory/index/tab/notJoined/page/1`;

interface AppliedRecord {
  merchantId: string;
  name: string;
  timestamp: string;
  result: "success" | "failed" | "skipped";
  error?: string;
}

function loadLog(): AppliedRecord[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveLog(records: AppliedRecord[]) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(records, null, 2));
}

async function applyToMerchant(page: Page, merchantId: string, name: string): Promise<{ ok: boolean; error?: string }> {
  // span#action{id} click
  const span = page.locator(`span#action${merchantId}.join-button`).first();
  if ((await span.count()) === 0) {
    return { ok: false, error: "span not found" };
  }
  await span.click().catch((e) => {
    throw new Error(`span click: ${e.message?.slice(0, 80)}`);
  });

  // モーダル展開待ち
  try {
    await page.locator("#membershipModal").waitFor({ state: "visible", timeout: 8000 });
  } catch {
    return { ok: false, error: "modal not visible" };
  }
  await page.waitForTimeout(1200);

  // T&C スクロール (段階)
  await page.evaluate(async () => {
    const terms = document.querySelector(".termsContent.max-height-md") as HTMLElement | null;
    if (!terms) return;
    const max = terms.scrollHeight;
    for (let i = 0; i <= 30; i++) {
      terms.scrollTop = (max * i) / 30;
      terms.dispatchEvent(new Event("scroll", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 25));
    }
    terms.scrollTop = max;
    terms.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await page.waitForTimeout(500);

  // checkbox native click
  const checked = await page.evaluate(() => {
    const cb = document.querySelector("#accepted") as HTMLInputElement | null;
    if (!cb) return false;
    cb.click();
    return cb.checked;
  });
  if (!checked) return { ok: false, error: "checkbox not checked" };
  await page.waitForTimeout(800);

  // submit
  const submitBtn = page.locator("#membershipModal button.modal_save").first();
  if ((await submitBtn.count()) === 0) return { ok: false, error: "submit btn not found" };
  await submitBtn.click({ force: true }).catch((e) => {
    throw new Error(`submit click: ${e.message?.slice(0, 80)}`);
  });

  // モーダルが閉じるのを待つ (最大10秒)
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const visible = await page.locator("#membershipModal").isVisible().catch(() => false);
    if (!visible) {
      return { ok: true };
    }
  }
  return { ok: false, error: "modal did not close after submit" };
}

async function getMerchantsOnPage(page: Page): Promise<Array<{ id: string; name: string }>> {
  return page.evaluate(() => {
    const out: Array<{ id: string; name: string }> = [];
    document.querySelectorAll("span.partnership-button.join-button").forEach((el) => {
      const mid = el.getAttribute("data-merchantid") || "";
      const tr = el.closest("tr");
      const a = tr?.querySelector(".name a") as HTMLAnchorElement | null;
      const name = (a?.textContent || "").trim();
      if (mid && name) out.push({ id: mid, name });
    });
    return out;
  });
}

async function getRemainingCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const h1 = Array.from(document.querySelectorAll("h1")).find((h) => /Not Applied/.test(h.textContent || ""));
    const m = h1?.textContent?.match(/Not Applied \((\d+)\)/);
    return m ? parseInt(m[1], 10) : -1;
  });
}

async function main() {
  const creds = loadCredentials();
  const { context, page } = await launch({ headless: false });
  const log: AppliedRecord[] = loadLog();
  const alreadyDone = new Set(log.filter((l) => l.result === "success").map((l) => l.merchantId));

  console.log("→ ログイン (target=directory)");
  await ensureLoggedIn(page, creds, DIRECTORY_URL);
  await page.waitForTimeout(5000);

  // ページサイズを 40 に変更 (option 40)
  await page.evaluate(() => {
    const sel = document.querySelector("select") as HTMLSelectElement | null;
    if (sel && Array.from(sel.options).some((o) => o.value === "40")) {
      sel.value = "40";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await page.waitForTimeout(3500);

  let totalApplied = 0;
  let totalFailed = 0;

  while (true) {
    const remaining = await getRemainingCount(page);
    console.log(`\n=== Not Applied: ${remaining} 件 ===`);
    if (remaining === 0 || remaining === -1) break;

    const merchants = await getMerchantsOnPage(page);
    if (merchants.length === 0) {
      console.log("ページに merchant 無し — 終了");
      break;
    }

    console.log(`このページの merchants: ${merchants.length}`);

    // ページ snapshot から1件処理 → directory 再 navigate して fresh state にする
    const m = merchants.find((mm) => !alreadyDone.has(mm.id));
    if (!m) {
      console.log("全件 already done — 終了");
      break;
    }

    process.stdout.write(`  → ${m.name} (${m.id}) ... `);
    const result = await applyToMerchant(page, m.id, m.name).catch((e) => ({
      ok: false,
      error: (e as Error).message?.slice(0, 100),
    }));

    const record: AppliedRecord = {
      merchantId: m.id,
      name: m.name,
      timestamp: new Date().toISOString(),
      result: result.ok ? "success" : "failed",
      error: result.error,
    };
    log.push(record);
    saveLog(log);

    if (result.ok) {
      alreadyDone.add(m.id);
      totalApplied++;
      process.stdout.write("✓\n");
    } else {
      totalFailed++;
      alreadyDone.add(m.id); // 失敗もスキップ対象 (再試行しない)
      process.stdout.write(`✗ ${result.error}\n`);
    }

    // 1件処理ごとに directory に navigate しなおす (POST 後の遷移をリセット)
    await page.goto(DIRECTORY_URL, { waitUntil: "domcontentloaded" }).catch(() => {});
    await page.waitForTimeout(2500);

    // page size 40 に再設定 (毎回戻る)
    await page.evaluate(() => {
      const sel = document.querySelector("select") as HTMLSelectElement | null;
      if (sel && Array.from(sel.options).some((o) => o.value === "40")) {
        sel.value = "40";
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }).catch(() => {});
    await page.waitForTimeout(2500);
  }

  console.log("\n========================================");
  console.log(`✓ 申請成功: ${totalApplied} 件`);
  console.log(`✗ 失敗: ${totalFailed} 件`);
  console.log(`ログ: ${LOG_FILE}`);
  console.log("========================================");

  await page.waitForTimeout(5000);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
